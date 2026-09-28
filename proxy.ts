import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 🔒 Proteger panel de admin (URL secreta: /ymix34)
  if (request.nextUrl.pathname.startsWith("/ymix34")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Verificar rol admin (el rol sigue siendo "admin")
    const { data: perfil } = await supabase
      .from("profiles")
      .select("rol")
      .eq("id", user.id)
      .single();

    if (perfil?.rol !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 🔒 Proteger creación de contenido
  const rutasProtegidas = [
    "/confesiones/nueva",
    "/contactos/nuevo",
  ];

  if (rutasProtegidas.some((r) => request.nextUrl.pathname.startsWith(r))) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};