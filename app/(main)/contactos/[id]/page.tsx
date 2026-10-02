import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ComentariosContacto from "@/components/ComentariosContacto";
import ReaccionesContacto from "@/components/ReaccionesContacto";

export const revalidate = 0;

export default async function ContactoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: contacto } = await supabase
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
      estado,
      vistas,
      creado_en,
      user_id,
      perfil:profiles!contactos_user_id_fkey ( id, username, avatar_url, ultima_conexion )
    `
    )
    .eq("id", id)
    .single();

  if (!contacto || contacto.estado !== "aprobada") notFound();

  const perfil = Array.isArray(contacto.perfil)
    ? contacto.perfil[0]
    : contacto.perfil;

  // Sumar vista
  await supabase
    .from("contactos")
    .update({ vistas: (contacto.vistas ?? 0) + 1 })
    .eq("id", id);

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
      month: "long",
      year: "numeric",
    });
  };

  const limpiarWhatsApp = (num: string) => num.replace(/\D/g, "");
  const inicial = (perfil?.username?.[0] ?? "?").toUpperCase();

  return (
    <main className="min-h-screen py-8 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">

        <Link
          href="/contactos"
          className="inline-flex items-center gap-2 text-sm text-texto-suave hover:text-marca transition mb-6"
        >
          ← Volver a contactos
        </Link>

        <div className="bg-fondo-card border border-borde rounded-2xl overflow-hidden">

          {/* Foto grande */}
          {contacto.imagen_url && (
            <div className="w-full bg-fondo overflow-hidden border-b border-borde">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={contacto.imagen_url}
                alt={contacto.titulo}
                className="w-full h-auto max-h-[600px] object-contain mx-auto"
              />
            </div>
          )}

          <div className="p-6 md:p-8 space-y-6">

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {contacto.busca && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-rosa/10 border border-rosa/30 text-rosa">
                  {contacto.busca === "Pareja" && "💕 Busco pareja"}
                  {contacto.busca === "Amistad" && "🤝 Busco amistad"}
                  {contacto.busca === "Algo casual" && "✨ Algo casual"}
                </span>
              )}
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-marca/10 border border-marca/30 text-marca">
                👁️ {contacto.vistas} vistas
              </span>
            </div>

            {/* Título */}
            <h1 className="text-3xl md:text-4xl font-black text-texto">
              {contacto.titulo}
            </h1>

            {/* Autor */}
            <Link
              href={`/amigos/${perfil?.id}`}
              className="flex items-center gap-3 group w-fit"
            >
              {perfil?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={perfil.avatar_url}
                  alt={perfil.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-marca to-rosa flex items-center justify-center text-white font-bold">
                  {inicial}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-texto group-hover:text-marca transition">
                  @{perfil?.username ?? "usuario"}
                </p>
                <p className="text-xs text-texto-suave">
                  {formatearFecha(contacto.creado_en)}
                </p>
              </div>
            </Link>

            {/* Info chips */}
            <div className="flex flex-wrap gap-2">
              {contacto.edad && (
                <span className="px-3 py-1.5 rounded-full bg-fondo border border-borde text-sm text-texto-suave">
                  🎂 {contacto.edad} años
                </span>
              )}
              {contacto.ciudad && (
                <span className="px-3 py-1.5 rounded-full bg-fondo border border-borde text-sm text-texto-suave">
                  📍 {contacto.ciudad}
                </span>
              )}
              {contacto.genero && (
                <span className="px-3 py-1.5 rounded-full bg-fondo border border-borde text-sm text-texto-suave">
                  👤 {contacto.genero}
                </span>
              )}
            </div>

            {/* Descripción */}
            <div>
              <h2 className="text-sm font-bold text-texto-suave uppercase mb-2">
                📝 Descripción
              </h2>
              <p className="text-texto leading-relaxed whitespace-pre-wrap">
                {contacto.descripcion}
              </p>
            </div>

            {/* WhatsApp */}
            {contacto.whatsapp && (
              <a
                href={`https://wa.me/${limpiarWhatsApp(contacto.whatsapp)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-all hover:scale-[1.01] shadow-lg shadow-green-600/20"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Contactar por WhatsApp
              </a>
            )}

            {/* Reacciones */}
            <ReaccionesContacto contactoId={id} />

            {/* Comentarios */}
            <div className="pt-6 border-t border-borde">
              <ComentariosContacto contactoId={id} />
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}