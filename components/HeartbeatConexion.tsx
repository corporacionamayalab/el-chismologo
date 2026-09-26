"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function HeartbeatConexion() {
  const supabase = createClient();

  useEffect(() => {
    const actualizar = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("profiles")
          .update({ ultima_conexion: new Date().toISOString() })
          .eq("id", user.id);
      }
    };

    // Primera actualización
    actualizar();

    // Cada 60 segundos
    const intervalo = setInterval(actualizar, 60000);

    return () => clearInterval(intervalo);
  }, []);

  return null;
}