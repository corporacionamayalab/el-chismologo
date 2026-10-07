import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Verificar si necesita verificarse
      const { data: perfil } = await supabase
        .from("profiles")
        .select("verificado, exento_verificacion")
        .eq("id", data.user.id)
        .single();

      const puedeInteractuar =
        perfil?.verificado === true || perfil?.exento_verificacion === true;

      if (!puedeInteractuar) {
        return NextResponse.redirect(`${origin}/verificacion`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}