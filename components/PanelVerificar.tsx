"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PanelVerificar({
  verificacionId,
  userId,
  nombreCompleto,
}: {
  verificacionId: string;
  userId: string;
  nombreCompleto: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mostrarRechazo, setMostrarRechazo] = useState(false);
  const [motivo, setMotivo] = useState("");

  const aprobar = async () => {
    setCargando(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("No autenticado");
      setCargando(false);
      return;
    }

    // 1. Actualizar verificación
    const { error: errVerif } = await supabase
      .from("verificaciones")
      .update({
        estado: "aprobado",
        revisado_en: new Date().toISOString(),
        revisado_por: user.id,
        motivo_rechazo: null,
      })
      .eq("id", verificacionId);

    if (errVerif) {
      setError(errVerif.message);
      setCargando(false);
      return;
    }

    // 2. Actualizar perfil
    const { error: errPerfil } = await supabase
      .from("profiles")
      .update({
        verificado: true,
        estado_verificacion: "aprobado",
        motivo_rechazo_verificacion: null,
        verificado_en: new Date().toISOString(),
        verificado_por: user.id,
      })
      .eq("id", userId);

    setCargando(false);

    if (errPerfil) {
      setError(errPerfil.message);
      return;
    }

    router.refresh();
  };

  const rechazar = async () => {
    if (motivo.trim().length < 5) {
      setError("El motivo debe tener al menos 5 caracteres");
      return;
    }

    setCargando(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("No autenticado");
      setCargando(false);
      return;
    }

    // 1. Actualizar verificación
    const { error: errVerif } = await supabase
      .from("verificaciones")
      .update({
        estado: "rechazado",
        revisado_en: new Date().toISOString(),
        revisado_por: user.id,
        motivo_rechazo: motivo.trim(),
      })
      .eq("id", verificacionId);

    if (errVerif) {
      setError(errVerif.message);
      setCargando(false);
      return;
    }

    // 2. Actualizar perfil
    const { error: errPerfil } = await supabase
      .from("profiles")
      .update({
        verificado: false,
        estado_verificacion: "rechazado",
        motivo_rechazo_verificacion: motivo.trim(),
      })
      .eq("id", userId);

    setCargando(false);

    if (errPerfil) {
      setError(errPerfil.message);
      return;
    }

    setMostrarRechazo(false);
    router.refresh();
  };

  return (
    <>
      <div className="bg-fondo-card border border-borde rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-texto flex items-center gap-2">
          ⚖️ Decisión
        </h3>

        <p className="text-sm text-texto-suave">
          Revisa la selfie, las fotos y los datos. Verifica que:
        </p>

        <ul className="text-sm text-texto-suave space-y-1.5 list-disc pl-5">
          <li>La selfie es una persona real (no un dibujo o foto de foto)</li>
          <li>El rostro es visible y claro</li>
          <li>Las fotos de perfil coinciden con la persona</li>
          <li>El nombre parece real</li>
          <li>Es mayor de 18 años</li>
        </ul>

        {error && (
          <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={aprobar}
            disabled={cargando}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-exito to-exito/80 text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {cargando ? "..." : "✅ Aprobar verificación"}
          </button>

          <button
            onClick={() => setMostrarRechazo(true)}
            disabled={cargando}
            className="flex-1 py-3 rounded-xl border-2 border-error/40 text-error hover:bg-error/10 font-semibold transition disabled:opacity-50"
          >
            ❌ Rechazar
          </button>
        </div>
      </div>

      {/* Modal rechazar */}
      {mostrarRechazo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-fondo-card border border-borde rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-texto flex items-center gap-2">
              ❌ Rechazar verificación
            </h3>

            <p className="text-sm text-texto-suave">
              Vas a rechazar la verificación de{" "}
              <strong className="text-texto">{nombreCompleto}</strong>. Explica
              el motivo para que pueda corregirlo.
            </p>

            <div>
              <label className="block text-sm font-medium text-texto-suave mb-1.5">
                Motivo del rechazo
              </label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Ej: La selfie no es clara, sube una foto de tu rostro bien iluminado"
                className="w-full px-4 py-3 rounded-xl bg-fondo border border-borde text-texto placeholder-texto-suave/50 focus:border-marca focus:outline-none focus:ring-2 focus:ring-marca/20 transition resize-none"
              />
              <p className="text-xs text-texto-suave mt-1 text-right">
                {motivo.length}/500
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={rechazar}
                disabled={cargando || motivo.trim().length < 5}
                className="flex-1 py-3 rounded-xl bg-error hover:bg-error/80 text-white font-semibold transition disabled:opacity-50"
              >
                {cargando ? "..." : "Confirmar rechazo"}
              </button>
              <button
                onClick={() => {
                  setMostrarRechazo(false);
                  setError(null);
                }}
                disabled={cargando}
                className="px-4 py-3 rounded-xl border border-borde text-texto-suave hover:text-texto transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}