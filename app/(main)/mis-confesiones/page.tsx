import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

const ESTADOS: Record<
  string,
  { label: string; emoji: string; clases: string }
> = {
  pendiente: {
    label: "En revisión",
    emoji: "⏳",
    clases: "text-neon bg-neon/10 border-neon/30",
  },
  aprobada: {
    label: "Publicada",
    emoji: "✅",
    clases: "text-exito bg-exito/10 border-exito/30",
  },
  rechazada: {
    label: "Rechazada",
    emoji: "❌",
    clases: "text-error bg-error/10 border-error/30",
  },
};

export default async function MisConfesionesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Mis confesiones
  const { data: confesiones, error } = await supabase
    .from("confesiones")
    .select(
      `
      id,
      titulo,
      contenido,
      estado,
      anonima,
      motivo_rechazo,
      creado_en
    `
    )
    .eq("user_id", user.id)
    .order("creado_en", { ascending: false });

  // Conteos por confesión
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

  const { data: vistas } = ids.length
    ? await supabase
        .from("vistas")
        .select("confesion_id")
        .in("confesion_id", ids)
    : { data: [] };

  const contar = (arr: { confesion_id: string }[] | null, id: string) =>
    arr?.filter((x) => x.confesion_id === id).length ?? 0;

  const formatearFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <main className="min-h-screen py-10 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-black gradient-animated">
              Mis confesiones
            </h1>
            <p className="text-sm text-texto-suave mt-2">
              Tus secretos mejor guardados 🤫
            </p>
          </div>

          <Link
            href="/confesiones/nueva"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-marca to-rosa text-white font-semibold hover:from-marca-hover hover:to-rosa-hover transition-all hover:scale-105 shadow-lg shadow-marca/20"
          >
            + Nueva
          </Link>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-error/10 border border-error/30 text-error text-sm">
            Error: {error.message}
          </div>
        )}

        {/* Estado vacío */}
        {!confesiones?.length && !error && (
          <div className="text-center py-20 bg-fondo-card border border-borde rounded-2xl">
            <div className="text-6xl mb-4">🤫</div>
            <h2 className="text-xl font-bold text-texto">
              Aún no has confesado nada
            </h2>
            <p className="text-sm text-texto-suave mt-2 mb-6">
              Es momento de soltar ese secreto 👀
            </p>
            <Link
              href="/confesiones/nueva"
              className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-marca to-rosa text-white font-semibold hover:from-marca-hover hover:to-rosa-hover transition"
            >
              Crear mi primera confesión
            </Link>
          </div>
        )}

        {/* Lista */}
        <div className="grid gap-4">
          {confesiones?.map((c) => {
            const estado = ESTADOS[c.estado] ?? ESTADOS.pendiente;

            return (
              <div
                key={c.id}
                className="group bg-fondo-card border border-borde rounded-2xl p-6 hover:border-marca/30 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-marca/5 rounded-full blur-2xl pointer-events-none" />

                <div className="relative">

                  {/* Header: estado + fecha + anónima */}
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span
                      className={`
                        text-xs font-semibold px-2.5 py-1 rounded-full border
                        ${estado.clases}
                      `}
                    >
                      {estado.emoji} {estado.label}
                    </span>
                    {c.anonima && (
                      <span className="text-xs text-texto-suave">🤫 Anónima</span>
                    )}
                    <span className="text-xs text-texto-suave ml-auto">
                      {formatearFecha(c.creado_en)}
                    </span>
                  </div>

                  {/* Título */}
                  <h2 className="text-xl font-bold text-texto group-hover:text-marca transition-colors">
                    {c.titulo}
                  </h2>

                  {/* Contenido */}
                  <p className="text-sm text-texto-suave mt-2 leading-relaxed line-clamp-3">
                    {c.contenido}
                  </p>

                  {/* Motivo de rechazo */}
                  {c.estado === "rechazada" && c.motivo_rechazo && (
                    <div className="mt-3 p-3 rounded-lg bg-error/10 border border-error/30">
                      <p className="text-xs text-error">
                        <strong>Motivo:</strong> {c.motivo_rechazo}
                      </p>
                      <p className="text-xs text-texto-suave mt-1">
                        Puedes editarla y volver a enviarla
                      </p>
                    </div>
                  )}

                  {/* Estadísticas */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-borde text-xs text-texto-suave">
                    <span className="flex items-center gap-1.5">
                      👁️ {contar(vistas, c.id)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      ❤️ {contar(reacciones, c.id)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      💬 {contar(comentarios, c.id)}
                    </span>

                    {/* Acciones */}
                    <div className="ml-auto flex items-center gap-2">
                      {c.estado === "aprobada" && (
                        <Link
                          href={`/confesiones/${c.id}`}
                          className="text-xs text-marca hover:text-rosa transition"
                        >
                          Ver →
                        </Link>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </main>
  );
}