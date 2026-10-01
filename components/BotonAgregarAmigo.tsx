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

    // 🔍 Comprobar si YA existe una amistad entre ambos
    const { data: existente } = await supabase
      .from("amistades")
      .select("id, estado, solicitante_id")
      .or(
        `and(solicitante_id.eq.${user.id},receptor_id.eq.${usuarioId}),and(solicitante_id.eq.${usuarioId},receptor_id.eq.${user.id})`
      )
      .maybeSingle();

    if (existente) {
      // Si ya existe y está pendiente:
      if (existente.estado === "pendiente") {
        // Si YO fui el solicitante → ya envié, mostrar "enviada"
        if (existente.solicitante_id === user.id) {
          setEstado("enviada");
          return;
        }
        // Si la OTRA persona me envió solicitud → aceptarla automáticamente
        const { error } = await supabase
          .from("amistades")
          .update({ estado: "aceptada" })
          .eq("id", existente.id);

        if (error) {
          alert("Error: " + error.message);
          setEstado("idle");
          return;
        }
        setEstado("enviada");
        router.refresh();
        return;
      }
      // Si ya está aceptada → no hacer nada
      setEstado("enviada");
      return;
    }

    // ✅ No existe → crear la solicitud
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
      <div className="mt-3 w-full text-center text-xs font-semibold py-2 rounded-xl bg-marca/10 border border-marca/30 text-marca">
        ⏳ Enviada
      </div>
    );
  }

  return (
    <button
      onClick={enviar}
      disabled={estado === "enviando"}
      className="mt-3 w-full text-center text-xs font-semibold py-2 rounded-xl bg-gradient-to-r from-marca to-rosa text-white hover:opacity-90 transition disabled:opacity-50"
    >
      {estado === "enviando" ? "..." : "+ Agregar"}
    </button>
  );
}