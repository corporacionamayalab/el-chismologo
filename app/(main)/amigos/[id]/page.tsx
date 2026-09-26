import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BotonesPerfil from "@/components/BotonesPerfil";

export const revalidate = 0;

export default async function PerfilUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Si es mi propio perfil → redirigir
  if (user.id === id) redirect("/perfil");

  // Traer el perfil del otro usuario
  const { data: perfil, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, rol, creado_en")
    .eq("id", id)
    .single();

  if (error || !perfil) notFound();

  // Estadísticas
  const { count: totalConfesiones } = await supabase
    .from("confesiones")
    .select("*", { count: "exact", head: true })
    .eq("user_id", id)
    .eq("estado", "aprobada");

  const { count: totalAnuncios } = await supabase
    .from("contactos")
    .select("*", { count: "exact", head: true })
    .eq("user_id", id)
    .eq("estado", "aprobada");

  // Relación entre ambos
  const { data: relacion } = await supabase
    .from("amistades")
    .select("id, estado, solicitante_id, receptor_id")
    .or(
      `and(solicitante_id.eq.${user.id},receptor_id.eq.${id}),and(solicitante_id.eq.${id},receptor_id.eq.${user.id})`
    )
    .maybeSingle();

  // ¿Está bloqueado?
  const { data: bloqueo } = await supabase
    .from("bloqueos")
    .select("id")
    .eq("bloqueador", user.id)
    .eq("bloqueado", id)
    .maybeSingle();

  // ¿Yo soy bloqueado por él?
  const { data: bloqueoInverso } = await supabase
    .from("bloqueos")
    .select("id")
    .eq("bloqueador", id)
    .eq("bloqueado", user.id)
    .maybeSingle();

  const inicial = (perfil.username?.[0] ?? "?").toUpperCase();
  const fechaRegistro = new Date(perfil.creado_en).toLocaleDateString(
    "es-ES",
    { day: "numeric", month: "long", year: "numeric" }
  );

  const yoBloquee = !!bloqueo;
  const meBloqueo = !!bloqueoInverso;

  return (
    <main className="min-h-screen py-10 px-6">
      <div className="max-w-2xl mx-auto space-y-6">

        <Link
          href="/amigos"
          className="inline-flex items-center gap-2 text-sm text-texto-suave hover:text-neon transition"
        >
          ← Volver a amigos
        </Link>

        {/* Card principal */}
        <div className="bg-fondo-card border border-borde rounded-2xl p-8 relative overflow-hidden">

          <div className="absolute top-0 right-0 w-40 h-40 bg-neon/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">

            {/* Aviso bloqueo */}
            {meBloqueo && (
              <div className="mb-6 p-3 rounded-xl bg-error/10 border border-error/30 text-error text-xs text-center">
                🚫 Este usuario te ha bloqueado
              </div>
            )}

            {yoBloquee && (
              <div className="mb-6 p-3 rounded-xl bg-neon/10 border border-neon/30 text-neon text-xs text-center">
                🚫 Has bloqueado a este usuario
              </div>
            )}

            {/* Avatar + info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">

              {/* Avatar */}
              {perfil.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={perfil.avatar_url}
                  alt={perfil.username}
                  className="w-24 h-24 rounded-full object-cover border-4 border-neon/30 flex-shrink-0"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon to-marca flex items-center justify-center text-fondo text-4xl font-black flex-shrink-0">
                  {inicial}
                </div>
              )}

              {/* Info */}
              <div className="flex-1 text-center sm:text-left min-w-0">
                <h1 className="text-3xl font-black text-texto break-words">
                  @{perfil.username}
                </h1>
                <p className="text-xs text-texto-suave mt-2">
                  📅 Miembro desde {fechaRegistro}
                </p>
                {perfil.rol === "admin" && (
                  <span className="inline-block mt-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-marca/20 text-marca border border-marca/30">
                    🎛️ Admin
                  </span>
                )}
              </div>

            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-borde">
              <div className="bg-fondo rounded-xl p-4 border border-borde text-center">
                <p className="text-3xl font-black text-marca">
                  {totalConfesiones ?? 0}
                </p>
                <p className="text-xs text-texto-suave mt-1">
                  📝 Confesiones
                </p>
              </div>
              <div className="bg-fondo rounded-xl p-4 border border-borde text-center">
                <p className="text-3xl font-black text-rosa">
                  {totalAnuncios ?? 0}
                </p>
                <p className="text-xs text-texto-suave mt-1">
                  💘 Anuncios
                </p>
              </div>
            </div>

            {/* Botones de acción */}
            {!meBloqueo && (
              <div className="mt-8 pt-6 border-t border-borde">
                <BotonesPerfil
                  usuarioId={id}
                  yoId={user.id}
                  relacion={
                    relacion
                      ? {
                          id: relacion.id,
                          estado: relacion.estado,
                          soySolicitante: relacion.solicitante_id === user.id,
                        }
                      : null
                  }
                  bloqueado={yoBloquee}
                />
              </div>
            )}

          </div>
        </div>

      </div>
    </main>
  );
}