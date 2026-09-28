"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ModalRechazar from "./ModalRechazar";

export default function PanelModerar({
  tipo,
  id,
  titulo,
}: {
  tipo: "confesion" | "contacto";
  id: string;
  titulo: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [cargando, setCargando] = useState(false);
  const [mostrarRechazo, setMostrarRechazo] = useState(false);

  const tabla = tipo === "confesion" ? "confesiones" : "contactos";

  // ✅ Aprobar
  const aprobar = async () => {
    if (!confirm(`¿Aprobar "${titulo}"?`)) return;

    setCargando(true);
    const { error } = await supabase
      .from(tabla)
      .update({
        estado: "aprobada",
        motivo_rechazo: null,
        detalle_rechazo: null,
      })
      .eq("id", id);

    setCargando(false);

    if (error) {
      alert("Error: " + error.message);
      return;
    }

    router.refresh();
  };

  // ❌ Rechazar
  const rechazar = async (motivo: string, detalle: string) => {
    const { error } = await supabase
      .from(tabla)
      .update({
        estado: "rechazada",
        motivo_rechazo: motivo,
        detalle_rechazo: detalle || null,
      })
      .eq("id", id);

    if (error) {
      alert("Error: " + error.message);
      return;
    }

    setMostrarRechazo(false);
    router.refresh();
  };

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {/* ✅ Aprobar */}
        <button
          onClick={aprobar}
          disabled={cargando}
          className="flex-1 min-w-[140px] py-3 rounded-xl bg-gradient-to-r from-exito to-exito/80 hover:opacity-90 text-white font-semibold transition-all hover:scale-[1.02] shadow-lg shadow-exito/20 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {cargando ? (
            <>⏳ Procesando...</>
          ) : (
            <>✅ Aprobar</>
          )}
        </button>

        {/* ❌ Rechazar */}
        <button
          onClick={() => setMostrarRechazo(true)}
          disabled={cargando}
          className="flex-1 min-w-[140px] py-3 rounded-xl border-2 border-error/40 text-error hover:bg-error/10 font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          ❌ Rechazar
        </button>
      </div>

      {/* Modal */}
      {mostrarRechazo && (
        <ModalRechazar
          tipo={tipo}
          onCancelar={() => setMostrarRechazo(false)}
          onConfirmar={rechazar}
        />
      )}
    </>
  );
}