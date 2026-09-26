"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function BotonModerar({
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
  const [motivo, setMotivo] = useState("");

  const tabla = tipo === "confesion" ? "confesiones" : "contactos";

  const aprobar = async () => {
    setCargando(true);
    const { error } = await supabase
      .from(tabla)
      .update({ estado: "aprobada", motivo_rechazo: null })
      .eq("id", id);

    setCargando(false);

    if (error) {
      alert("Error: " + error.message);
      return;
    }

    router.refresh();
  };

  const rechazar = async () => {
    if (motivo.trim().length < 3) {
      alert("Escribe un motivo (mínimo 3 caracteres)");
      return;
    }

    setCargando(true);
    const { error } = await supabase
      .from(tabla)
      .update({ estado: "rechazada", motivo_rechazo: motivo.trim() })
      .eq("id", id);

    setCargando(false);

    if (error) {
      alert("Error: " + error.message);
      return;
    }

    router.refresh();
  };

  if (mostrarRechazo) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-texto-suave">
          Motivo del rechazo (el autor lo verá):
        </p>
        <input
          type="text"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Ej: Contiene lenguaje ofensivo"
          className="w-full px-4 py-2 rounded-lg bg-fondo border border-borde text-texto text-sm focus:border-error focus:outline-none"
        />
        <div className="flex gap-2">
          <button
            onClick={rechazar}
            disabled={cargando}
            className="px-4 py-2 rounded-lg bg-error hover:bg-error/80 text-white text-sm font-semibold transition disabled:opacity-50"
          >
            {cargando ? "..." : "Confirmar rechazo"}
          </button>
          <button
            onClick={() => {
              setMostrarRechazo(false);
              setMotivo("");
            }}
            className="px-4 py-2 rounded-lg border border-borde text-texto-suave hover:text-texto text-sm transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={aprobar}
        disabled={cargando}
        className="px-5 py-2.5 rounded-lg bg-exito hover:bg-exito/80 text-white text-sm font-semibold transition disabled:opacity-50 flex items-center gap-2"
      >
        ✅ {cargando ? "..." : "Aprobar"}
      </button>
      <button
        onClick={() => setMostrarRechazo(true)}
        disabled={cargando}
        className="px-5 py-2.5 rounded-lg border border-error/50 text-error hover:bg-error/10 text-sm font-semibold transition disabled:opacity-50 flex items-center gap-2"
      >
        ❌ Rechazar
      </button>
    </div>
  );
}