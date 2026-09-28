"use client";

import { useState } from "react";

const MOTIVOS = [
  { valor: "spam", label: "Spam o publicidad", emoji: "🚫" },
  { valor: "ofensivo", label: "Contenido ofensivo", emoji: "😠" },
  { valor: "sexual", label: "Contenido sexual", emoji: "🔞" },
  { valor: "datos", label: "Datos personales de terceros", emoji: "🔒" },
  { valor: "violencia", label: "Violencia o amenazas", emoji: "⚠️" },
  { valor: "normas", label: "No cumple las normas", emoji: "📋" },
  { valor: "otro", label: "Otro", emoji: "❓" },
];

export default function ModalRechazar({
  tipo,
  onCancelar,
  onConfirmar,
}: {
  tipo: "confesion" | "contacto";
  onCancelar: () => void;
  onConfirmar: (motivo: string, detalle: string) => Promise<void>;
}) {
  const [motivoSeleccionado, setMotivoSeleccionado] = useState<string>("");
  const [detalle, setDetalle] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleConfirmar = async () => {
    if (!motivoSeleccionado) {
      alert("Debes seleccionar un motivo");
      return;
    }

    setCargando(true);
    await onConfirmar(motivoSeleccionado, detalle);
    setCargando(false);
  };

  const motivoActual = MOTIVOS.find((m) => m.valor === motivoSeleccionado);

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !cargando) onCancelar();
      }}
    >
      <div className="bg-fondo-card border border-borde rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 bg-fondo-card border-b border-borde p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-error/20 flex items-center justify-center text-xl">
              ❌
            </div>
            <div>
              <h2 className="text-lg font-bold text-texto">
                Rechazar {tipo === "confesion" ? "confesión" : "anuncio"}
              </h2>
              <p className="text-xs text-texto-suave">
                El autor recibirá una notificación con el motivo
              </p>
            </div>
          </div>

          <button
            onClick={onCancelar}
            disabled={cargando}
            className="w-8 h-8 rounded-lg hover:bg-fondo-card-hover flex items-center justify-center text-texto-suave hover:text-texto transition disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 space-y-5">

          {/* Motivos */}
          <div>
            <label className="block text-sm font-medium text-texto mb-3">
              Motivo del rechazo <span className="text-error">*</span>
            </label>

            <div className="space-y-2">
              {MOTIVOS.map((m) => (
                <button
                  key={m.valor}
                  type="button"
                  onClick={() => setMotivoSeleccionado(m.valor)}
                  disabled={cargando}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition text-left
                    ${
                      motivoSeleccionado === m.valor
                        ? "bg-error/10 border-error/50 text-error"
                        : "bg-fondo border-borde text-texto-suave hover:border-error/30 hover:text-texto"
                    }
                    disabled:opacity-50
                  `}
                >
                  <span className="text-xl">{m.emoji}</span>
                  <span className="flex-1 font-medium text-sm">{m.label}</span>
                  {motivoSeleccionado === m.valor && (
                    <span className="text-error">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Detalle */}
          <div>
            <label className="block text-sm font-medium text-texto mb-2">
              Detalle adicional{" "}
              <span className="text-texto-suave text-xs">(opcional)</span>
            </label>
            <textarea
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
              disabled={cargando}
              maxLength={300}
              rows={3}
              placeholder="Explica al autor por qué se rechazó (opcional)..."
              className="w-full px-4 py-3 rounded-xl bg-fondo border border-borde text-texto placeholder-texto-suave/50 focus:border-error focus:outline-none focus:ring-2 focus:ring-error/20 transition resize-none"
            />
            <p className="text-xs text-texto-suave mt-1 text-right">
              {detalle.length}/300
            </p>
          </div>

          {/* Preview del mensaje */}
          {motivoSeleccionado && (
            <div className="bg-error/5 border border-error/20 rounded-xl p-4">
              <p className="text-xs text-texto-suave mb-2">
                El autor recibirá esto:
              </p>
              <div className="text-sm text-texto space-y-1">
                <p className="font-semibold">
                  ❌ Tu {tipo === "confesion" ? "confesión" : "anuncio"} fue rechazada
                </p>
                <p className="text-texto-suave">
                  Motivo: {motivoActual?.label}
                </p>
                {detalle && (
                  <p className="text-texto-suave">
                    {detalle}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-fondo-card border-t border-borde p-5 flex gap-3">
          <button
            onClick={onCancelar}
            disabled={cargando}
            className="flex-1 py-3 rounded-xl border border-borde text-texto-suave hover:text-texto hover:border-texto-suave/30 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={!motivoSeleccionado || cargando}
            className="flex-1 py-3 rounded-xl bg-error hover:bg-error/80 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {cargando ? (
              <>⏳ Rechazando...</>
            ) : (
              <>❌ Confirmar rechazo</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}