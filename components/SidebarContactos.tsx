import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { calcularEstado } from "@/lib/estado";

const CONSEJOS_CONTACTOS = [
  {
    emoji: "🛡️",
    texto: "Queda en lugares públicos la primera vez que conozcas a alguien.",
  },
  {
    emoji: "📸",
    texto: "No envíes fotos íntimas. Pueden usarlas para extorsionarte.",
  },
  {
    emoji: "💰",
    texto: "Nunca envíes dinero a alguien que conociste por internet.",
  },
  {
    emoji: "📱",
    texto: "Usa el WhatsApp solo cuando ya tengas confianza.",
  },
  {
    emoji: "🚩",
    texto: "Si alguien te pide datos bancarios, repórtalo al instante.",
  },
  {
    emoji: "👥",
    texto: "Avisa a un amigo cuando vayas a conocer a alguien nuevo.",
  },
];

export default async function SidebarContactos() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 📊 Estadísticas de contactos
  const { count: totalAnuncios } = await supabase
    .from("contactos")
    .select("*", { count: "exact", head: true })
    .eq("estado", "aprobada");

  const { count: buscanPareja } = await supabase
    .from("contactos")
    .select("*", { count: "exact", head: true })
    .eq("estado", "aprobada")
    .eq("busca", "Pareja");

  const { count: buscanAmistad } = await supabase
    .from("contactos")
    .select("*", { count: "exact", head: true })
    .eq("estado", "aprobada")
    .eq("busca", "Amistad");

  // 🔥 Anuncios recientes
  const { data: recientes } = await supabase
    .from("contactos")
    .select("id, titulo, edad, ciudad, imagen_url")
    .eq("estado", "aprobada")
    .order("creado_en", { ascending: false })
    .limit(4);

  // 👥 Amigos del usuario
  let amigos: {
    id: string;
    username: string;
    avatar_url: string | null;
    ultima_conexion: string | null;
  }[] = [];

  if (user) {
    const { data: amistades } = await supabase
      .from("amistades")
      .select(
        `
        solicitante_id,
        receptor_id,
        solicitante:profiles!amistades_solicitante_id_fkey ( id, username, avatar_url, ultima_conexion ),
        receptor:profiles!amistades_receptor_id_fkey ( id, username, avatar_url, ultima_conexion )
      `
      )
      .or(`solicitante_id.eq.${user.id},receptor_id.eq.${user.id}`)
      .eq("estado", "aceptada")
      .limit(10);

    if (amistades) {
      amigos = amistades
        .map((a) => {
          const sol = Array.isArray(a.solicitante)
            ? a.solicitante[0]
            : a.solicitante;
          const rec = Array.isArray(a.receptor)
            ? a.receptor[0]
            : a.receptor;
          return a.solicitante_id === user.id ? rec : sol;
        })
        .filter(Boolean) as typeof amigos;

      amigos.sort((a, b) => {
        const estadoA = calcularEstado(a.ultima_conexion);
        const estadoB = calcularEstado(b.ultima_conexion);
        if (estadoA.online && !estadoB.online) return -1;
        if (!estadoA.online && estadoB.online) return 1;
        return 0;
      });

      amigos = amigos.slice(0, 5);
    }
  }

  // 💡 Consejo aleatorio
  const diaDelAnio = Math.floor(
    // eslint-disable-next-line react-hooks/purity
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const consejo = CONSEJOS_CONTACTOS[diaDelAnio % CONSEJOS_CONTACTOS.length];

  return (
    <aside className="space-y-6">

      {/* 📊 Estadísticas */}
      <div className="bg-fondo-card border border-borde rounded-2xl p-5">
        <h3 className="text-sm font-bold text-texto flex items-center gap-2 mb-4">
          📊 Estadísticas
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-texto-suave">Anuncios activos</span>
            <span className="font-bold text-rosa">{totalAnuncios ?? 0}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-texto-suave">💕 Buscan pareja</span>
            <span className="font-bold text-marca">{buscanPareja ?? 0}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-texto-suave">🤝 Buscan amistad</span>
            <span className="font-bold text-neon">{buscanAmistad ?? 0}</span>
          </div>
        </div>
      </div>

      {/* 🔥 Recientes */}
      {recientes && recientes.length > 0 && (
        <div className="bg-fondo-card border border-borde rounded-2xl p-5">
          <h3 className="text-sm font-bold text-texto flex items-center gap-2 mb-4">
            🔥 Recién publicados
          </h3>

          <div className="space-y-3">
            {recientes.map((c) => (
              <Link
                key={c.id}
                href="/contactos"
                className="flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-fondo border border-borde flex-shrink-0 flex items-center justify-center">
                  {c.imagen_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.imagen_url}
                      alt={c.titulo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg">💘</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-texto-suave group-hover:text-rosa transition-colors line-clamp-1">
                    {c.titulo}
                  </p>
                  <p className="text-xs text-texto-suave/70">
                    {c.edad && `${c.edad} años`}
                    {c.edad && c.ciudad && " · "}
                    {c.ciudad}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 👥 Amigos */}
      {user && (
        <div className="bg-fondo-card border border-borde rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-texto flex items-center gap-2">
              👥 Amigos
            </h3>
            <Link
              href="/amigos"
              className="text-xs text-marca hover:text-rosa transition"
            >
              Ver →
            </Link>
          </div>

          {amigos.length === 0 ? (
            <div className="text-center py-3">
              <p className="text-xs text-texto-suave mb-3">
                Aún no tienes amigos
              </p>
              <Link
                href="/amigos/buscar"
                className="inline-block text-xs px-3 py-1.5 rounded-lg bg-neon/10 border border-neon/30 text-neon hover:bg-neon/20 transition"
              >
                🔍 Buscar personas
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {amigos.map((a) => {
                const estado = calcularEstado(a.ultima_conexion);
                const inicial = (a.username?.[0] ?? "?").toUpperCase();

                return (
                  <Link
                    key={a.id}
                    href={`/amigos/${a.id}`}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-fondo-card-hover transition group"
                  >
                    <div className="relative flex-shrink-0">
                      {a.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={a.avatar_url}
                          alt={a.username}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-marca to-rosa flex items-center justify-center text-white text-xs font-bold">
                          {inicial}
                        </div>
                      )}
                      <span
                        className={`
                          absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-fondo-card
                          ${estado.online ? "bg-exito" : "bg-texto-suave"}
                        `}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-texto truncate group-hover:text-marca transition-colors">
                        @{a.username}
                      </p>
                      <p className="text-xs text-texto-suave">
                        {estado.emoji} {estado.texto}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 💡 Consejo de seguridad */}
      <div className="bg-gradient-to-br from-rosa/10 to-marca/10 border border-rosa/20 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-texto flex items-center gap-2 mb-3">
          🛡️ Seguridad
        </h3>
        <p className="text-xs text-texto-suave leading-relaxed">
          <span className="text-lg mr-1">{consejo.emoji}</span>
          {consejo.texto}
        </p>
      </div>

    </aside>
  );
}