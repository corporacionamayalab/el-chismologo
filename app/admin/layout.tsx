import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("profiles")
    .select("username, rol")
    .eq("id", user.id)
    .single();

  if (perfil?.rol !== "admin") redirect("/");

    const enlaces = [
    { href: "/admin", label: "Dashboard", emoji: "📊" },
    { href: "/admin/pendientes", label: "Pendientes", emoji: "⏳" },
    { href: "/admin/confesiones", label: "Confesiones", emoji: "📝" },
    { href: "/admin/contactos", label: "Contactos", emoji: "💘" },
    { href: "/admin/usuarios", label: "Usuarios", emoji: "👥" },
    { href: "/admin/reportes", label: "Reportes", emoji: "🚨" },
  ];

  return (
    <div className="min-h-screen bg-fondo">

      {/* Header admin */}
      <div className="sticky top-0 z-40 bg-fondo-card/95 backdrop-blur-xl border-b border-borde">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎛️</span>
            <div>
              <h1 className="text-lg font-bold text-texto">
                Panel de Admin
              </h1>
              <p className="text-xs text-texto-suave">
                @{perfil?.username}
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="text-sm text-texto-suave hover:text-marca transition"
          >
            ← Volver a la web
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">

        {/* Sidebar */}
        <aside className="md:w-56 flex-shrink-0">
          <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {enlaces.map((e) => (
              <Link
                key={e.href}
                href={e.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-texto-suave hover:bg-fondo-card hover:text-texto transition whitespace-nowrap border border-transparent hover:border-borde"
              >
                <span className="text-lg">{e.emoji}</span>
                <span>{e.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Contenido */}
        <main className="flex-1 min-w-0">{children}</main>

      </div>
    </div>
  );
}