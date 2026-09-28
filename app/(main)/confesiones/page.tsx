import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";

export const revalidate = 0;

export default async function ConfesionesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const supabase = await createClient();

  const busqueda = q.trim();

  let query = supabase
    .from("confesiones")
    .select(
      `
      id,
      titulo,
      contenido,
      anonima,
      creado_en,
      imagen_url,
      profiles:user_id ( username, avatar_url )
    `
    )
    .eq("estado", "aprobada")
    .order("creado_en", { ascending: false })
    .limit(50);

  if (busqueda.length >= 2) {
    query = query.or(
      `titulo.ilike.%${busqueda}%,contenido.ilike.%${busqueda}%`
    );
  }

  const { data: confesiones, error } = await query;

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
        .select("confesion_id, tipo")
        .in("confesion_id", ids)
    : { data: [] };

  const contar = (arr: { confesion_id: string }[] | null, id: string) =>
    arr?.filter((x) => x.confesion_id === id).length ?? 0;

  const contarReaccion = (
    arr: { confesion_id: string; tipo: string }[] | null,
    id: string
  ) =>
    arr?.filter((x) => x.confesion_id === id).length ?? 0;

  const formatearFecha = (fecha: string) => {
    const d = new Date(fecha);
    const ahora = new Date();
    const diff = Math.floor((ahora.getTime() - d.getTime()) / 1000);

    if (diff < 60) return "ahora";
    if (diff < 3600) return `${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} d`;

    return d.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <main className="min-h-screen py-8 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">

        {/* Grid principal: contenido + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">

          {/* COLUMNA IZQUIERDA: Lista de confesiones */}
          <div className="min-w-0">

            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-black gradient-animated">
                  Confesiones
                </h1>
                <p className="text-xs text-texto-suave mt-1">
                  Lo que todos quieren saber 👀
                </p>
              </div>

              <Link
                href="/confesiones/nueva"
                className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-marca to-rosa text-white text-sm font-semibold hover:from-marca-hover hover:to-rosa-hover transition-all hover:scale-105 shadow-lg shadow-marca/20"
              >
                <span>+</span>
                <span className="hidden sm:inline">Confesar</span>
              </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b border-borde overflow-x-auto">
              <Link
                href="/confesiones"
                className="px-4 py-3 text-sm font-medium text-marca border-b-2 border-marca transition whitespace-nowrap"
              >
                Recientes
              </Link>
              
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 rounded-xl bg-error/10 border border-error/30 text-error text-sm mb-4">
                Error: {error.message}
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
                  className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-marca to-rosa text-white font-semibold hover:from-marca-hover hover:to-rosa-hover transition"
                >
                  Crear la primera
                </Link>
              </div>
            )}

            {/* Lista estilo Twitter */}
            <div className="divide-y divide-borde border-y border-borde">
              {confesiones?.map((c) => {
                const perfil = Array.isArray(c.profiles)
                  ? c.profiles[0]
                  : c.profiles;
                const username = perfil?.username ?? "usuario";
                const avatarUrl = perfil?.avatar_url;
                const autor = c.anonima ? "Anónimo" : `@${username}`;
                const inicial = c.anonima
                  ? "?"
                  : (username[0]?.toUpperCase() ?? "?");

                const totalComentarios = contar(comentarios, c.id);
                const totalReacciones = contarReaccion(reacciones, c.id);
                const esHot = totalReacciones >= 10;

                return (
                  <Link
                    key={c.id}
                    href={`/confesiones/${c.id}`}
                    className="block py-5 px-2 hover:bg-fondo-card/50 transition-all group"
                  >
                    <div className="flex gap-3">

                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {avatarUrl && !c.anonima ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={avatarUrl}
                            alt={username}
                            className="w-11 h-11 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            className={`
                              w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm
                              ${
                                c.anonima
                                  ? "bg-fondo border border-borde text-texto-suave"
                                  : "bg-gradient-to-br from-marca to-rosa text-white"
                              }
                            `}
                          >
                            {inicial}
                          </div>
                        )}
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 min-w-0">

                        {/* Header */}
                        <div className="flex items-center gap-1.5 text-sm flex-wrap">
                          <span className="font-bold text-texto truncate">
                            {autor}
                          </span>
                          {c.anonima && (
                            <span className="text-texto-suave text-xs">🤫</span>
                          )}
                          {esHot && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rosa/20 text-rosa border border-rosa/30">
                              🔥 HOT
                            </span>
                          )}
                          <span className="text-texto-suave text-xs">·</span>
                          <span className="text-texto-suave text-xs">
                            {formatearFecha(c.creado_en)}
                          </span>
                        </div>

                        <h2 className="text-base font-semibold text-texto mt-1.5 group-hover:text-marca transition-colors">
                          {c.titulo}
                        </h2>

                        <p className="text-sm text-texto-suave mt-1 leading-relaxed line-clamp-3">
                          {c.contenido}
                        </p>

                        {c.imagen_url && (
                          <div className="mt-3 rounded-2xl overflow-hidden border border-borde max-h-96">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={c.imagen_url}
                              alt={c.titulo}
                              className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500"
                            />
                          </div>
                        )}

                        {/* Barra de acciones */}
                        <div className="flex items-center justify-between mt-3 -ml-2 max-w-md">
                          <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-full text-xs text-texto-suave hover:text-marca hover:bg-marca/10 transition group/btn">
                            <span className="text-base group-hover/btn:scale-125 transition">
                              💬
                            </span>
                            <span>{totalComentarios || ""}</span>
                          </button>

                          <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-full text-xs text-texto-suave hover:text-rosa hover:bg-rosa/10 transition group/btn">
                            <span className="text-base group-hover/btn:scale-125 transition">
                              ❤️
                            </span>
                            <span>{totalReacciones || ""}</span>
                          </button>

                          <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-full text-xs text-texto-suave hover:text-neon hover:bg-neon/10 transition group/btn">
                            <span className="text-base group-hover/btn:scale-125 transition">
                              📤
                            </span>
                          </button>

                          <span className="flex items-center gap-1.5 px-2 py-1.5 rounded-full text-xs text-marca opacity-0 group-hover:opacity-100 transition">
                            Ver →
                          </span>
                        </div>

                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

          </div>

          {/* COLUMNA DERECHA: Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <Sidebar />
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}