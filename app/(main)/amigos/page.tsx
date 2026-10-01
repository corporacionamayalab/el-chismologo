import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calcularEstado } from "@/lib/estado";
import BotonAgregarAmigo from "@/components/BotonAgregarAmigo";
import BotonAceptarRechazar from "@/components/BotonAceptarRechazar";

export const revalidate = 0;

export default async function AmigosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 👥 Mis amigos aceptados
  const { data: amistades } = await supabase
    .from("amistades")
    .select(
      `
      id,
      solicitante_id,
      receptor_id,
      solicitante:profiles!amistades_solicitante_id_fkey ( id, username, avatar_url, ultima_conexion, ciudad ),
      receptor:profiles!amistades_receptor_id_fkey ( id, username, avatar_url, ultima_conexion, ciudad )
    `
    )
    .or(`solicitante_id.eq.${user.id},receptor_id.eq.${user.id}`)
    .eq("estado", "aceptada");

  const amigosRaw =
    amistades
      ?.map((a) => {
        const sol = Array.isArray(a.solicitante)
          ? a.solicitante[0]
          : a.solicitante;
        const rec = Array.isArray(a.receptor)
          ? a.receptor[0]
          : a.receptor;
        return a.solicitante_id === user.id ? rec : sol;
      })
      .filter(Boolean) ?? [];

  // 🧹 Deduplicar por id (por si hay doble fila en la tabla)
  const amigos = Array.from(
    new Map(amigosRaw.map((a) => [a!.id, a])).values()
  );

  // Ordenar: online primero
  amigos.sort((a, b) => {
    const estadoA = calcularEstado(a!.ultima_conexion);
    const estadoB = calcularEstado(b!.ultima_conexion);
    if (estadoA.online && !estadoB.online) return -1;
    if (!estadoA.online && estadoB.online) return 1;
    return (a!.username ?? "").localeCompare(b!.username ?? "");
  });

  // 🔔 Solicitudes pendientes recibidas
  const { data: solicitudes } = await supabase
    .from("amistades")
    .select(
      `
      id,
      solicitante:profiles!amistades_solicitante_id_fkey ( id, username, avatar_url, ciudad )
    `
    )
    .eq("receptor_id", user.id)
    .eq("estado", "pendiente");

  // 📤 Solicitudes enviadas
  const { data: enviadas } = await supabase
    .from("amistades")
    .select("receptor_id")
    .eq("solicitante_id", user.id)
    .eq("estado", "pendiente");

  const idsEnviadas = enviadas?.map((e) => e.receptor_id) ?? [];

  // 🌟 Sugerencias: usuarios que no son amigos ni tienen solicitud pendiente
  const idsAmigos = amigos.map((a) => a!.id);
  const idsExcluir = [...idsAmigos, user.id, ...idsEnviadas];

  let sugerenciasQuery = supabase
    .from("profiles")
    .select("id, username, avatar_url, ciudad, bio")
    .limit(20);

  // Excluir IDs si hay
  if (idsExcluir.length > 0) {
    sugerenciasQuery = sugerenciasQuery.not(
      "id",
      "in",
      `(${idsExcluir.join(",")})`
    );
  }

  const { data: sugerenciasRaw } = await sugerenciasQuery;

  // Mezclar aleatoriamente y tomar 9
  const sugerencias = (sugerenciasRaw ?? [])
    // eslint-disable-next-line react-hooks/purity
    .sort(() => Math.random() - 0.5)
    .slice(0, 9);

  return (
    <main className="min-h-screen py-8 px-4 md:px-6">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-marca to-rosa bg-clip-text text-transparent">
              Amigos
            </h1>
            <p className="text-xs text-texto-suave mt-1">
              Conecta con gente nueva 👥
            </p>
          </div>

          <Link
            href="/amigos/buscar"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-marca to-rosa text-white text-sm font-semibold hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-marca/20"
          >
            🔍 Buscar personas
          </Link>
        </div>

        {/* 🔔 Solicitudes pendientes */}
        {solicitudes && solicitudes.length > 0 && (
          <section className="bg-gradient-to-br from-marca/10 to-rosa/10 border border-marca/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl animate-pulse">🔔</span>
              <h2 className="text-lg font-bold text-texto">
                Solicitudes pendientes
              </h2>
              <span className="text-xs bg-rosa text-white px-2 py-0.5 rounded-full font-bold">
                {solicitudes.length}
              </span>
            </div>

            <div className="space-y-3">
              {solicitudes.map((s) => {
                const perfil = Array.isArray(s.solicitante)
                  ? s.solicitante[0]
                  : s.solicitante;
                if (!perfil) return null;
                const inicial = (perfil.username?.[0] ?? "?").toUpperCase();

                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 bg-fondo-card border border-borde rounded-xl p-3"
                  >
                    <Link
                      href={`/amigos/${perfil.id}`}
                      className="flex items-center gap-3 flex-1 min-w-0 group"
                    >
                      {perfil.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={perfil.avatar_url}
                          alt={perfil.username}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-marca to-rosa flex items-center justify-center text-white font-bold flex-shrink-0">
                          {inicial}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-texto truncate group-hover:text-marca transition">
                          @{perfil.username}
                        </p>
                        {perfil.ciudad && (
                          <p className="text-xs text-texto-suave">
                            📍 {perfil.ciudad}
                          </p>
                        )}
                      </div>
                    </Link>

                    <BotonAceptarRechazar
                      amistadId={s.id}
                      usuarioId={perfil.id}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 👥 Mis amigos */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-texto flex items-center gap-2">
              👥 Mis amigos
              <span className="text-sm font-normal text-texto-suave">
                ({amigos.length})
              </span>
            </h2>
            <Link
              href="/amigos/solicitudes"
              className="text-xs text-marca hover:text-rosa transition"
            >
              Ver solicitudes →
            </Link>
          </div>

          {amigos.length === 0 ? (
            <div className="text-center py-12 bg-fondo-card border border-borde rounded-2xl">
              <div className="text-5xl mb-3">👋</div>
              <p className="text-sm font-semibold text-texto">
                Aún no tienes amigos
              </p>
              <p className="text-xs text-texto-suave mt-1 mb-4">
                Agrega personas de las sugerencias de abajo
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {amigos.map((a) => {
                if (!a) return null;
                const estado = calcularEstado(a.ultima_conexion);
                const inicial = (a.username?.[0] ?? "?").toUpperCase();

                return (
                  <div
                    key={a.id}
                    className="group bg-fondo-card border border-borde rounded-2xl overflow-hidden hover:border-marca/40 hover:-translate-y-0.5 transition-all"
                  >
                    {/* Avatar grande */}
                    <Link
                      href={`/amigos/${a.id}`}
                      className="block relative aspect-square overflow-hidden bg-gradient-to-br from-marca/20 to-rosa/20"
                    >
                      {a.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={a.avatar_url}
                          alt={a.username}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-marca to-rosa">
                          <span className="text-5xl font-black text-white">
                            {inicial}
                          </span>
                        </div>
                      )}

                      {/* Indicador online */}
                      <span
                        className={`
                          absolute top-2 right-2 w-4 h-4 rounded-full border-2 border-fondo-card
                          ${estado.online ? "bg-exito" : "bg-texto-suave"}
                        `}
                      />
                    </Link>

                    {/* Info */}
                    <div className="p-3">
                      <Link href={`/amigos/${a.id}`}>
                        <p className="text-sm font-semibold text-texto truncate hover:text-marca transition">
                          @{a.username}
                        </p>
                      </Link>
                      <p className="text-xs text-texto-suave truncate">
                        {estado.emoji} {estado.texto}
                      </p>

                      <Link
                        href={`/mensajes/${a.id}`}
                        className="mt-3 block w-full text-center text-xs font-semibold py-2 rounded-xl bg-marca/10 border border-marca/30 text-marca hover:bg-marca hover:text-white transition"
                      >
                        💬 Mensaje
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 🌟 Personas que quizás conozcas */}
        {sugerencias.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-texto mb-4 flex items-center gap-2">
              🌟 Personas que quizás conozcas
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sugerencias.map((s) => {
                const inicial = (s.username?.[0] ?? "?").toUpperCase();

                return (
                  <div
                    key={s.id}
                    className="group bg-fondo-card border border-borde rounded-2xl overflow-hidden hover:border-rosa/40 hover:-translate-y-0.5 transition-all"
                  >
                    <Link
                      href={`/amigos/${s.id}`}
                      className="block relative aspect-square overflow-hidden"
                    >
                      {s.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={s.avatar_url}
                          alt={s.username}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rosa/30 to-marca/30">
                          <span className="text-5xl font-black text-white">
                            {inicial}
                          </span>
                        </div>
                      )}
                    </Link>

                    <div className="p-3">
                      <Link href={`/amigos/${s.id}`}>
                        <p className="text-sm font-semibold text-texto truncate hover:text-rosa transition">
                          @{s.username}
                        </p>
                      </Link>
                      {s.ciudad && (
                        <p className="text-xs text-texto-suave truncate">
                          📍 {s.ciudad}
                        </p>
                      )}

                      <BotonAgregarAmigo usuarioId={s.id} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}