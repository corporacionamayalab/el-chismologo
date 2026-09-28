"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

type Notificacion = {
  id: string;
  tipo: string;
  titulo: string;
  contenido: string | null;
  url: string | null;
  leida: boolean;
  creado_en: string;
};

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

export default function CampanitaNotificaciones() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(true);

  const ref = useRef<HTMLDivElement>(null);

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickFuera = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  // Cargar usuario + notificaciones
  useEffect(() => {
    const cargar = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user ?? null);

      if (user) {
        const { data } = await supabase
          .from("notificaciones")
          .select("*")
          .eq("user_id", user.id)
          .order("creado_en", { ascending: false })
          .limit(30);

        setNotificaciones((data ?? []) as Notificacion[]);
      }

      setCargando(false);
    };

    cargar();

    // Suscripción a nuevas notificaciones en tiempo real
    const canal = supabase
      .channel("notificaciones-live")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notificaciones",
        },
        (payload) => {
          const nueva = payload.new as Notificacion;
          setNotificaciones((prev) => [nueva, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  const marcarTodasLeidas = async () => {
    if (!user) return;

    await supabase
      .from("notificaciones")
      .update({ leida: true })
      .eq("user_id", user.id)
      .eq("leida", false);

    setNotificaciones((prev) =>
      prev.map((n) => ({ ...n, leida: true }))
    );
  };

  const handleClickNotif = async (n: Notificacion) => {
    if (!n.leida) {
      await supabase
        .from("notificaciones")
        .update({ leida: true })
        .eq("id", n.id);

      setNotificaciones((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, leida: true } : x))
      );
    }

    setAbierto(false);

    if (n.url) {
      router.push(n.url);
    }
  };

  const formatearHora = (fecha: string) => {
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

  // No mostrar si no está logueado o está cargando
  if (cargando || !user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setAbierto(!abierto)}
        className="relative w-10 h-10 rounded-xl flex items-center justify-center hover:bg-fondo-card transition border border-transparent hover:border-borde"
        aria-label="Notificaciones"
      >
        <span className="text-xl">🔔</span>

        {noLeidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-marca to-rosa text-white text-[10px] font-bold flex items-center justify-center border-2 border-fondo">
            {noLeidas > 9 ? "9+" : noLeidas}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {abierto && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-fondo-card border border-borde rounded-2xl shadow-2xl shadow-marca/20 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-borde">
            <h3 className="text-sm font-bold text-texto">
              Notificaciones
              {noLeidas > 0 && (
                <span className="ml-2 text-xs text-rosa">
                  ({noLeidas} nuevas)
                </span>
              )}
            </h3>

            {noLeidas > 0 && (
              <button
                onClick={marcarTodasLeidas}
                className="text-xs text-marca hover:text-rosa transition"
              >
                Marcar leídas
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="max-h-96 overflow-y-auto">
            {notificaciones.length === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="text-4xl mb-2">🔕</div>
                <p className="text-xs text-texto-suave">
                  No tienes notificaciones
                </p>
              </div>
            ) : (
              notificaciones.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClickNotif(n)}
                  className={`
                    w-full text-left px-4 py-3 flex gap-3 items-start
                    hover:bg-fondo-card-hover transition border-b border-borde last:border-0
                    ${!n.leida ? "bg-marca/5" : ""}
                  `}
                >
                  <span className="text-xl flex-shrink-0 mt-0.5">
                    {EMOJIS[n.tipo] ?? "🔔"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`
                        text-sm truncate
                        ${!n.leida ? "font-semibold text-texto" : "text-texto-suave"}
                      `}
                    >
                      {n.titulo}
                    </p>
                    {n.contenido && (
                      <p className="text-xs text-texto-suave mt-0.5 line-clamp-2">
                        {n.contenido}
                      </p>
                    )}
                    <p className="text-[10px] text-texto-suave mt-1">
                      {formatearHora(n.creado_en)}
                    </p>
                  </div>
                  {!n.leida && (
                    <span className="w-2 h-2 rounded-full bg-marca flex-shrink-0 mt-1.5" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notificaciones.length > 0 && (
            <div className="p-2 border-t border-borde">
              <Link
                href="/notificaciones"
                onClick={() => setAbierto(false)}
                className="block w-full text-center py-2 rounded-lg text-xs text-marca hover:bg-marca/10 transition"
              >
                Ver todas
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}