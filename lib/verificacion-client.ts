"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * Cliente: verifica si el usuario actual puede interactuar
 */
export async function puedeInteractuarCliente(): Promise<{
  puede: boolean;
  verificado: boolean;
  exento: boolean;
}> {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return { puede: false, verificado: false, exento: false };
  }

  const { data: perfil } = await supabase
    .from("profiles")
    .select("verificado, exento_verificacion")
    .eq("id", session.user.id)
    .single();

  return {
    puede:
      (perfil?.verificado ?? false) ||
      (perfil?.exento_verificacion ?? false),
    verificado: perfil?.verificado ?? false,
    exento: perfil?.exento_verificacion ?? false,
  };
}