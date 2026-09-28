"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function BotonGestionUsuario({
  userId,
  username,
  bloqueado,
}: {
  userId: string;
  username: string;
  bloqueado: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);

  const bloquear = async () => {
    if (motivo.trim().length < 5) {
      alert("Escribe un motivo (mínimo 5 caracteres)");
      return;
    }

    setEnviando(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Actualizar perfil
    const { error } = await supabase
      .from("profiles")
      .update({
        bloqueado: true,
        motivo_bloqueo: motivo.trim(),
        bloqueado_en: new Date().toISOString(),
        bloqueado_por: user.id,
      })
      .eq("id", userId);

    if (error) {
      alert("Error: " + error.message);
      setEnviando(false);
      return;
    }

    // Notificación al usuario
    await supabase.from("notificaciones").insert({
      user_id: userId,
      tipo: "reporte",
      titulo: "🚫 Tu cuenta ha sido bloqueada",
      contenido: `Motivo: ${motivo.trim()}. Puedes enviar tu descargo desde el aviso en la web.`,
      url: "/descargo",
    });

    setEnviando(false);
    setModalAbierto(false);
    setMotivo("");
    router.refresh();
  };

  const desbloquear = async () => {
    if (!confirm(`¿Desbloquear a @${username}?`)) return;

    setEnviando(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        bloqueado: false,
        motivo_bloqueo: null,
        bloqueado_en: null,
        bloqueado_por: null,
      })
      .eq("id", userId);

    setEnviando(false);

    if (error) {
      alert("Error: " + error.message);
      return;
    }

    // Notificación
    await supabase.from("notificaciones").insert({
      user_id: userId,
      tipo: "solicitud_aceptada",
      titulo: "✅ Tu cuenta ha sido desbloqueada",
      contenido: "Ya puedes volver a publicar, comentar y chatear.",
      url: "/",
    });

    router.refresh();
  };

  if (bloqueado) {
    return (
      <button
        onClick={desbloquear}
        disabled={enviando}
        className="px-4 py-2 rounded-xl bg-exito hover:bg-exito/80 text-white text-sm font-semibold transition disabled:opacity-50"
      >
        {enviando ? "..." : "✅ Desbloquear"}
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setModalAbierto(true)}
        className="px-4 py-2 rounded-xl border border-error/40 text-error hover:bg-error/10 text-sm font-semibold transition"
      >
        🚫 Bloquear
      </button>

      {modalAbierto && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !enviando) setModalAbierto(false);
          }}
        >
          <div className="bg-fondo-card border border-borde rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-texto mb-2">
              🚫 Bloquear a @{username}
            </h3>
            <p className="text-xs text-texto-suave mb-4">
              El usuario podrá ver el contenido, pero no podrá publicar, comentar ni chatear.
              Recibirá una notificación con el motivo.
            </p>

            <label className="block text-sm font-medium text-texto-suave mb-2">
              Motivo del bloqueo
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              maxLength={300}
              rows={3}
              placeholder="Ex: Acoso a otros usuarios, spam reiterado..."
              className="w-full px-4 py-3 rounded-xl bg-fondo border border-borde text-texto placeholder-texto-suave/50 focus:border-error focus:outline-none transition resize-none mb-4"
            />
            <p className="text-xs text-texto-suave text-right mb-4">
              {motivo.length}/300
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setModalAbierto(false)}
                disabled={enviando}
                className="flex-1 py-2.5 rounded-xl border border-borde text-texto-suave hover:text-texto transition"
              >
                Cancelar
              </button>
              <button
                onClick={bloquear}
                disabled={motivo.trim().length < 5 || enviando}
                className="flex-1 py-2.5 rounded-xl bg-error hover:bg-error/80 text-white font-semibold transition disabled:opacity-50"
              >
                {enviando ? "..." : "Bloquear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}