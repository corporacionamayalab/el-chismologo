import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BotonReporte from "@/components/BotonReporte";

export const revalidate = 0;

const FILTROS = [
  { valor: "pendientes", label: "Pendientes", emoji: "🔔" },
  { valor: "revisados", label: "Revisados", emoji: "✅" },
  { valor: "todos", label: "Todos", emoji: "📋" },
];

const MOTIVOS: Record<string, { label: string; emoji: string; color: string }> = {
  spam: { label: "Spam", emoji: "🚫", color: "text-neon" },
  ofensivo: { label: "Ofensivo", emoji: "😠", color: "text-error" },
  acoso: { label: "Acoso", emoji: "⚠️", color: "text-error" },
  sexual: { label: "Contenido sexual", emoji: "🔞", color: "text-rosa" },
  otro: { label: "Otro", emoji: "❓", color: "text-texto-suave" },
};

export default async function AdminReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>;
}) {
  const { filtro = "pendientes" } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("reportes")
    .select(
      `
      id,
      motivo,
      detalle,
      revisado,
      creado_en,
      usuario_reportado,
      confesion_id,
      comentario_id,
      contacto_id,
      reportado_por,
      reportador:profiles!reportes_reportado_por_fkey ( id, username, avatar_url ),
      reportado:profiles!reportes_usuario_reportado_fkey ( id, username, avatar_url )
    `
    )
    .order("creado_en", { ascending: false })
    .limit(100);

  if (filtro === "pendientes") query = query.eq("revisado", false);
  if (filtro === "revisados") query = query.eq("revisado", true);

  const { data: reportes, error } = await query;

  const pendientes = reportes?.filter((r) => !r.revisado).length ?? 0;

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-texto">🚨 Reportes</h2>
          <p className="text-sm text-texto-suave mt-1">
            {pendientes > 0
              ? `${pendientes} reporte${pendientes !== 1 ? "s" : ""} pendiente${pendientes !== 1 ? "s" : ""} de revisar`
              : "Todo al día ✅"}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <Link
            key={f.valor}
            href={`/admin/reportes?filtro=${f.valor}`}
            className={`
              px-4 py-2 rounded-xl text-sm font-medium transition-all
              ${
                filtro === f.valor
                  ? "bg-gradient-to-r from-error to-rosa text-white shadow-lg shadow-error/20"
                  : "bg-fondo-card border border-borde text-texto-suave hover:text-texto hover:border-error/30"
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

      {!reportes?.length ? (
        <div className="text-center py-16 bg-fondo-card border border-borde rounded-2xl">
          <div className="text-5xl mb-3">🎉</div>
          <p className="text-sm text-texto-suave">
            No hay reportes {filtro !== "todos" && `en estado "${filtro}"`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reportes.map((r) => {
            const reportador = Array.isArray(r.reportador)
              ? r.reportador[0]
              : r.reportador;
            const reportado = Array.isArray(r.reportado)
              ? r.reportado[0]
              : r.reportado;

            const motivo = MOTIVOS[r.motivo] ?? MOTIVOS.otro;

            return (
              <div
                key={r.id}
                className={`
                  bg-fondo-card border rounded-2xl p-5 space-y-4
                  ${
                    r.revisado
                      ? "border-borde opacity-60"
                      : "border-error/30"
                  }
                `}
              >
                {/* Header */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border border-borde bg-fondo ${motivo.color}`}
                  >
                    {motivo.emoji} {motivo.label}
                  </span>

                  {!r.revisado && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-error/10 border border-error/30 text-error">
                      🔔 Pendiente
                    </span>
                  )}

                  {r.revisado && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-exito/10 border border-exito/30 text-exito">
                      ✅ Revisado
                    </span>
                  )}

                  <span className="text-xs text-texto-suave ml-auto">
                    {new Date(r.creado_en).toLocaleString("es-ES")}
                  </span>
                </div>

                {/* Quién reportó a quién */}
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-fondo rounded-xl p-3 border border-borde">
                    <p className="text-xs text-texto-suave mb-1">
                      Reportó
                    </p>
                    <p className="font-semibold text-texto truncate">
                      @{reportador?.username ?? "desconocido"}
                    </p>
                  </div>
                  <div className="bg-fondo rounded-xl p-3 border border-error/20">
                    <p className="text-xs text-texto-suave mb-1">
                      Reportado
                    </p>
                    <p className="font-semibold text-error truncate">
                      @{reportado?.username ?? "desconocido"}
                    </p>
                  </div>
                </div>

                {/* Detalle */}
                {r.detalle && (
                  <div className="bg-fondo rounded-xl p-3 border border-borde">
                    <p className="text-xs text-texto-suave mb-1">Detalle</p>
                    <p className="text-sm text-texto whitespace-pre-wrap">
                      {r.detalle}
                    </p>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex flex-wrap gap-2 pt-3 border-t border-borde">
                  {reportado?.id && (
                    <Link
                      href={`/amigos/${reportado.id}`}
                      target="_blank"
                      className="text-xs px-3 py-2 rounded-lg bg-fondo border border-borde text-texto-suave hover:text-marca hover:border-marca/30 transition"
                    >
                      👤 Ver perfil
                    </Link>
                  )}

                  {r.confesion_id && (
                    <Link
                      href={`/confesiones/${r.confesion_id}`}
                      target="_blank"
                      className="text-xs px-3 py-2 rounded-lg bg-fondo border border-borde text-texto-suave hover:text-marca hover:border-marca/30 transition"
                    >
                      📝 Ver confesión
                    </Link>
                  )}

                  {r.contacto_id && (
                    <Link
                      href="/contactos"
                      target="_blank"
                      className="text-xs px-3 py-2 rounded-lg bg-fondo border border-borde text-texto-suave hover:text-rosa hover:border-rosa/30 transition"
                    >
                      💘 Ver anuncio
                    </Link>
                  )}

                  <BotonReporte
                    reporteId={r.id}
                    revisado={r.revisado}
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