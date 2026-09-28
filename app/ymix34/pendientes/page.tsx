import { createClient } from "@/lib/supabase/server";
import PanelModerar from "@/components/PanelModerar";

export const revalidate = 0;

export default async function AdminPendientesPage() {
  const supabase = await createClient();

  // Confesiones pendientes
  const { data: confesiones } = await supabase
    .from("confesiones")
    .select(
      `
      id,
      titulo,
      contenido,
      anonima,
      imagen_url,
      creado_en,
      user_id,
      profiles:user_id ( username )
    `
    )
    .eq("estado", "pendiente")
    .order("creado_en", { ascending: true });

  // Contactos pendientes
  const { data: contactos } = await supabase
    .from("contactos")
    .select(
      `
      id,
      titulo,
      descripcion,
      edad,
      ciudad,
      genero,
      busca,
      whatsapp,
      imagen_url,
      creado_en,
      user_id,
      profiles:user_id ( username )
    `
    )
    .eq("estado", "pendiente")
    .order("creado_en", { ascending: true });

  const total = (confesiones?.length ?? 0) + (contactos?.length ?? 0);

  const formatearFecha = (fecha: string) => {
    const d = new Date(fecha);
    const ahora = new Date();
    const diff = Math.floor((ahora.getTime() - d.getTime()) / 1000);

    if (diff < 60) return "hace un momento";
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
    if (diff < 604800) return `hace ${Math.floor(diff / 86400)} d`;

    return d.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-3xl font-bold text-texto">
          ⏳ Pendientes
        </h2>
        <p className="text-sm text-texto-suave mt-1">
          {total} publicacion{total !== 1 ? "es" : ""} por revisar
        </p>
      </div>

      {total === 0 && (
        <div className="text-center py-20 bg-fondo-card border border-borde rounded-2xl">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-texto">
            ¡Todo al día!
          </h3>
          <p className="text-sm text-texto-suave mt-2">
            No hay publicaciones pendientes
          </p>
        </div>
      )}

      {/* ============================================
          📝 CONFESIONES PENDIENTES
          ============================================ */}
      {confesiones && confesiones.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-marca flex items-center gap-2">
            📝 Confesiones ({confesiones.length})
          </h3>

          {confesiones.map((c) => {
            const perfil = Array.isArray(c.profiles)
              ? c.profiles[0]
              : c.profiles;
            const username = perfil?.username ?? "usuario";

            return (
              <div
                key={c.id}
                className="bg-fondo-card border border-borde rounded-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="bg-marca/5 border-b border-borde px-6 py-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-marca/20 text-marca border border-marca/30">
                          📝 Confesión
                        </span>
                        {c.anonima ? (
                          <span className="text-xs text-texto-suave">
                            🕵️ Se publicará como Anónima
                          </span>
                        ) : (
                          <span className="text-xs text-texto-suave">
                            👤 Se publicará con nombre
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-texto mt-2">
                        <strong className="text-texto">Autor real:</strong>{" "}
                        <span className="text-marca">@{username}</span>
                      </p>
                    </div>

                    <p className="text-xs text-texto-suave">
                      📅 {formatearFecha(c.creado_en)}
                    </p>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-6 space-y-4">

                  {/* Foto grande */}
                  {c.imagen_url && (
                    <div className="rounded-2xl overflow-hidden border border-borde bg-fondo">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.imagen_url}
                        alt={c.titulo}
                        className="w-full h-auto max-h-[500px] object-contain"
                      />
                    </div>
                  )}

                  {/* Título */}
                  <div>
                    <p className="text-xs text-texto-suave uppercase font-semibold mb-1">
                      Título
                    </p>
                    <h4 className="text-2xl font-bold text-texto">
                      {c.titulo}
                    </h4>
                  </div>

                  {/* Contenido completo */}
                  <div>
                    <p className="text-xs text-texto-suave uppercase font-semibold mb-1">
                      Contenido
                    </p>
                    <div className="bg-fondo border border-borde rounded-xl p-4 text-texto leading-relaxed whitespace-pre-wrap">
                      {c.contenido}
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="bg-fondo-card border-t border-borde p-6">
                  <PanelModerar
                    tipo="confesion"
                    id={c.id}
                    titulo={c.titulo}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================
          💘 CONTACTOS PENDIENTES
          ============================================ */}
      {contactos && contactos.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-rosa flex items-center gap-2">
            💘 Anuncios ({contactos.length})
          </h3>

          {contactos.map((c) => {
            const perfil = Array.isArray(c.profiles)
              ? c.profiles[0]
              : c.profiles;
            const username = perfil?.username ?? "usuario";

            return (
              <div
                key={c.id}
                className="bg-fondo-card border border-borde rounded-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="bg-rosa/5 border-b border-borde px-6 py-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rosa/20 text-rosa border border-rosa/30">
                          💘 Anuncio de contacto
                        </span>
                      </div>
                      <p className="text-sm text-texto mt-2">
                        <strong className="text-texto">Autor real:</strong>{" "}
                        <span className="text-rosa">@{username}</span>
                      </p>
                    </div>

                    <p className="text-xs text-texto-suave">
                      📅 {formatearFecha(c.creado_en)}
                    </p>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-6 space-y-4">

                  <div className="grid md:grid-cols-[1fr_300px] gap-6">

                    {/* Info */}
                    <div className="space-y-4">
                      {/* Título */}
                      <div>
                        <p className="text-xs text-texto-suave uppercase font-semibold mb-1">
                          Título
                        </p>
                        <h4 className="text-2xl font-bold text-texto">
                          {c.titulo}
                        </h4>
                      </div>

                      {/* Datos */}
                      <div>
                        <p className="text-xs text-texto-suave uppercase font-semibold mb-2">
                          Datos
                        </p>
                        <div className="flex flex-wrap gap-2 text-sm">
                          {c.edad && (
                            <span className="px-3 py-1.5 rounded-full bg-fondo border border-borde text-texto-suave">
                              🎂 {c.edad} años
                            </span>
                          )}
                          {c.ciudad && (
                            <span className="px-3 py-1.5 rounded-full bg-fondo border border-borde text-texto-suave">
                              📍 {c.ciudad}
                            </span>
                          )}
                          {c.genero && (
                            <span className="px-3 py-1.5 rounded-full bg-fondo border border-borde text-texto-suave">
                              👤 {c.genero}
                            </span>
                          )}
                          {c.busca && (
                            <span className="px-3 py-1.5 rounded-full bg-fondo border border-borde text-texto-suave">
                              🔍 {c.busca}
                            </span>
                          )}
                          {c.whatsapp && (
                            <span className="px-3 py-1.5 rounded-full bg-fondo border border-borde text-texto-suave">
                              📱 {c.whatsapp}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Descripción */}
                      <div>
                        <p className="text-xs text-texto-suave uppercase font-semibold mb-1">
                          Descripción
                        </p>
                        <div className="bg-fondo border border-borde rounded-xl p-4 text-texto leading-relaxed whitespace-pre-wrap">
                          {c.descripcion}
                        </div>
                      </div>
                    </div>

                    {/* Foto grande */}
                    {c.imagen_url && (
                      <div className="rounded-2xl overflow-hidden border border-borde bg-fondo">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={c.imagen_url}
                          alt={c.titulo}
                          className="w-full h-auto object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="bg-fondo-card border-t border-borde p-6">
                  <PanelModerar
                    tipo="contacto"
                    id={c.id}
                    titulo={c.titulo}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}