import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CommentForm from "@/components/CommentForm";
import Reacciones from "@/components/Reacciones";

export const revalidate = 0;

export default async function ConfesionDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Traer la confesión
  const { data: confesion, error } = await supabase
    .from("confesiones")
    .select(
      `
      id,
      titulo,
      contenido,
      anonima,
      creado_en,
      imagen_url,
      estado,
      user_id,
      profiles:user_id ( username )
    `
    )
    .eq("id", id)
    .single();

  if (error || !confesion) notFound();

  // Traer comentarios con autor
  const { data: comentarios } = await supabase
    .from("comentarios")
    .select(
      `
      id,
      contenido,
      creado_en,
      profiles:user_id ( username )
    `
    )
    .eq("confesion_id", id)
    .order("creado_en", { ascending: true });

  // Traer conteo de reacciones
  const { count: totalReacciones } = await supabase
    .from("reacciones")
    .select("*", { count: "exact", head: true })
    .eq("confesion_id", id);

  // 👁️ Registrar vista (silencioso)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("vistas").insert({
    confesion_id: id,
    user_id: user?.id ?? null,
  });

  // Conteo de vistas
  const { count: totalVistas } = await supabase
    .from("vistas")
    .select("*", { count: "exact", head: true })
    .eq("confesion_id", id);

  const perfil = Array.isArray(confesion.profiles)
    ? confesion.profiles[0]
    : confesion.profiles;

  const autor = confesion.anonima
    ? "Anónimo"
    : `@${perfil?.username ?? "usuario"}`;

  const inicial = confesion.anonima
    ? "?"
    : (perfil?.username?.[0]?.toUpperCase() ?? "?");

  const fechaCompleta = new Date(confesion.creado_en).toLocaleDateString(
    "es-ES",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return (
    <main className="min-h-screen py-10 px-6">
      <div className="max-w-3xl mx-auto">

        {/* Volver */}
        <Link
          href="/confesiones"
          className="inline-flex items-center gap-2 text-sm text-texto-suave hover:text-marca transition mb-8"
        >
          ← Volver a confesiones
        </Link>

        {/* Card principal */}
        <article className="bg-fondo-card border border-borde rounded-2xl p-8 shadow-2xl shadow-marca/5 relative overflow-hidden">

          <div className="absolute top-0 right-0 w-40 h-40 bg-marca/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">

            {/* Autor */}
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-bold flex-shrink-0
                  ${
                    confesion.anonima
                      ? "bg-fondo border border-borde text-texto-suave"
                      : "bg-gradient-to-br from-marca to-rosa text-white"
                  }
                `}
              >
                {inicial}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-texto flex items-center gap-2">
                  {autor}
                  {confesion.anonima && <span title="Anónima">🤫</span>}
                </p>
                <p className="text-xs text-texto-suave">{fechaCompleta}</p>
              </div>
            </div>

            {/* Título */}
            <h1 className="text-3xl md:text-4xl font-black text-texto leading-tight">
              {confesion.titulo}
            </h1>

            {/* Contenido */}
            <div className="mt-6 text-texto leading-relaxed whitespace-pre-wrap">
              {confesion.contenido}
            </div>

            {/* Imagen */}
            {confesion.imagen_url && (
              <div className="mt-6 rounded-xl overflow-hidden border border-borde">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={confesion.imagen_url}
                  alt={confesion.titulo}
                  className="w-full h-auto"
                />
              </div>
            )}

            {/* Estadísticas */}
            <div className="flex items-center gap-5 mt-8 pt-6 border-t border-borde text-sm text-texto-suave">
              <span className="flex items-center gap-2">
                👁️ {totalVistas ?? 0} vistas
              </span>
              <span className="flex items-center gap-2">
                ❤️ {totalReacciones ?? 0} reacciones
              </span>
              <span className="flex items-center gap-2">
                💬 {comentarios?.length ?? 0} comentarios
              </span>
            </div>
                            {/* Reacciones */}
            <div className="mt-6">
              <Reacciones confesionId={confesion.id} />
            </div>
          </div>
        </article>

        {/* Comentarios */}
        <section className="mt-10">
          <h2 className="text-2xl font-bold text-texto mb-6">
            💬 Comentarios ({comentarios?.length ?? 0})
          </h2>

          {/* Lista de comentarios */}
          {!comentarios?.length ? (
            <div className="bg-fondo-card border border-borde rounded-2xl p-8 text-center">
              <p className="text-sm text-texto-suave">
                Aún no hay comentarios. ¡Sé el primero!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {comentarios.map((c) => {
                const perfilC = Array.isArray(c.profiles)
                  ? c.profiles[0]
                  : c.profiles;
                const username = perfilC?.username ?? "usuario";
                const inicialC = username[0]?.toUpperCase() ?? "?";

                return (
                  <div
                    key={c.id}
                    className="bg-fondo-card border border-borde rounded-xl p-4 flex gap-3"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-marca to-rosa flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {inicialC}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <p className="text-sm font-semibold text-texto">
                          @{username}
                        </p>
                        <p className="text-xs text-texto-suave">
                          {new Date(c.creado_en).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                      <p className="text-sm text-texto-suave mt-1 whitespace-pre-wrap">
                        {c.contenido}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Formulario para comentar */}
          <div className="mt-6">
            <CommentForm confesionId={id} />
          </div>

        </section>

      </div>
    </main>
  );
}