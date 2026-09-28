"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function BotonAgregarAmigo({ usuarioId }: { usuarioId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [estado, setEstado] = useState<"idle" | "enviando" | "enviada">("idle");

  const enviar = async () => {
    setEstado("enviando");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("amistades").insert({
      solicitante_id: user.id,
      receptor_id: usuarioId,
    });

    if (error) {
      alert("Error: " + error.message);
      setEstado("idle");
      return;
    }

    setEstado("enviada");
    router.refresh();
  };

  if (estado === "enviada") {
    return (
      <div className="mt-3 w-full text-center text-xs font-semibold py-2 rounded-xl bg-neon/10 border border-neon/30 text-neon">
        ⏳ Enviada
      </div>
    );
  }

  return (
    <button
      onClick={enviar}
      disabled={estado === "enviando"}
      className="mt-3 w-full text-center text-xs font-semibold py-2 rounded-xl bg-gradient-to-r from-neon to-marca text-fondo hover:opacity-90 transition disabled:opacity-50"
    >
      {estado === "enviando" ? "..." : "+ Agregar"}
    </button>
  );
}