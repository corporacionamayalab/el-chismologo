import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Contadores
  const { count: confPendientes } = await supabase
    .from("confesiones")
    .select("*", { count: "exact", head: true })
    .eq("estado", "pendiente");

  const { count: confAprobadas } = await supabase
    .from("confesiones")
    .select("*", { count: "exact", head: true })
    .eq("estado", "aprobada");

  const { count: confRechazadas } = await supabase
    .from("confesiones")
    .select("*", { count: "exact", head: true })
    .eq("estado", "rechazada");

  const { count: contPendientes } = await supabase
    .from("contactos")
    .select("*", { count: "exact", head: true })
    .eq("estado", "pendiente");

  const { count: contAprobadas } = await supabase
    .from("contactos")
    .select("*", { count: "exact", head: true })
    .eq("estado", "aprobada");

  const { count: contRechazadas } = await supabase
    .from("contactos")
    .select("*", { count: "exact", head: true })
    .eq("estado", "rechazada");

  const { count: totalUsuarios } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

      const { count: reportesPendientes } = await supabase
    .from("reportes")
    .select("*", { count: "exact", head: true })
    .eq("revisado", false);

  const totalPendientes = (confPendientes ?? 0) + (contPendientes ?? 0) + (reportesPendientes ?? 0);

    const stats = [
    {
      label: "Pendientes totales",
      valor: totalPendientes,
      emoji: "⏳",
      color: "text-neon",
      bg: "bg-neon/10",
      href: "/admin/pendientes",
      destacado: totalPendientes > 0,
    },
    {
      label: "Reportes pendientes",
      valor: reportesPendientes ?? 0,
      emoji: "🚨",
      color: "text-error",
      bg: "bg-error/10",
      href: "/admin/reportes",
      destacado: (reportesPendientes ?? 0) > 0,
    },
    {
      label: "Confesiones aprobadas",
      valor: confAprobadas ?? 0,
      emoji: "📝",
      color: "text-marca",
      bg: "bg-marca/10",
      href: "/admin/confesiones",
    },
    {
      label: "Contactos aprobados",
      valor: contAprobadas ?? 0,
      emoji: "💘",
      color: "text-rosa",
      bg: "bg-rosa/10",
      href: "/admin/contactos",
    },
    {
      label: "Usuarios totales",
      valor: totalUsuarios ?? 0,
      emoji: "👥",
      color: "text-exito",
      bg: "bg-exito/10",
      href: "/admin/usuarios",
    },
  ];

  return (
    <div className="space-y-8">

      <div>
        <h2 className="text-3xl font-bold text-texto">
          Bienvenido, jefe 👋
        </h2>
        <p className="text-sm text-texto-suave mt-1">
          Aquí revisas y apruebas todo el contenido
        </p>
      </div>

      {/* Alerta pendientes */}
      {totalPendientes > 0 && (
        <Link
          href="/admin/pendientes"
          className="block p-4 rounded-2xl bg-gradient-to-r from-neon/20 to-marca/20 border border-neon/40 hover:border-neon transition group"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-pulse">🔔</span>
            <div className="flex-1">
              <p className="font-bold text-texto">
                Tienes {totalPendientes} publicacion{totalPendientes !== 1 ? "es" : ""} pendiente{totalPendientes !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-texto-suave mt-0.5">
                Clic para revisarlas ahora
              </p>
            </div>
            <span className="text-neon group-hover:translate-x-1 transition-transform">
              →
            </span>
          </div>
        </Link>
      )}

      {/* Grid de stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={`
              block p-5 rounded-2xl bg-fondo-card border border-borde
              hover:border-marca/50 hover:bg-fondo-card-hover transition-all hover:-translate-y-0.5
              ${s.destacado ? "ring-1 ring-neon/40" : ""}
            `}
          >
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center text-xl mb-3`}>
              {s.emoji}
            </div>
            <p className={`text-3xl font-black ${s.color}`}>
              {s.valor}
            </p>
            <p className="text-xs text-texto-suave mt-1">
              {s.label}
            </p>
          </Link>
        ))}
      </div>

      {/* Desglose por tipo */}
      <div className="grid gap-4 md:grid-cols-2">

        {/* Confesiones */}
        <div className="bg-fondo-card border border-borde rounded-2xl p-6">
          <h3 className="text-lg font-bold text-texto mb-4 flex items-center gap-2">
            <span>📝</span> Confesiones
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-texto-suave">⏳ Pendientes</span>
              <span className="font-bold text-neon">{confPendientes ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-texto-suave">✅ Aprobadas</span>
              <span className="font-bold text-exito">{confAprobadas ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-texto-suave">❌ Rechazadas</span>
              <span className="font-bold text-error">{confRechazadas ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Contactos */}
        <div className="bg-fondo-card border border-borde rounded-2xl p-6">
          <h3 className="text-lg font-bold text-texto mb-4 flex items-center gap-2">
            <span>💘</span> Contactos
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-texto-suave">⏳ Pendientes</span>
              <span className="font-bold text-neon">{contPendientes ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-texto-suave">✅ Aprobados</span>
              <span className="font-bold text-exito">{contAprobadas ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-texto-suave">❌ Rechazados</span>
              <span className="font-bold text-error">{contRechazadas ?? 0}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}