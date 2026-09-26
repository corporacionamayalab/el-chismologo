import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

const FILTROS = [
  { valor: "todas", label: "Todos", emoji: "📋" },
  { valor: "pendiente", label: "Pendientes", emoji: "⏳" },
  { valor: "aprobada", label: "Aprobados", emoji: "✅" },
  { valor: "rechazada", label: "Rechazados", emoji: "❌" },
];

export default async function AdminContactosPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>;
}) {
  const { filtro = "todas" } = await searchParams;
  const supabase = await createClient();

  let query = supabase
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
      imagen_url,
      creado_en,
      user_id,
      profiles:user_id ( username )
    `
    )
    .order("creado_en", { ascending: false })
    .limit(100);

  if (filtro !== "todas") {
    query = query.eq("estado", filtro);
  }

  const { data: contactos, error } = await query;

  const colorsEstado: Record<string, string> = {
    pendiente: "text-neon bg-neon/10 border-neon/30",
    aprobada: "text-exito bg-exito/10 border-exito/30",
    rechazada: "text-error bg-error/10 border-error/30",
  };

  const emojiEstado: Record<string, string> = {
    pendiente: "⏳",
    aprobada: "✅",
    rechazada: "❌",
  };

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-3xl font-bold text-texto">💘 Contactos</h2>
        <p className="text-sm text-texto-suave mt-1">
          {contactos?.length ?? 0} anuncio(s)
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <Link
            key={f.valor}
            href={`/admin/contactos?filtro=${f.valor}`}
            className={`
              px-4 py-2 rounded-xl text-sm font-medium transition-all
              ${
                filtro === f.valor
                  ? "bg-gradient-to-r from-rosa to-marca text-white shadow-lg shadow-rosa/20"
                  : "bg-fondo-card border border-borde text-texto-suave hover:text-texto hover:border-rosa/30"
              }
            `}
          >
            {f.emoji} {f.label}
          </Link>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-error/10 border border-error/30 text-error text-sm">
          Error: {error.message}
        </div>
      )}

      {!contactos?.length ? (
        <div className="text-center py-16 bg-fondo-card border border-borde rounded-2xl">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-sm text-texto-suave">
            No hay contactos {filtro !== "todas" && `en estado "${filtro}"`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {contactos.map((c) => {
            const perfil = Array.isArray(c.profiles)
              ? c.profiles[0]
              : c.profiles;
            const username = perfil?.username ?? "usuario";

            return (
              <div
                key={c.id}
                className="bg-fondo-card border border-borde rounded-2xl p-5 hover:border-rosa/30 transition"
              >
                <div className="flex items-start gap-4">

                  {/* Foto */}
                  {c.imagen_url && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-borde flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.imagen_url}
                        alt={c.titulo}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`
                          text-xs font-semibold px-2 py-0.5 rounded-full border
                          ${colorsEstado[c.estado]}
                        `}
                      >
                        {emojiEstado[c.estado]} {c.estado}
                      </span>
                      <span className="text-xs text-texto-suave">
                        @{username}
                      </span>
                      <span className="text-xs text-texto-suave">
                        · {new Date(c.creado_en).toLocaleDateString("es-ES")}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-texto mt-2">
                      {c.titulo}
                    </h3>
                    <p className="text-sm text-texto-suave mt-1 line-clamp-2">
                      {c.descripcion}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-texto-suave">
                      {c.edad && <span>🎂 {c.edad}</span>}
                      {c.ciudad && <span>📍 {c.ciudad}</span>}
                    </div>

                    {c.motivo_rechazo && (
                      <p className="text-xs text-error mt-2">
                        Motivo: {c.motivo_rechazo}
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/contactos`}
                    target="_blank"
                    className="text-xs text-rosa hover:text-marca transition whitespace-nowrap"
                  >
                    Ver web →
                  </Link>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}