import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function AdminUsuariosPage() {
  const supabase = await createClient();

  const { data: usuarios, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      username,
      avatar_url,
      rol,
      bloqueado,
      ciudad,
      ultima_conexion,
      creado_en
    `
    )
    .order("creado_en", { ascending: false })
    .limit(500);

  const formatearFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const calcularEstado = (ultimaConexion: string | null) => {
    if (!ultimaConexion) return { online: false, texto: "Desconocido" };
    const diff = Math.floor(
      // eslint-disable-next-line react-hooks/purity
      (Date.now() - new Date(ultimaConexion).getTime()) / 1000
    );
    if (diff < 120) return { online: true, texto: "En línea" };
    if (diff < 3600) return { online: false, texto: `Hace ${Math.floor(diff / 60)} min` };
    if (diff < 86400) return { online: false, texto: `Hace ${Math.floor(diff / 3600)} h` };
    return { online: false, texto: `Hace ${Math.floor(diff / 86400)} d` };
  };

  const total = usuarios?.length ?? 0;
  const bloqueados = usuarios?.filter((u) => u.bloqueado).length ?? 0;
  const admins = usuarios?.filter((u) => u.rol === "admin").length ?? 0;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-texto">👥 Usuarios</h2>
          <p className="text-sm text-texto-suave mt-1">
            {total} usuario{total !== 1 ? "s" : ""} · {admins} admin{admins !== 1 ? "s" : ""} · {bloqueados} bloqueado{bloqueados !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-error/10 border border-error/30 text-error text-sm">
          Error: {error.message}
        </div>
      )}

      {!usuarios?.length ? (
        <div className="text-center py-16 bg-fondo-card border border-borde rounded-2xl">
          <div className="text-5xl mb-3">👤</div>
          <p className="text-sm text-texto-suave">No hay usuarios</p>
        </div>
      ) : (
        <div className="space-y-3">
          {usuarios.map((u) => {
            const estado = calcularEstado(u.ultima_conexion);
            const inicial = (u.username?.[0] ?? "?").toUpperCase();

            return (
              <div
                key={u.id}
                className={`
                  bg-fondo-card border rounded-2xl p-4 flex items-center gap-4 flex-wrap
                  ${u.bloqueado ? "border-error/40 opacity-75" : "border-borde"}
                `}
              >
                {/* Avatar */}
                <Link href={`/ymix34/usuarios/${u.id}`} className="flex-shrink-0">
                  {u.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={u.avatar_url}
                      alt={u.username}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-marca to-rosa flex items-center justify-center text-white font-bold text-lg">
                      {inicial}
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/ymix34/usuarios/${u.id}`}
                      className="font-bold text-texto hover:text-marca transition"
                    >
                      @{u.username}
                    </Link>

                    {u.rol === "admin" && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-marca/20 text-marca border border-marca/30 font-semibold">
                        🎛️ Admin
                      </span>
                    )}

                    {u.bloqueado && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-error/20 text-error border border-error/30 font-semibold">
                        🚫 Bloqueado
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-texto-suave mt-1">
                    <span>{estado.online ? "🟢" : "⚫"} {estado.texto}</span>
                    {u.ciudad && <span>📍 {u.ciudad}</span>}
                    <span>📅 {formatearFecha(u.creado_en)}</span>
                  </div>
                </div>

                {/* Acciones */}
                <Link
                  href={`/ymix34/usuarios/${u.id}`}
                  className="px-4 py-2 rounded-xl bg-marca/10 border border-marca/30 text-marca hover:bg-marca/20 text-sm font-semibold transition"
                >
                  👁️ Ver info
                </Link>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}