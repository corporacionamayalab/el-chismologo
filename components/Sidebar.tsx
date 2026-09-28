import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { calcularEstado } from "@/lib/estado";

const CONSEJOS = [
  {
    emoji: "🔒",
    texto: "No compartas tu dirección ni número con desconocidos.",
  },
  {
    emoji: "🚫",
    texto: "Si alguien te pide dinero, repórtalo inmediatamente.",
  },
  {
    emoji: "🤝",
    texto: "Queda con alguien en lugares públicos la primera vez.",
  },
  {
    emoji: "👀",
    texto: "Revisa el perfil antes de agregar a alguien como amigo.",
  },
  {
    emoji: "📸",
    texto: "Nunca envíes fotos íntimas por chat. Pueden ser usadas en tu contra.",
  },
  {
    emoji: "💬",
    texto: "Si algo te incomoda, usa el botón de reportar. Estamos para ayudarte.",
  },
];

export default async function Sidebar() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 🔥 Top confesiones de la semana
  const hace7dias = new Date();
  hace7dias.setDate(hace7dias.getDate() - 7);

  const { data: topConfesiones } = await supabase
    .from("confesiones")
    .select("id, titulo")
    .eq("estado", "aprobada")
    .gte("creado_en", hace7dias.toISOString())
    .limit(20);

  // Calcular reacciones de esas confesiones
  let topConReacciones: { id: string; titulo: string; reacciones: number }[] = [];

  if (topConfesiones && topConfesiones.length > 0) {
    const ids = topConfesiones.map((c) => c.id);

    const { data: reacciones } = await supabase
      .from("reacciones")
      .select("confesion_id")
      .in("confesion_id", ids);

    topConReacciones = topConfesiones
      .map((c) => ({
        id: c.id,
        titulo: c.titulo,
        reacciones:
          reacciones?.filter((r) => r.confesion_id === c.id).length ?? 0,
      }))
      .sort((a, b) => b.reacciones - a.reacciones)
      .slice(0, 5);
  }

  // Si no hay de la semana, traer las más populares de siempre
  if (topConReacciones.length === 0) {
    const { data: todas } = await supabase
      .from("confesiones")
      .select("id, titulo")
      .eq("estado", "aprobada")
      .order("creado_en", { ascending: false })
      .limit(20);

    if (todas && todas.length > 0) {
      const ids = todas.map((c) => c.id);
      const { data: reacciones } = await supabase
        .from("reacciones")
        .select("confesion_id")
        .in("confesion_id", ids);

      topConReacciones = todas
        .map((c) => ({
          id: c.id,
          titulo: c.titulo,
          reacciones:
            reacciones?.filter((r) => r.confesion_id === c.id).length ?? 0,
        }))
        .sort((a, b) => b.reacciones - a.reacciones)
        .slice(0, 5);
    }
  }

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

      // Ordenar: online primero
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

  // 💡 Consejo aleatorio (basado en el día)
  const diaDelAnio = Math.floor(
    // eslint-disable-next-line react-hooks/purity
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const consejo = CONSEJOS[diaDelAnio % CONSEJOS.length];

  return (
    <aside className="space-y-6">

      {/* 🔥 Top confesiones */}
      {topConReacciones.length > 0 && (
        <div className="bg-fondo-card border border-borde rounded-2xl p-5">
          <h3 className="text-sm font-bold text-texto flex items-center gap-2 mb-4">
            🔥 Top de la semana
          </h3>

          <div className="space-y-3">
            {topConReacciones.map((c, i) => (
              <Link
                key={c.id}
                href={`/confesiones/${c.id}`}
                className="flex items-start gap-3 group"
              >
                <span
                  className={`
                    flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${
                      i === 0
                        ? "bg-gradient-to-br from-neon to-rosa text-fondo"
                        : "bg-fondo border border-borde text-texto-suave"
                    }
                  `}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-texto-suave group-hover:text-marca transition-colors line-clamp-2 leading-snug">
                    {c.titulo}
                  </p>
                  <p className="text-xs text-texto-suave/70 mt-0.5">
                    ❤️ {c.reacciones} reacciones
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
              Ver todos →
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

      {/* 💡 Consejo del día */}
      <div className="bg-gradient-to-br from-marca/10 to-rosa/10 border border-marca/20 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-texto flex items-center gap-2 mb-3">
          💡 Consejo del día
        </h3>
        <p className="text-xs text-texto-suave leading-relaxed">
          <span className="text-lg mr-1">{consejo.emoji}</span>
          {consejo.texto}
        </p>
      </div>

      {/* Enlaces legales */}
      <div className="text-xs text-texto-suave/70 flex flex-wrap gap-x-3 gap-y-1 px-1">
        <Link href="/terminos" className="hover:text-marca transition">
          Términos
        </Link>
        <span>·</span>
        <Link href="/privacidad" className="hover:text-marca transition">
          Privacidad
        </Link>
        <span>·</span>
        <Link href="/cookies" className="hover:text-marca transition">
          Cookies
        </Link>
      </div>

    </aside>
  );
}