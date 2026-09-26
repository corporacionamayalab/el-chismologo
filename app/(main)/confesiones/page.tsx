import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function ConfesionesPage() {
  const supabase = await createClient();

  // Traer confesiones aprobadas con datos del autor
  const { data: confesiones, error } = await supabase
    .from("confesiones")
    .select(
      `
      id,
      titulo,
      contenido,
      anonima,
      creado_en,
      imagen_url,
      profiles:user_id ( username )
    `
    )
    .eq("estado", "aprobada")
    .order("creado_en", { ascending: false })
    .limit(50);

  // Traer conteo de comentarios y reacciones por confesión
  const ids = confesiones?.map((c) => c.id) ?? [];

  const { data: comentarios } = ids.length
    ? await supabase
        .from("comentarios")
        .select("confesion_id")
        .in("confesion_id", ids)
    : { data: [] };

  const { data: reacciones } = ids.length
    ? await supabase
        .from("reacciones")
        .select("confesion_id")
        .in("confesion_id", ids)
    : { data: [] };

  const contar = (arr: { confesion_id: string }[] | null, id: string) =>
    arr?.filter((x) => x.confesion_id === id).length ?? 0;

  const formatearFecha = (fecha: string) => {
    const d = new Date(fecha);
    const ahora = new Date();
    const diff = Math.floor((ahora.getTime() - d.getTime()) / 1000);

    if (diff < 60) return "hace un momento";
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
    if (diff < 604800) return `hace ${Math.floor(diff / 86400)} d`;

    return d.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <main className="min-h-screen py-10 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Header de sección */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-black gradient-animated">
              Confesiones
            </h1>
            <p className="text-sm text-texto-suave mt-2">
              Lo que todos quieren saber 👀
            </p>
          </div>

          <Link
            href="/confesiones/nueva"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-marca to-rosa text-white font-semibold hover:from-marca-hover hover:to-rosa-hover transition-all hover:scale-105 shadow-lg shadow-marca/20"
          >
            + Confesar
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-error/10 border border-error/30 text-error text-sm">
            Error al cargar confesiones: {error.message}
          </div>
        )}

        {/* Estado vacío */}
        {!confesiones?.length && !error && (
          <div className="text-center py-20 bg-fondo-card border border-borde rounded-2xl">
            <div className="text-6xl mb-4">🤫</div>
            <h2 className="text-xl font-bold text-texto">
              Aún no hay confesiones
            </h2>
            <p className="text-sm text-texto-suave mt-2 mb-6">
              Sé el primero en confesar algo 👀
            </p>
            <Link
              href="/confesiones/nueva"
              className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-marca to-rosa text-white font-semibold hover:from-marca-hover hover:to-rosa-hover transition"
            >
              Crear la primera
            </Link>
          </div>
        )}

        {/* Lista */}
        <div className="grid gap-4">
          {confesiones?.map((c) => {
            const perfil = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
            const autor = c.anonima
              ? "Anónimo"
              : `@${perfil?.username ?? "usuario"}`;
            const inicial = c.anonima ? "?" : (perfil?.username?.[0]?.toUpperCase() ?? "?");

            return (
              <Link
                key={c.id}
                href={`/confesiones/${c.id}`}
                className="group bg-fondo-card border border-borde rounded-2xl p-6 hover:border-marca/50 hover:bg-fondo-card-hover transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden"
              >
                {/* Glow al hover */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-marca/5 rounded-full blur-2xl group-hover:bg-marca/10 transition-all pointer-events-none" />

                <div className="relative">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0
                        ${
                          c.anonima
                            ? "bg-fondo border border-borde text-texto-suave"
                            : "bg-gradient-to-br from-marca to-rosa text-white"
                        }
                      `}
                    >
                      {inicial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-texto truncate">
                        {autor}
                      </p>
                      <p className="text-xs text-texto-suave">
                        {formatearFecha(c.creado_en)}
                      </p>
                    </div>
                    {c.anonima && (
                      <span className="text-xl" title="Anónima">
                        🤫
                      </span>
                    )}
                  </div>

                  {/* Título */}
                  <h2 className="text-xl font-bold text-texto group-hover:text-marca transition-colors">
                    {c.titulo}
                  </h2>

                  {/* Contenido (2 líneas) */}
                  <p className="text-sm text-texto-suave mt-2 leading-relaxed line-clamp-2">
                    {c.contenido}
                  </p>

                  {/* Footer con estadísticas */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-borde text-xs text-texto-suave">
                    <span className="flex items-center gap-1.5">
                      💬 {contar(comentarios, c.id)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      ❤️ {contar(reacciones, c.id)}
                    </span>
                    <span className="ml-auto text-marca group-hover:translate-x-1 transition-transform">
                      Leer →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </main>
  );
}