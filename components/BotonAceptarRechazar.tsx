"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function BotonAceptarRechazar({
  amistadId,
}: {
  amistadId: string;
  usuarioId?: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [cargando, setCargando] = useState<"aceptar" | "rechazar" | null>(null);

  const aceptar = async () => {
    setCargando("aceptar");
    await supabase
      .from("amistades")
      .update({ estado: "aceptada" })
      .eq("id", amistadId);
    setCargando(null);
    router.refresh();
  };

  const rechazar = async () => {
    setCargando("rechazar");
    await supabase
      .from("amistades")
      .update({ estado: "rechazada" })
      .eq("id", amistadId);
    setCargando(null);
    router.refresh();
  };

  return (
    <div className="flex gap-2 flex-shrink-0">
      <button
        onClick={aceptar}
        disabled={cargando !== null}
        className="px-3 py-1.5 rounded-lg bg-exito hover:bg-exito/80 text-white text-xs font-semibold transition disabled:opacity-50"
      >
        {cargando === "aceptar" ? "..." : "✅ Aceptar"}
      </button>
      <button
        onClick={rechazar}
        disabled={cargando !== null}
        className="px-3 py-1.5 rounded-lg border border-error/40 text-error hover:bg-error/10 text-xs font-semibold transition disabled:opacity-50"
      >
        {cargando === "rechazar" ? "..." : "❌"}
      </button>
    </div>
  );
}