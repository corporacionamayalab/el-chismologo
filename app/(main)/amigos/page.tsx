import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function AmigosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Amigos aceptados
  const { data: amistades } = await supabase
    .from("amistades")
    .select(
      `
      id,
      estado,
      solicitante_id,
      receptor_id,
      solicitante:profiles!amistades_solicitante_id_fkey ( id, username, avatar_url ),
      receptor:profiles!amistades_receptor_id_fkey ( id, username, avatar_url )
    `
    )
    .or(`solicitante_id.eq.${user.id},receptor_id.eq.${user.id}`)
    .eq("estado", "aceptada");

  // Solicitudes recibidas pendientes
  const { data: solicitudesRecibidas } = await supabase
    .from("amistades")
    .select(
      `
      id,
      solicitante:profiles!amistades_solicitante_id_fkey ( id, username, avatar_url )
    `
    )
    .eq("receptor_id", user.id)
    .eq("estado", "pendiente");

  // Solicitudes enviadas pendientes
  const { data: solicitudesEnviadas } = await supabase
    .from("amistades")
    .select(
      `
      id,
      receptor:profiles!amistades_receptor_id_fkey ( id, username, avatar_url )
    `
    )
    .eq("solicitante_id", user.id)
    .eq("estado", "pendiente");

  // Normalizar amigos (el otro siempre)
  const amigos =
    amistades?.map((a) => {
      const sol = Array.isArray(a.solicitante) ? a.solicitante[0] : a.solicitante;
      const rec = Array.isArray(a.receptor) ? a.receptor[0] : a.receptor;
      const esSolicitante = a.solicitante_id === user.id;
      return {
        id: a.id,
        perfil: esSolicitante ? rec : sol,
      };
    }) ?? [];

  return (
    <main className="min-h-screen py-10 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-neon to-marca bg-clip-text text-transparent">
              Amigos
            </h1>
            <p className="text-sm text-texto-suave mt-2">
              Conecta con gente nueva 👥
            </p>
          </div>

          <Link
            href="/amigos/buscar"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-neon to-marca text-fondo font-semibold hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-neon/20"
          >
            🔍 Buscar personas
          </Link>
        </div>

        {/* Alertas */}
        {solicitudesRecibidas && solicitudesRecibidas.length > 0 && (
          <Link
            href="/amigos/solicitudes"
            className="block mb-6 p-4 rounded-2xl bg-gradient-to-r from-marca/20 to-rosa/20 border border-marca/40 hover:border-marca transition group"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl animate-pulse">🔔</span>
              <div className="flex-1">
                <p className="font-bold text-texto">
                  Tienes {solicitudesRecibidas.length} solicitud{solicitudesRecibidas.length !== 1 ? "es" : ""} de amistad
                </p>
                <p className="text-xs text-texto-suave mt-0.5">
                  Clic para revisarlas
                </p>
              </div>
              <span className="text-marca group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>
        )}

        {/* Sección amigos */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-texto flex items-center gap-2">
            👥 Tus amigos ({amigos.length})
          </h2>

          {amigos.length === 0 ? (
            <div className="text-center py-16 bg-fondo-card border border-borde rounded-2xl">
              <div className="text-6xl mb-4">👋</div>
              <h3 className="text-xl font-bold text-texto">
                Aún no tienes amigos
              </h3>
              <p className="text-sm text-texto-suave mt-2 mb-6">
                Busca personas y envía solicitudes de amistad
              </p>
              <Link
                href="/amigos/buscar"
                className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-neon to-marca text-fondo font-semibold hover:opacity-90 transition"
              >
                🔍 Buscar personas
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {amigos.map((a) => {
                const perfil = a.perfil;
                if (!perfil) return null;
                const inicial = (perfil.username?.[0] ?? "?").toUpperCase();

                return (
                  <Link
                    key={a.id}
                    href={`/amigos/${perfil.id}`}
                    className="group bg-fondo-card border border-borde rounded-2xl p-4 hover:border-neon/50 hover:bg-fondo-card-hover transition-all flex items-center gap-3"
                  >
                    {perfil.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={perfil.avatar_url}
                        alt={perfil.username}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-neon/30"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon to-marca flex items-center justify-center text-fondo font-black flex-shrink-0">
                        {inicial}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-texto truncate group-hover:text-neon transition">
                        @{perfil.username}
                      </p>
                      <p className="text-xs text-texto-suave">
                        🟢 Amigos
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Sección solicitudes enviadas */}
        {solicitudesEnviadas && solicitudesEnviadas.length > 0 && (
          <section className="space-y-4 mt-10">
            <h2 className="text-lg font-bold text-texto-suave flex items-center gap-2">
              ⏳ Enviadas ({solicitudesEnviadas.length})
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              {solicitudesEnviadas.map((s) => {
                const perfil = Array.isArray(s.receptor) ? s.receptor[0] : s.receptor;
                if (!perfil) return null;
                const inicial = (perfil.username?.[0] ?? "?").toUpperCase();

                return (
                  <div
                    key={s.id}
                    className="bg-fondo-card border border-borde rounded-2xl p-4 flex items-center gap-3 opacity-70"
                  >
                    {perfil.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={perfil.avatar_url}
                        alt={perfil.username}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-fondo border border-borde flex items-center justify-center text-texto-suave font-bold flex-shrink-0">
                        {inicial}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-texto truncate">
                        @{perfil.username}
                      </p>
                      <p className="text-xs text-neon">⏳ Pendiente</p>
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