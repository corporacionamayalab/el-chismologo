import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SidebarContactos from "@/components/SidebarContactos";

export const revalidate = 0;

export default async function ContactosPage() {
  const supabase = await createClient();

  const { data: contactos, error } = await supabase
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
      profiles:user_id ( username )
    `
    )
    .eq("estado", "aprobada")
    .order("creado_en", { ascending: false })
    .limit(60);

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

  const limpiarWhatsApp = (num: string) => num.replace(/\D/g, "");

  return (
    <main className="min-h-screen py-8 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">

        {/* Grid principal: contenido + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">

          {/* COLUMNA IZQUIERDA: Anuncios */}
          <div className="min-w-0">

            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-black gradient-animated">
                  Contactos
                </h1>
                <p className="text-xs text-texto-suave mt-1">
                  Encuentra a alguien especial 💘
                </p>
              </div>

              <Link
                href="/contactos/nuevo"
                className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-marca to-rosa text-white text-sm font-semibold hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-marca/20"
              >
                <span>+</span>
                <span className="hidden sm:inline">Publicar</span>
              </Link>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 rounded-xl bg-error/10 border border-error/30 text-error text-sm mb-4">
                Error al cargar contactos: {error.message}
              </div>
            )}

            {/* Estado vacío */}
            {!contactos?.length && !error && (
              <div className="text-center py-20 bg-fondo-card border border-borde rounded-2xl">
                <div className="text-6xl mb-4">💘</div>
                <h2 className="text-xl font-bold text-texto">
                  Aún no hay anuncios
                </h2>
                <p className="text-sm text-texto-suave mt-2 mb-6">
                  Sé el primero en publicar tu anuncio 💌
                </p>
                <Link
                  href="/contactos/nuevo"
                  className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-marca to-rosa text-white font-semibold hover:opacity-90 transition"
                >
                  Publicar el primero
                </Link>
              </div>
            )}

            {/* Grid de anuncios */}
            <div className="grid gap-4 sm:grid-cols-2">
              {contactos?.map((c) => {
                const perfil = Array.isArray(c.profiles)
                  ? c.profiles[0]
                  : c.profiles;
                const username = perfil?.username ?? "usuario";
                const inicial = username[0]?.toUpperCase() ?? "?";

                return (
                  <Link
                    key={c.id}
                    href={`/contactos/${c.id}`}
                    className="group bg-fondo-card border border-borde rounded-2xl overflow-hidden hover:border-rosa/40 transition-all duration-300 hover:-translate-y-0.5 flex flex-col"
                  >
                    {/* Foto/Header */}
                    <div className="relative h-40 bg-fondo overflow-hidden">
                      {c.imagen_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.imagen_url}
                          alt={c.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-marca/20 to-rosa/20">
                          <span className="text-5xl font-black text-white/80">
                            {inicial}
                          </span>
                        </div>
                      )}

                      {/* Badge busca */}
                      {c.busca && (
                        <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-black/60 backdrop-blur text-white">
                          {c.busca === "Pareja" && "💕 Pareja"}
                          {c.busca === "Amistad" && "🤝 Amistad"}
                          {c.busca === "Algo casual" && "✨ Casual"}
                        </span>
                      )}
                    </div>

                    {/* Contenido */}
                    <div className="p-4 flex-1 flex flex-col">

                      <h2 className="text-base font-bold text-texto group-hover:text-marca transition-colors line-clamp-1">
                        {c.titulo}
                      </h2>

                      <div className="flex flex-wrap gap-1.5 mt-2 text-xs text-texto-suave">
                        {c.edad && (
                          <span className="px-2 py-0.5 rounded-full bg-fondo border border-borde">
                            🎂 {c.edad}
                          </span>
                        )}
                        {c.ciudad && (
                          <span className="px-2 py-0.5 rounded-full bg-fondo border border-borde">
                            📍 {c.ciudad}
                          </span>
                        )}
                        {c.genero && (
                          <span className="px-2 py-0.5 rounded-full bg-fondo border border-borde">
                            👤 {c.genero}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-texto-suave mt-2.5 leading-relaxed line-clamp-2 flex-1">
                        {c.descripcion}
                      </p>

                      <div className="mt-3 pt-3 border-t border-borde flex items-center justify-between gap-2">
                        <span className="text-xs text-texto-suave">
                          {formatearFecha(c.creado_en)}
                        </span>

                        <span className="text-xs text-marca font-semibold opacity-0 group-hover:opacity-100 transition">
                          Ver más →
                        </span>
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
              <SidebarContactos />
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}