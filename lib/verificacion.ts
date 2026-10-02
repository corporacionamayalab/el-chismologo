import { createClient } from "@/lib/supabase/server";

/**
 * Verifica si un usuario puede interactuar (publicar, comentar, reaccionar, chatear)
 */
export async function puedeInteractuar(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data: perfil } = await supabase
    .from("profiles")
    .select("verificado, exento_verificacion")
    .eq("id", userId)
    .single();

  if (!perfil) return false;

  return perfil.verificado === true || perfil.exento_verificacion === true;
}

/**
 * Devuelve el estado de verificación del usuario
 */
export async function getEstadoVerificacion(userId: string) {
  const supabase = await createClient();

  const { data: perfil } = await supabase
    .from("profiles")
    .select("verificado, exento_verificacion, estado_verificacion")
    .eq("id", userId)
    .single();

  return {
    verificado: perfil?.verificado ?? false,
    exento: perfil?.exento_verificacion ?? false,
    estado: perfil?.estado_verificacion ?? null,
    puedeInteractuar:
      (perfil?.verificado ?? false) || (perfil?.exento_verificacion ?? false),
  };
}