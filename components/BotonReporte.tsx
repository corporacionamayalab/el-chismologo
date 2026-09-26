"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function BotonReporte({
  reporteId,
  revisado,
}: {
  reporteId: string;
  revisado: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [cargando, setCargando] = useState(false);

  const toggleRevisado = async () => {
    setCargando(true);
    const { error } = await supabase
      .from("reportes")
      .update({ revisado: !revisado })
      .eq("id", reporteId);

    setCargando(false);

    if (error) {
      alert("Error: " + error.message);
      return;
    }

    router.refresh();
  };

  return (
    <button
      onClick={toggleRevisado}
      disabled={cargando}
      className={`
        text-xs px-3 py-2 rounded-lg border transition font-semibold ml-auto
        ${
          revisado
            ? "border-borde text-texto-suave hover:border-neon/30 hover:text-neon"
            : "border-exito/40 text-exito hover:bg-exito/10"
        }
        disabled:opacity-50
      `}
    >
      {cargando ? "..." : revisado ? "↩️ Marcar pendiente" : "✅ Marcar revisado"}
    </button>
  );
}