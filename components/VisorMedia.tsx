"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Mensaje = {
  id: string;
  media_url: string | null;
  media_tipo: string | null;
  emisor_id: string;
  receptor_id: string;
  efimero: boolean;
  visto: boolean;
};

export default function VisorMedia({
  mensaje,
  yoId,
  onCerrar,
  onVerCompletado,
}: {
  mensaje: Mensaje;
  yoId: string;
  onCerrar: () => void;
  onVerCompletado: () => void;
}) {
  const supabase = createClient();
  const [segundos, setSegundos] = useState(mensaje.efimero ? 5 : 999);

  const esMio = mensaje.emisor_id === yoId;
  const esEfimero = mensaje.efimero;
  const soyReceptor = mensaje.receptor_id === yoId;

  // 🔥 Solo los efímeros que YO recibo desaparecen
  const debeDesaparecer = esEfimero && soyReceptor;

  // Bloquear clic derecho
  useEffect(() => {
    const bloquear = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", bloquear);
    return () => document.removeEventListener("contextmenu", bloquear);
  }, []);

  // Bloquear teclas de captura
  useEffect(() => {
    const bloquear = (e: KeyboardEvent) => {
      if (
        e.key === "PrintScreen" ||
        (e.ctrlKey &&
          (e.key === "p" || e.key === "s" || e.key === "P" || e.key === "S"))
      ) {
        e.preventDefault();
        alert("🚫 Las capturas no están permitidas");
      }
    };
    document.addEventListener("keydown", bloquear);
    return () => document.removeEventListener("keydown", bloquear);
  }, []);

  // Cuenta regresiva (solo si debe desaparecer)
  useEffect(() => {
    if (!debeDesaparecer) return;

    const intervalo = setInterval(() => {
      setSegundos((s) => {
        if (s <= 1) {
          clearInterval(intervalo);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [debeDesaparecer]);

  const marcarVistoYBorrar = async () => {
    // 1. Marcar como visto
    await supabase
      .from("mensajes")
      .update({ visto: true })
      .eq("id", mensaje.id);

    // 2. Borrar SOLO si es efímero y soy receptor
    if (debeDesaparecer) {
      await supabase.from("mensajes").delete().eq("id", mensaje.id);
    }

    onVerCompletado();
  };

  // Cuando llega a 0, marcar visto y borrar
  useEffect(() => {
    if (segundos === 0 && debeDesaparecer && !mensaje.visto) {
      marcarVistoYBorrar();
    }
  }, [segundos]);

  const cerrarManual = async () => {
    // Si debe desaparecer y no está visto → marcar y borrar
    if (debeDesaparecer && !mensaje.visto) {
      await marcarVistoYBorrar();
    } else {
      // Si es permanente o ya visto → solo cerrar
      onCerrar();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Barra superior */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between text-white z-10">
        <div className="flex items-center gap-3 flex-wrap">
          {debeDesaparecer && (
            <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/40 px-3 py-1.5 rounded-full text-red-400 text-sm font-bold">
              🔥 {segundos}s
            </div>
          )}

          {esEfimero && esMio && (
            <div className="bg-white/10 backdrop-blur px-3 py-1.5 rounded-full text-xs">
              🔥 Tu contenido efímero
            </div>
          )}

          {esEfimero && soyReceptor && (
            <div className="bg-white/10 backdrop-blur px-3 py-1.5 rounded-full text-xs">
              📸 Se verá solo esta vez
            </div>
          )}

          {!esEfimero && (
            <div className="bg-white/10 backdrop-blur px-3 py-1.5 rounded-full text-xs">
              📎 Contenido permanente
            </div>
          )}
        </div>

        <button
          onClick={cerrarManual}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl transition"
        >
          ✕
        </button>
      </div>

      {/* Barra de progreso (solo si debe desaparecer) */}
      {debeDesaparecer && (
        <div className="absolute top-16 left-4 right-4 h-1 bg-white/20 rounded-full overflow-hidden z-10">
          <div
            className="h-full bg-gradient-to-r from-marca to-rosa transition-all duration-1000"
            style={{ width: `${(segundos / 5) * 100}%` }}
          />
        </div>
      )}

      {/* Contenido */}
      <div
        className="relative max-w-full max-h-full select-none"
        style={{ userSelect: "none", WebkitUserSelect: "none" }}
      >
        {mensaje.media_tipo === "video" ? (
          <video
            src={mensaje.media_url!}
            className="max-w-full max-h-[85vh] object-contain rounded-2xl"
            autoPlay
            loop
            playsInline
            onContextMenu={(e) => e.preventDefault()}
            controls={false}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mensaje.media_url!}
            alt="Media"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl"
            onContextMenu={(e) => e.preventDefault()}
            draggable={false}
          />
        )}

        {/* Marca de agua (solo efímeros del receptor) */}
        {debeDesaparecer && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-white/10 text-6xl font-black rotate-[-30deg] select-none">
              CHISMÓLOGO
            </span>
          </div>
        )}
      </div>

      {/* Avisos inferiores */}
      {debeDesaparecer && (
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-white/60 text-xs">
            🚫 No se permite tomar capturas · Se eliminará al cerrar
          </p>
        </div>
      )}

      {!esEfimero && (
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-white/60 text-xs">
            📎 Este contenido se mantendrá en el chat
          </p>
        </div>
      )}

      {esEfimero && esMio && (
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-white/60 text-xs">
            🔥 El receptor solo lo verá una vez
          </p>
        </div>
      )}
    </div>
  );
}