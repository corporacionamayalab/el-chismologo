import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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

  const limpiarWhatsApp = (num: string) => num.replace(/\D/g, "");

  return (
    <main className="min-h-screen py-10 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header de sección */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-rosa to-marca bg-clip-text text-transparent">
              Contactos
            </h1>
            <p className="text-sm text-texto-suave mt-2">
              Encuentra a alguien especial 💘
            </p>
          </div>

          <Link
            href="/contactos/nuevo"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rosa to-marca text-white font-semibold hover:from-rosa-hover hover:to-marca-hover transition-all hover:scale-105 shadow-lg shadow-rosa/20"
          >
            + Publicar anuncio
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-error/10 border border-error/30 text-error text-sm">
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
              className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-rosa to-marca text-white font-semibold hover:from-rosa-hover hover:to-marca-hover transition"
            >
              Crear el primero
            </Link>
          </div>
        )}

        {/* Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {contactos?.map((c) => {
            const perfil = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
            const username = perfil?.username ?? "usuario";
            const inicial = username[0]?.toUpperCase() ?? "?";

            return (
              <div
                key={c.id}
                className="group bg-fondo-card border border-borde rounded-2xl overflow-hidden hover:border-rosa/50 hover:bg-fondo-card-hover transition-all duration-300 hover:-translate-y-1 relative"
              >
                {/* Foto */}
                <div className="relative h-48 bg-fondo overflow-hidden">
                  {c.imagen_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.imagen_url}
                      alt={c.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-marca/20 to-rosa/20">
                      <span className="text-6xl font-black text-white/80">
                        {inicial}
                      </span>
                    </div>
                  )}

                  {/* Badge de "busca" */}
                  {c.busca && (
                    <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-black/60 backdrop-blur text-white">
                      {c.busca === "Pareja" && "💕 Pareja"}
                      {c.busca === "Amistad" && "🤝 Amistad"}
                      {c.busca === "Algo casual" && "✨ Casual"}
                    </span>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-5">

                  {/* Título */}
                  <h2 className="text-lg font-bold text-texto group-hover:text-rosa transition-colors line-clamp-1">
                    {c.titulo}
                  </h2>

                  {/* Datos */}
                  <div className="flex flex-wrap gap-2 mt-2 text-xs text-texto-suave">
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

                  {/* Descripción */}
                  <p className="text-sm text-texto-suave mt-3 leading-relaxed line-clamp-3">
                    {c.descripcion}
                  </p>

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-borde flex items-center justify-between gap-2">
                    <span className="text-xs text-texto-suave">
                      {formatearFecha(c.creado_en)}
                    </span>

                    {c.whatsapp ? (
                      <a
                        href={`https://wa.me/${limpiarWhatsApp(c.whatsapp)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white transition"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-3.5 h-3.5"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                        WhatsApp
                      </a>
                    ) : (
                      <span className="text-xs text-texto-suave">
                        @{username}
                      </span>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </main>
  );
}