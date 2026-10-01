import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BotonBorrar from "@/components/BotonBorrar";

export const revalidate = 0;

const ESTADOS: Record<
  string,
  { label: string; emoji: string; clases: string }
> = {
  pendiente: {
    label: "En revisión",
    emoji: "⏳",
    clases: "text-marca bg-marca/10 border-marca/30",
  },
  aprobada: {
    label: "Publicado",
    emoji: "✅",
    clases: "text-exito bg-exito/10 border-exito/30",
  },
  rechazada: {
    label: "Rechazado",
    emoji: "❌",
    clases: "text-error bg-error/10 border-error/30",
  },
};

export default async function MisAnunciosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: anuncios, error } = await supabase
    .from("contactos")
    .select(
      `
      id,
      titulo,
      descripcion,
      estado,
      motivo_rechazo,
      edad,
      ciudad,
      genero,
      busca,
      whatsapp,
      imagen_url,
      creado_en
    `
    )
    .eq("user_id", user.id)
    .order("creado_en", { ascending: false });

  const ids = anuncios?.map((a) => a.id) ?? [];

  const { data: vistas } = ids.length
    ? await supabase
        .from("vistas")
        .select("confesion_id")
        .in("confesion_id", ids)
    : { data: [] };

  const contar = (arr: { confesion_id: string }[] | null, id: string) =>
    arr?.filter((x) => x.confesion_id === id).length ?? 0;

  const formatearFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <main className="min-h-screen py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-black gradient-animated">
              Mis anuncios
            </h1>
            <p className="text-sm text-texto-suave mt-2">
              Tus búsquedas de pareja y amistad 💘
            </p>
          </div>

          <Link
            href="/contactos/nuevo"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-marca to-rosa text-white font-semibold hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-marca/20"
          >
            + Nuevo
          </Link>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-error/10 border border-error/30 text-error text-sm">
            Error: {error.message}
          </div>
        )}

        {!anuncios?.length && !error && (
          <div className="text-center py-20 bg-fondo-card border border-borde rounded-2xl">
            <div className="text-6xl mb-4">💘</div>
            <h2 className="text-xl font-bold text-texto">
              Aún no tienes anuncios
            </h2>
            <p className="text-sm text-texto-suave mt-2 mb-6">
              Publica tu anuncio y encuentra a alguien especial 🔍
            </p>
            <Link
              href="/contactos/nuevo"
              className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-marca to-rosa text-white font-semibold hover:opacity-90 transition"
            >
              Publicar mi primer anuncio
            </Link>
          </div>
        )}

        <div className="grid gap-4">
          {anuncios?.map((a) => {
            const estado = ESTADOS[a.estado] ?? ESTADOS.pendiente;

            return (
              <div
                key={a.id}
                className="group bg-fondo-card border border-borde rounded-2xl overflow-hidden hover:border-marca/30 transition-all relative"
              >
                <div className="flex flex-col sm:flex-row">
                  {a.imagen_url && (
                    <div className="sm:w-40 h-40 sm:h-auto sm:min-h-full bg-fondo flex-shrink-0 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={a.imagen_url}
                        alt={a.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}

                  <div className="flex-1 p-6 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${estado.clases}`}
                      >
                        {estado.emoji} {estado.label}
                      </span>
                      {a.busca && (
                        <span className="text-xs text-texto-suave">
                          {a.busca === "Pareja" && "💕 Pareja"}
                          {a.busca === "Amistad" && "🤝 Amistad"}
                          {a.busca === "Algo casual" && "✨ Casual"}
                        </span>
                      )}
                      <span className="text-xs text-texto-suave ml-auto">
                        {formatearFecha(a.creado_en)}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-texto group-hover:text-marca transition-colors">
                      {a.titulo}
                    </h2>

                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-texto-suave">
                      {a.edad && (
                        <span className="px-2 py-0.5 rounded-full bg-fondo border border-borde">
                          🎂 {a.edad}
                        </span>
                      )}
                      {a.ciudad && (
                        <span className="px-2 py-0.5 rounded-full bg-fondo border border-borde">
                          📍 {a.ciudad}
                        </span>
                      )}
                      {a.genero && (
                        <span className="px-2 py-0.5 rounded-full bg-fondo border border-borde">
                          👤 {a.genero}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-texto-suave mt-3 leading-relaxed line-clamp-2">
                      {a.descripcion}
                    </p>

                    {a.estado === "rechazada" && a.motivo_rechazo && (
                      <div className="mt-3 p-3 rounded-lg bg-error/10 border border-error/30">
                        <p className="text-xs text-error">
                          <strong>Motivo:</strong> {a.motivo_rechazo}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-borde text-xs text-texto-suave">
                      <span className="flex items-center gap-1.5">
                        👁️ {contar(vistas, a.id)} vistas
                      </span>

                      <div className="ml-auto flex items-center gap-3">
                        {a.estado === "aprobada" && (
                          <Link
                            href="/contactos"
                            className="text-xs text-marca hover:text-rosa transition"
                          >
                            Ver en web →
                          </Link>
                        )}
                        <BotonBorrar
                          tipo="contacto"
                          id={a.id}
                          titulo={a.titulo}
                        />
                      </div>
                    </div>
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