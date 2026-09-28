"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function HeartbeatConexion() {
  const supabase = createClient();

  useEffect(() => {
    let intervalo: NodeJS.Timeout;

    const actualizar = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // 1. Verificar si existe el perfil
      const { data: perfil } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      // 2. Si NO existe, crearlo automáticamente
      if (!perfil) {
        const usernameBase = user.email?.split("@")[0] ?? "user";
        const usernameLimpio = usernameBase.replace(/[^a-zA-Z0-9_]/g, "_");

        await supabase.from("profiles").insert({
          id: user.id,
          username: usernameLimpio + "_" + Math.floor(Math.random() * 999),
        });
      }

      // 3. Actualizar última conexión
      await supabase
        .from("profiles")
        .update({ ultima_conexion: new Date().toISOString() })
        .eq("id", user.id);
    };

    actualizar();
    // eslint-disable-next-line prefer-const
    intervalo = setInterval(actualizar, 60000);

    return () => clearInterval(intervalo);
  }, []);

  return null;
}