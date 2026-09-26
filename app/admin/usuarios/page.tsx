import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function AdminUsuariosPage() {
  const supabase = await createClient();

  const { data: usuarios, error } = await supabase
    .from("profiles")
    .select("id, username, rol, avatar_url, creado_en")
    .order("creado_en", { ascending: false })
    .limit(200);

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-3xl font-bold text-texto">👥 Usuarios</h2>
        <p className="text-sm text-texto-suave mt-1">
          {usuarios?.length ?? 0} usuario(s) registrado(s)
        </p>
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
        <div className="bg-fondo-card border border-borde rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-fondo border-b border-borde">
                <tr className="text-left text-xs text-texto-suave uppercase">
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Registro</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-borde last:border-0 hover:bg-fondo-card-hover transition"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-marca to-rosa flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {u.username?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <span className="font-medium text-texto">
                          @{u.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {u.rol === "admin" ? (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-marca/20 text-marca border border-marca/30">
                          🎛️ Admin
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-fondo border border-borde text-texto-suave">
                          Usuario
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-texto-suave text-xs">
                      {new Date(u.creado_en).toLocaleDateString("es-ES")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}