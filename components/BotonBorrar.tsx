"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function BotonBorrar({
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

  const [confirmando, setConfirmando] = useState(false);
  const [cargando, setCargando] = useState(false);

  const tabla = tipo === "confesion" ? "confesiones" : "contactos";

  const borrar = async () => {
    setCargando(true);
    const { error } = await supabase.from(tabla).delete().eq("id", id);
    setCargando(false);

    if (error) {
      alert("Error: " + error.message);
      return;
    }

    setConfirmando(false);
    router.refresh();
  };

  if (confirmando) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <button
          onClick={borrar}
          disabled={cargando}
          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-error text-white hover:bg-error/80 transition disabled:opacity-50"
        >
          {cargando ? "..." : "Sí, borrar"}
        </button>
        <button
          onClick={() => setConfirmando(false)}
          className="text-xs text-texto-suave hover:text-texto transition"
        >
          Cancelar
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirmando(true)}
      title={`Borrar "${titulo}"`}
      className="text-xs text-texto-suave hover:text-error transition"
    >
      🗑️ Borrar
    </button>
  );
}