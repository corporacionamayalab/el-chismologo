import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BotonGestionUsuario from "@/components/BotonGestionUsuario";

export const revalidate = 0;

export default async function AdminUsuarioDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Perfil
  const { data: perfil, error } = await supabase
    .from("profiles")
    .select(
      "id, username, avatar_url, rol, bio, intereses, ciudad, fecha_nacimiento, genero, ultima_conexion, creado_en, bloqueado, motivo_bloqueo, bloqueado_en"
    )
    .eq("id", id)
    .single();

  if (error || !perfil) notFound();

  // Estadísticas
  const { count: totalConfesiones } = await supabase
    .from("confesiones")
    .select("*", { count: "exact", head: true })
    .eq("user_id", id);

  const { count: confAprobadas } = await supabase
    .from("confesiones")
    .select("*", { count: "exact", head: true })
    .eq("user_id", id)
    .eq("estado", "aprobada");

  const { count: confPendientes } = await supabase
    .from("confesiones")
    .select("*", { count: "exact", head: true })
    .eq("user_id", id)
    .eq("estado", "pendiente");

  const { count: confRechazadas } = await supabase
    .from("confesiones")
    .select("*", { count: "exact", head: true })
    .eq("user_id", id)
    .eq("estado", "rechazada");

  const { count: totalAnuncios } = await supabase
    .from("contactos")
    .select("*", { count: "exact", head: true })
    .eq("user_id", id);

  const { count: totalComentarios } = await supabase
    .from("comentarios")
    .select("*", { count: "exact", head: true })
    .eq("user_id", id);

  const { count: totalReacciones } = await supabase
    .from("reacciones")
    .select("*", { count: "exact", head: true })
    .eq("user_id", id);

  const { count: totalMensajes } = await supabase
    .from("mensajes")
    .select("*", { count: "exact", head: true })
    .eq("emisor_id", id);

  const { count: totalAmigos } = await supabase
    .from("amistades")
    .select("*", { count: "exact", head: true })
    .or(`solicitante_id.eq.${id},receptor_id.eq.${id}`)
    .eq("estado", "aceptada");

  const { count: reportesRecibidos } = await supabase
    .from("reportes")
    .select("*", { count: "exact", head: true })
    .eq("usuario_reportado", id);

  const { count: reportesHechos } = await supabase
    .from("reportes")
    .select("*", { count: "exact", head: true })
    .eq("reportado_por", id);

  // Últimas confesiones
  const { data: ultimasConfesiones } = await supabase
    .from("confesiones")
    .select("id, titulo, estado, creado_en")
    .eq("user_id", id)
    .order("creado_en", { ascending: false })
    .limit(5);

  // Datos calculados
  const inicial = (perfil.username?.[0] ?? "?").toUpperCase();
  const fechaRegistro = new Date(perfil.creado_en).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const calcularEdad = (fechaNacimiento: string | null): number | null => {
    if (!fechaNacimiento) return null;
    const hoy = new Date();
    const nac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const mes = hoy.getMonth() - nac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  };

  const calcularEstado = (ultimaConexion: string | null) => {
    if (!ultimaConexion) return { online: false, texto: "Desconocido", emoji: "⚫" };
    const diff = Math.floor(
      // eslint-disable-next-line react-hooks/purity
      (Date.now() - new Date(ultimaConexion).getTime()) / 1000
    );
    if (diff < 120) return { online: true, texto: "En línea", emoji: "🟢" };
    if (diff < 3600) return { online: false, texto: `Hace ${Math.floor(diff / 60)} min`, emoji: "🟡" };
    if (diff < 86400) return { online: false, texto: `Hace ${Math.floor(diff / 3600)} h`, emoji: "🟡" };
    return { online: false, texto: `Hace ${Math.floor(diff / 86400)} d`, emoji: "⚫" };
  };

  const estado = calcularEstado(perfil.ultima_conexion);
  const edad = calcularEdad(perfil.fecha_nacimiento);

  const ESTADOS_CONF: Record<string, { label: string; emoji: string; color: string }> = {
    aprobada: { label: "Aprobada", emoji: "✅", color: "text-exito" },
    pendiente: { label: "Pendiente", emoji: "⏳", color: "text-neon" },
    rechazada: { label: "Rechazada", emoji: "❌", color: "text-error" },
  };

  return (
    <div className="space-y-6">

      <Link
        href="/ymix34/usuarios"
        className="inline-flex items-center gap-2 text-sm text-texto-suave hover:text-marca transition"
      >
        ← Volver a usuarios
      </Link>

      {/* Banner de bloqueo */}
      {perfil.bloqueado && (
        <div className="p-4 rounded-2xl bg-error/10 border border-error/30">
          <div className="flex items-start gap-3">
            <span className="text-3xl">🚫</span>
            <div className="flex-1">
              <p className="font-bold text-error">Usuario bloqueado</p>
              <p className="text-sm text-texto-suave mt-1">
                <strong className="text-texto">Motivo:</strong> {perfil.motivo_bloqueo ?? "No especificado"}
              </p>
              {perfil.bloqueado_en && (
                <p className="text-xs text-texto-suave mt-1">
                  Bloqueado el{" "}
                  {new Date(perfil.bloqueado_en).toLocaleString("es-ES")}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Card principal */}
      <div className="bg-fondo-card border border-borde rounded-2xl p-6 md:p-8">

        {/* Avatar + Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">

          {perfil.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={perfil.avatar_url}
              alt={perfil.username}
              className="w-24 h-24 rounded-full object-cover border-4 border-marca/30 shrink-0"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-linear-to-br from-marca to-rosa flex items-center justify-center text-white text-4xl font-black shrink-0">
              {inicial}
            </div>
          )}

          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              <h1 className="text-3xl font-black text-texto">@{perfil.username}</h1>
              {perfil.rol === "admin" && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-marca/20 text-marca border border-marca/30 font-semibold">
                  🎛️ Admin
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-3 text-xs text-texto-suave mt-3 justify-center sm:justify-start">
              <span>{estado.emoji} {estado.texto}</span>
              {perfil.ciudad && <span>📍 {perfil.ciudad}</span>}
              {edad !== null && <span>🎂 {edad} años</span>}
              {perfil.genero && <span>👤 {perfil.genero}</span>}
            </div>

            <p className="text-xs text-texto-suave mt-2">
              📅 Registrado el {fechaRegistro}
            </p>

            {perfil.bio && (
              <p className="text-sm text-texto mt-3 italic">
                &ldquo;{perfil.bio}&rdquo;
              </p>
            )}

            {perfil.intereses && perfil.intereses.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                {perfil.intereses.map((i: string) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-full bg-marca/10 border border-marca/30 text-marca text-xs"
                  >
                    {i}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-6 pt-6 border-t border-borde flex flex-wrap gap-3 justify-center sm:justify-start">
          <Link
            href={`/amigos/${perfil.id}`}
            target="_blank"
            className="px-4 py-2 rounded-xl bg-fondo border border-borde text-texto-suave hover:text-marca hover:border-marca/30 text-sm font-semibold transition"
          >
            👁️ Ver perfil público
          </Link>

          <BotonGestionUsuario
            userId={perfil.id}
            username={perfil.username}
            bloqueado={perfil.bloqueado}
          />
        </div>
      </div>

      {/* Estadísticas */}
      <div className="bg-fondo-card border border-borde rounded-2xl p-6">
        <h2 className="text-lg font-bold text-texto mb-4">📊 Estadísticas</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatBox emoji="📝" label="Confesiones" valor={totalConfesiones ?? 0} sub={`${confAprobadas ?? 0}✅ ${confPendientes ?? 0}⏳ ${confRechazadas ?? 0}❌`} />
          <StatBox emoji="💘" label="Anuncios" valor={totalAnuncios ?? 0} />
          <StatBox emoji="💬" label="Comentarios" valor={totalComentarios ?? 0} />
          <StatBox emoji="❤️" label="Reacciones" valor={totalReacciones ?? 0} />
          <StatBox emoji="✉️" label="Mensajes" valor={totalMensajes ?? 0} />
          <StatBox emoji="👥" label="Amigos" valor={totalAmigos ?? 0} />
          <StatBox emoji="🚩" label="Reportes recibidos" valor={reportesRecibidos ?? 0} color="text-error" />
          <StatBox emoji="📤" label="Reportes hechos" valor={reportesHechos ?? 0} />
        </div>
      </div>

      {/* Últimas confesiones */}
      {ultimasConfesiones && ultimasConfesiones.length > 0 && (
        <div className="bg-fondo-card border border-borde rounded-2xl p-6">
          <h2 className="text-lg font-bold text-texto mb-4">
            📝 Últimas confesiones ({ultimasConfesiones.length})
          </h2>

          <div className="space-y-2">
            {ultimasConfesiones.map((c) => {
              const est = ESTADOS_CONF[c.estado] ?? ESTADOS_CONF.pendiente;
              return (
                <Link
                  key={c.id}
                  href={`/confesiones/${c.id}`}
                  target="_blank"
                  className="flex items-center gap-3 p-3 rounded-xl bg-fondo border border-borde hover:border-marca/30 transition"
                >
                  <span className={`text-lg ${est.color}`}>{est.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-texto truncate">{c.titulo}</p>
                    <p className="text-xs text-texto-suave">
                      {est.label} · {new Date(c.creado_en).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}

function StatBox({
  emoji,
  label,
  valor,
  sub,
  color = "text-texto",
}: {
  emoji: string;
  label: string;
  valor: number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-fondo border border-borde rounded-xl p-3">
      <div className="text-2xl mb-1">{emoji}</div>
      <p className={`text-2xl font-black ${color}`}>{valor}</p>
      <p className="text-xs text-texto-suave mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-texto-suave mt-1">{sub}</p>}
    </div>
  );
}