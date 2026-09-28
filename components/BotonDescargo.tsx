"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function BotonDescargo({
  descargoId,
  userId,
  estado,
  respuestaActual,
  yaBloqueado,
}: {
  descargoId: string;
  userId: string;
  estado: string;
  respuestaActual: string | null;
  yaBloqueado: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [modalAbierto, setModalAbierto] = useState<"responder" | "resolver" | null>(null);
  const [respuesta, setRespuesta] = useState(respuestaActual ?? "");
  const [desbloquear, setDesbloquear] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Responder
  const responder = async () => {
    if (respuesta.trim().length < 5) {
      alert("Escribe una respuesta (mínimo 5 caracteres)");
      return;
    }

    setEnviando(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("descargos")
      .update({
        respuesta: respuesta.trim(),
        respondido_por: user.id,
        respondido_en: new Date().toISOString(),
        estado: "resuelto",
        leido: true,
      })
      .eq("id", descargoId);

    if (error) {
      alert("Error: " + error.message);
      setEnviando(false);
      return;
    }

    // Si desbloquear, hacerlo
    if (desbloquear) {
      await supabase
        .from("profiles")
        .update({
          bloqueado: false,
          motivo_bloqueo: null,
          bloqueado_en: null,
          bloqueado_por: null,
        })
        .eq("id", userId);
    }

    // Notificación al usuario
    await supabase.from("notificaciones").insert({
      user_id: userId,
      tipo: desbloquear ? "solicitud_aceptada" : "reporte",
      titulo: desbloquear
        ? "✅ Tu cuenta ha sido desbloqueada"
        : "💬 Respuesta a tu descargo",
      contenido: respuesta.trim(),
      url: desbloquear ? "/" : "/descargo",
    });

    setEnviando(false);
    setModalAbierto(null);
    router.refresh();
  };

  // Marcar como leído
  const marcarLeido = async () => {
    await supabase
      .from("descargos")
      .update({ leido: true, estado: "leido" })
      .eq("id", descargoId);
    router.refresh();
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 ml-auto">
        {estado === "pendiente" && (
          <button
            onClick={marcarLeido}
            className="text-xs px-3 py-2 rounded-lg bg-fondo border border-borde text-texto-suave hover:text-marca hover:border-marca/30 transition"
          >
            👁️ Marcar leído
          </button>
        )}

        <button
          onClick={() => {
            setModalAbierto("responder");
            setDesbloquear(!yaBloqueado);
          }}
          className="text-xs px-3 py-2 rounded-lg bg-gradient-to-r from-marca to-rosa text-white font-semibold hover:opacity-90 transition"
        >
          💬 Responder
        </button>
      </div>

      {modalAbierto === "responder" && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !enviando) setModalAbierto(null);
          }}
        >
          <div className="bg-fondo-card border border-borde rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">

            <h3 className="text-lg font-bold text-texto mb-4">
              💬 Responder descargo
            </h3>

            <label className="block text-sm font-medium text-texto-suave mb-2">
              Tu respuesta
            </label>
            <textarea
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              maxLength={500}
              rows={5}
              placeholder="Escribe una respuesta clara y respetuosa..."
              className="w-full px-4 py-3 rounded-xl bg-fondo border border-borde text-texto placeholder-texto-suave/50 focus:border-marca focus:outline-none transition resize-none mb-2"
            />
            <p className="text-xs text-texto-suave text-right mb-4">
              {respuesta.length}/500
            </p>

            {/* Opción desbloquear */}
            <label className="flex items-center gap-3 p-3 rounded-xl bg-fondo border border-borde cursor-pointer hover:border-exito/30 transition mb-4">
              <input
                type="checkbox"
                checked={desbloquear}
                onChange={(e) => setDesbloquear(e.target.checked)}
                className="w-5 h-5 rounded"
              />
              <div>
                <p className="text-sm font-semibold text-texto">
                  ✅ Desbloquear al usuario
                </p>
                <p className="text-xs text-texto-suave">
                  El usuario podrá volver a publicar y comentar
                </p>
              </div>
            </label>

            <div className="flex gap-2">
              <button
                onClick={() => setModalAbierto(null)}
                disabled={enviando}
                className="flex-1 py-3 rounded-xl border border-borde text-texto-suave hover:text-texto transition"
              >
                Cancelar
              </button>
              <button
                onClick={responder}
                disabled={respuesta.trim().length < 5 || enviando}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-marca to-rosa text-white font-semibold transition disabled:opacity-50"
              >
                {enviando ? "..." : "Enviar respuesta"}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}