import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

const EMOJIS: Record<string, string> = {
  comentario: "💬",
  reaccion: "❤️",
  solicitud_amistad: "👥",
  solicitud_aceptada: "✅",
  mensaje: "💬",
  confesion_aprobada: "✅",
  confesion_rechazada: "❌",
  anuncio_aprobado: "✅",
  anuncio_rechazado: "❌",
  reporte: "🚨",
};

export default async function NotificacionesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: notificaciones } = await supabase
    .from("notificaciones")
    .select("*")
    .eq("user_id", user.id)
    .order("creado_en", { ascending: false })
    .limit(100);

  // Marcar todas como leídas al entrar
  await supabase
    .from("notificaciones")
    .update({ leida: true })
    .eq("user_id", user.id)
    .eq("leida", false);

  const formatearFecha = (fecha: string) => {
    const d = new Date(fecha);
    const ahora = new Date();
    const diff = Math.floor((ahora.getTime() - d.getTime()) / 1000);

    if (diff < 60) return "ahora mismo";
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
    <main className="min-h-screen py-10 px-6">
      <div className="max-w-3xl mx-auto">

        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black gradient-animated">
            Notificaciones
          </h1>
          <p className="text-sm text-texto-suave mt-2">
            Todo lo que pasó mientras no mirabas 🔔
          </p>
        </div>

        {!notificaciones?.length ? (
          <div className="text-center py-20 bg-fondo-card border border-borde rounded-2xl">
            <div className="text-6xl mb-4">🔕</div>
            <h2 className="text-xl font-bold text-texto">
              No tienes notificaciones
            </h2>
            <p className="text-sm text-texto-suave mt-2">
              Cuando alguien interactúe contigo, aparecerá aquí
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notificaciones.map((n) => {
              const contenido = (
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-fondo border border-borde flex items-center justify-center text-xl flex-shrink-0">
                    {EMOJIS[n.tipo] ?? "🔔"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-texto">
                      {n.titulo}
                    </p>
                    {n.contenido && (
                      <p className="text-sm text-texto-suave mt-1">
                        {n.contenido}
                      </p>
                    )}
                    <p className="text-xs text-texto-suave mt-1.5">
                      {formatearFecha(n.creado_en)}
                    </p>
                  </div>
                  {n.url && (
                    <span className="text-marca text-sm flex-shrink-0">→</span>
                  )}
                </div>
              );

              return n.url ? (
                <Link
                  key={n.id}
                  href={n.url}
                  className="block bg-fondo-card border border-borde rounded-2xl p-4 hover:border-marca/30 hover:bg-fondo-card-hover transition"
                >
                  {contenido}
                </Link>
              ) : (
                <div
                  key={n.id}
                  className="bg-fondo-card border border-borde rounded-2xl p-4"
                >
                  {contenido}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}