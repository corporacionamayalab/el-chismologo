"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function ReaccionesContacto({
  contactoId,
}: {
  contactoId: string;
}) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [reacciones, setReacciones] = useState<
    { id: string; user_id: string }[]
  >([]);
  const [cargando, setCargando] = useState(false);

  // ========================================
  // 1. CARGAR SESIÓN CON SUSCRIPCIÓN
  // ========================================
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // ========================================
  // 2. CARGAR REACCIONES + TIEMPO REAL
  // ========================================
  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase
        .from("reacciones_contactos")
        .select("id, user_id")
        .eq("contacto_id", contactoId);

      setReacciones(data ?? []);
    };

    cargar();

    const canal = supabase
      .channel(`reacciones-contacto-${contactoId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reacciones_contactos",
          filter: `contacto_id=eq.${contactoId}`,
        },
        async () => {
          const { data } = await supabase
            .from("reacciones_contactos")
            .select("id, user_id")
            .eq("contacto_id", contactoId);
          setReacciones(data ?? []);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [contactoId, supabase]);

  const yoReaccione = user
    ? reacciones.some((r) => r.user_id === user.id)
    : false;

  const toggle = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    setCargando(true);

    if (yoReaccione) {
      await supabase
        .from("reacciones_contactos")
        .delete()
        .eq("contacto_id", contactoId)
        .eq("user_id", user.id);

      setReacciones((prev) => prev.filter((r) => r.user_id !== user.id));
    } else {
      const { data } = await supabase
        .from("reacciones_contactos")
        .insert({ contacto_id: contactoId, user_id: user.id })
        .select()
        .single();

      if (data) {
        setReacciones((prev) => [...prev, data]);
      }
    }

    setCargando(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={cargando}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all
        ${
          yoReaccione
            ? "bg-rosa/20 border border-rosa/40 text-rosa"
            : "bg-fondo border border-borde text-texto-suave hover:border-rosa/40 hover:text-rosa"
        }
        disabled:opacity-50
      `}
    >
      <span className={`text-lg transition-transform ${yoReaccione ? "scale-110" : ""}`}>
        {yoReaccione ? "❤️" : "🤍"}
      </span>
      <span className="text-sm font-semibold">
        {reacciones.length} {reacciones.length === 1 ? "reacción" : "reacciones"}
      </span>
    </button>
  );
}