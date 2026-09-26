import { createClient } from "@/lib/supabase/server";

type BotonModerarProps = {
  tipo: "confesion" | "contacto";
  id: string;
  titulo: string;
};

function BotonModerar({ tipo, id, titulo }: BotonModerarProps) {
  return (
    <form
      action="/api/admin/moderar"
      method="post"
      className="flex flex-wrap gap-2"
    >
      <input type="hidden" name="tipo" value={tipo} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="titulo" value={titulo} />
      <button
        type="submit"
        name="estado"
        value="publicada"
        className="rounded-xl bg-verde px-4 py-2 text-sm font-semibold text-white"
      >
        ✅ Aprobar
      </button>
      <button
        type="submit"
        name="estado"
        value="rechazada"
        className="rounded-xl bg-rojo px-4 py-2 text-sm font-semibold text-white"
      >
        ❌ Rechazar
      </button>
    </form>
  );
}

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

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-3xl font-bold text-texto">⏳ Pendientes</h2>
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

      {/* Confesiones pendientes */}
      {confesiones && confesiones.length > 0 && (
        <div className="space-y-4">
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
                className="bg-fondo-card border border-borde rounded-2xl p-6 space-y-4"
              >
                {/* Info */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="text-xs text-texto-suave space-y-1">
                    <p>
                      <strong className="text-texto">Autor real:</strong>{" "}
                      @{username}
                    </p>
                    <p>
                      {c.anonima
                        ? "🕵️ Se publicará como Anónima"
                        : "👤 Se publicará con su nombre"}
                    </p>
                    <p>
                      📅{" "}
                      {new Date(c.creado_en).toLocaleString("es-ES")}
                    </p>
                  </div>
                </div>

                {/* Contenido */}
                <div className="border-t border-borde pt-4">
                  <h4 className="text-xl font-bold text-texto">
                    {c.titulo}
                  </h4>
                  <p className="text-sm text-texto-suave mt-2 whitespace-pre-wrap">
                    {c.contenido}
                  </p>

                  {c.imagen_url && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-borde max-w-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.imagen_url}
                        alt={c.titulo}
                        className="w-full h-auto"
                      />
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="border-t border-borde pt-4">
                  <BotonModerar
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

      {/* Contactos pendientes */}
      {contactos && contactos.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-rosa flex items-center gap-2">
            💘 Contactos ({contactos.length})
          </h3>

          {contactos.map((c) => {
            const perfil = Array.isArray(c.profiles)
              ? c.profiles[0]
              : c.profiles;
            const username = perfil?.username ?? "usuario";

            return (
              <div
                key={c.id}
                className="bg-fondo-card border border-borde rounded-2xl p-6 space-y-4"
              >
                {/* Info */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="text-xs text-texto-suave space-y-1">
                    <p>
                      <strong className="text-texto">Autor real:</strong>{" "}
                      @{username}
                    </p>
                    <p>
                      📅{" "}
                      {new Date(c.creado_en).toLocaleString("es-ES")}
                    </p>
                  </div>
                </div>

                {/* Contenido */}
                <div className="border-t border-borde pt-4 grid md:grid-cols-[1fr_200px] gap-4">
                  <div>
                    <h4 className="text-xl font-bold text-texto">
                      {c.titulo}
                    </h4>

                    <div className="flex flex-wrap gap-2 mt-2 text-xs">
                      {c.edad && (
                        <span className="px-2 py-0.5 rounded-full bg-fondo border border-borde text-texto-suave">
                          🎂 {c.edad}
                        </span>
                      )}
                      {c.ciudad && (
                        <span className="px-2 py-0.5 rounded-full bg-fondo border border-borde text-texto-suave">
                          📍 {c.ciudad}
                        </span>
                      )}
                      {c.genero && (
                        <span className="px-2 py-0.5 rounded-full bg-fondo border border-borde text-texto-suave">
                          👤 {c.genero}
                        </span>
                      )}
                      {c.busca && (
                        <span className="px-2 py-0.5 rounded-full bg-fondo border border-borde text-texto-suave">
                          🔍 {c.busca}
                        </span>
                      )}
                      {c.whatsapp && (
                        <span className="px-2 py-0.5 rounded-full bg-fondo border border-borde text-texto-suave">
                          📱 {c.whatsapp}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-texto-suave mt-3 whitespace-pre-wrap">
                      {c.descripcion}
                    </p>
                  </div>

                  {c.imagen_url && (
                    <div className="rounded-xl overflow-hidden border border-borde">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.imagen_url}
                        alt={c.titulo}
                        className="w-full h-auto"
                      />
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="border-t border-borde pt-4">
                  <BotonModerar
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