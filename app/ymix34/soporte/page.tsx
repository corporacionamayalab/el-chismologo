import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BotonDescargo from "@/components/BotonDescargo";

export const revalidate = 0;

export default async function AdminSoportePage() {
  const supabase = await createClient();

  const { data: descargos } = await supabase
    .from("descargos")
    .select(
      `
      id,
      mensaje,
      estado,
      leido,
      respuesta,
      respondido_en,
      creado_en,
      user_id,
      profiles:user_id ( id, username, avatar_url, motivo_bloqueo )
    `
    )
    .order("creado_en", { ascending: false })
    .limit(100);

  const pendientes = descargos?.filter((d) => d.estado === "pendiente").length ?? 0;

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-texto">💬 Soporte</h2>
          <p className="text-sm text-texto-suave mt-1">
            {pendientes > 0
              ? `${pendientes} descargo${pendientes !== 1 ? "s" : ""} pendiente${pendientes !== 1 ? "s" : ""}`
              : "Sin descargos pendientes ✅"}
          </p>
        </div>
      </div>

      {!descargos?.length ? (
        <div className="text-center py-16 bg-fondo-card border border-borde rounded-2xl">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-sm text-texto-suave">
            No hay descargos todavía
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {descargos.map((d) => {
            const perfil = Array.isArray(d.profiles) ? d.profiles[0] : d.profiles;
            if (!perfil) return null;
            const inicial = (perfil.username?.[0] ?? "?").toUpperCase();

            return (
              <div
                key={d.id}
                className={`
                  bg-fondo-card border rounded-2xl p-5 space-y-4
                  ${d.estado === "pendiente" ? "border-neon/40" : "border-borde opacity-75"}
                `}
              >
                {/* Header */}
                <div className="flex items-center gap-3 flex-wrap">
                  {perfil.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={perfil.avatar_url}
                      alt={perfil.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-marca to-rosa flex items-center justify-center text-white font-bold">
                      {inicial}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/ymix34/usuarios/${perfil.id}`}
                      className="font-semibold text-texto hover:text-marca transition"
                    >
                      @{perfil.username}
                    </Link>
                    <p className="text-xs text-texto-suave">
                      {new Date(d.creado_en).toLocaleString("es-ES")}
                    </p>
                  </div>

                  {d.estado === "pendiente" && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-neon/20 text-neon border border-neon/30 font-semibold">
                      🔔 Pendiente
                    </span>
                  )}
                  {d.estado === "leido" && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-marca/20 text-marca border border-marca/30 font-semibold">
                      👁️ Leído
                    </span>
                  )}
                  {d.estado === "resuelto" && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-exito/20 text-exito border border-exito/30 font-semibold">
                      ✅ Resuelto
                    </span>
                  )}
                </div>

                {/* Motivo del bloqueo */}
                {perfil.motivo_bloqueo && (
                  <div className="bg-error/5 border border-error/20 rounded-xl p-3">
                    <p className="text-xs text-texto-suave uppercase font-semibold mb-1">
                      Motivo del bloqueo
                    </p>
                    <p className="text-sm text-error">{perfil.motivo_bloqueo}</p>
                  </div>
                )}

                {/* Mensaje del descargo */}
                <div className="bg-fondo border border-borde rounded-xl p-4">
                  <p className="text-xs text-texto-suave uppercase font-semibold mb-2">
                    Descargo del usuario
                  </p>
                  <p className="text-sm text-texto leading-relaxed whitespace-pre-wrap">
                    {d.mensaje}
                  </p>
                </div>

                {/* Respuesta si existe */}
                {d.respuesta && (
                  <div className="bg-exito/5 border border-exito/20 rounded-xl p-4">
                    <p className="text-xs text-texto-suave uppercase font-semibold mb-2">
                      Tu respuesta
                    </p>
                    <p className="text-sm text-texto leading-relaxed whitespace-pre-wrap">
                      {d.respuesta}
                    </p>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex flex-wrap gap-2 pt-3 border-t border-borde">
                  <Link
                    href={`/ymix34/usuarios/${perfil.id}`}
                    className="text-xs px-3 py-2 rounded-lg bg-fondo border border-borde text-texto-suave hover:text-marca hover:border-marca/30 transition"
                  >
                    👤 Ver usuario
                  </Link>

                  <BotonDescargo
                    descargoId={d.id}
                    userId={perfil.id}
                    estado={d.estado}
                    respuestaActual={d.respuesta}
                    yaBloqueado={!!perfil.motivo_bloqueo}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}