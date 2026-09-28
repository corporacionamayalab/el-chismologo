"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ⚙️ CONFIGURACIÓN
// Cambia este valor por los minutos que quieras:
// 5 = 5 minutos
// 10 = 10 minutos
// 15 = 15 minutos
const TIMEOUT_MINUTOS = 20;

export default function SessionTimeout() {
  const router = useRouter();
  const supabase = createClient();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let activo = true;

    const cerrarSesion = async () => {
      if (!activo) return;

      await supabase.auth.signOut();
      router.push("/login?razon=inactividad");
      router.refresh();
    };

    const iniciarTimer = async () => {
      // Verificar que haya usuario logueado
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Limpiar timer anterior
      if (timerRef.current) clearTimeout(timerRef.current);

      // Programar cierre
      timerRef.current = setTimeout(
        cerrarSesion,
        TIMEOUT_MINUTOS * 60 * 1000
      );
    };

    // Iniciar al cargar
    iniciarTimer();

    // Eventos que reinician el timer
    const eventos = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    eventos.forEach((e) => {
      window.addEventListener(e, iniciarTimer, { passive: true });
    });

    // Limpiar al desmontar
    return () => {
      activo = false;
      eventos.forEach((e) => {
        window.removeEventListener(e, iniciarTimer);
      });
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [router, supabase]);

  return null;
}