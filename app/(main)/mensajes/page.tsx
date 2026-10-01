import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calcularEstado } from "@/lib/estado";

export const revalidate = 0;

export default async function MensajesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Obtener amigos
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
    .eq("estado", "aceptada");

  // Lista de amigos con su último mensaje
  const conversaciones = await Promise.all(
    (amistades ?? []).map(async (a) => {
      const sol = Array.isArray(a.solicitante) ? a.solicitante[0] : a.solicitante;
      const rec = Array.isArray(a.receptor) ? a.receptor[0] : a.receptor;
      const amigo = a.solicitante_id === user.id ? rec : sol;

      if (!amigo) return null;

      // Último mensaje entre ambos
      const { data: ultimo } = await supabase
        .from("mensajes")
        .select("contenido, creado_en, emisor_id, leido")
        .or(
          `and(emisor_id.eq.${user.id},receptor_id.eq.${amigo.id}),and(emisor_id.eq.${amigo.id},receptor_id.eq.${user.id})`
        )
        .order("creado_en", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Mensajes sin leer (él me escribió a mí y no los he leído)
      const { count: noLeidos } = await supabase
        .from("mensajes")
        .select("*", { count: "exact", head: true })
        .eq("emisor_id", amigo.id)
        .eq("receptor_id", user.id)
        .eq("leido", false);

      return {
        amigo,
        ultimo,
        noLeidos: noLeidos ?? 0,
      };
    })
  );

  // 1. Quitar nulos
  const noNulos = conversaciones.filter((c) => c !== null);

  // 2. Deduplicar por amigo.id (por si la tabla tiene doble fila)
  const unicas = Array.from(
    new Map(noNulos.map((c) => [c!.amigo!.id, c])).values()
  );

  // 3. Ordenar por último mensaje (más reciente primero)
  unicas.sort((a, b) => {
    const fa = a!.ultimo?.creado_en ?? "0";
    const fb = b!.ultimo?.creado_en ?? "0";
    return new Date(fb).getTime() - new Date(fa).getTime();
  });

  return (
    <main className="min-h-screen py-10 px-6">
      <div className="max-w-2xl mx-auto">

        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black gradient-animated">
            Mensajes
          </h1>
          <p className="text-sm text-texto-suave mt-2">
            Tus conversaciones 💬
          </p>
        </div>

        {unicas.length === 0 ? (
          <div className="text-center py-20 bg-fondo-card border border-borde rounded-2xl">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-xl font-bold text-texto">
              Aún no tienes conversaciones
            </h2>
            <p className="text-sm text-texto-suave mt-2 mb-6">
              Agrega amigos para empezar a chatear
            </p>
            <Link
              href="/amigos/buscar"
              className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-marca to-rosa text-white font-semibold hover:opacity-90 transition"
            >
              🔍 Buscar personas
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {unicas.map((c) => {
              const amigo = c!.amigo!;
              const ultimo = c!.ultimo;
              const noLeidos = c!.noLeidos;

              const inicial = (amigo.username?.[0] ?? "?").toUpperCase();
              const estado = calcularEstado(amigo.ultima_conexion);
              const esMio = ultimo?.emisor_id === user.id;

              return (
                <Link
                  key={amigo.id}
                  href={`/mensajes/${amigo.id}`}
                  className="bg-fondo-card border border-borde rounded-2xl p-4 flex items-center gap-3 hover:border-marca/30 hover:bg-fondo-card-hover transition group"
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {amigo.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={amigo.avatar_url}
                        alt={amigo.username}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-marca to-rosa flex items-center justify-center text-white font-black text-lg">
                        {inicial}
                      </div>
                    )}
                    {/* Indicador online */}
                    <span
                      className={`
                        absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-fondo-card
                        ${estado.online ? "bg-exito" : "bg-texto-suave"}
                      `}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-texto truncate">
                        @{amigo.username}
                      </p>
                      <span className="text-xs text-texto-suave">
                        {estado.emoji} {estado.texto}
                      </span>
                    </div>

                    {ultimo ? (
                      <p
                        className={`
                          text-sm truncate mt-0.5
                          ${noLeidos > 0 ? "text-texto font-medium" : "text-texto-suave"}
                        `}
                      >
                        {esMio && <span className="text-texto-suave">Tú: </span>}
                        {ultimo.contenido}
                      </p>
                    ) : (
                      <p className="text-sm text-texto-suave mt-0.5 italic">
                        Sin mensajes aún
                      </p>
                    )}
                  </div>

                  {/* Contador no leídos */}
                  {noLeidos > 0 && (
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-marca to-rosa text-white text-xs font-bold flex items-center justify-center">
                      {noLeidos > 9 ? "9+" : noLeidos}
                    </span>
                  )}

                </Link>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}