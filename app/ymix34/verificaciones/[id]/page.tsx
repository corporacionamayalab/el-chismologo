import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PanelVerificar from "@/components/PanelVerificar";

export const revalidate = 0;

export default async function AdminVerificacionDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Traer verificación
  const { data: verificacion } = await supabase
    .from("verificaciones")
    .select(
      `
      id,
      user_id,
      nombre_completo,
      fecha_nacimiento,
      selfie_url,
      estado,
      motivo_rechazo,
      creado_en,
      revisado_en,
      perfil:profiles!verificaciones_user_id_fkey (
        id,
        username,
        avatar_url,
        nombre_real,
        apellido_real,
        estado_verificacion
      )
    `
    )
    .eq("id", id)
    .single();

  if (!verificacion) notFound();

  const perfil = Array.isArray(verificacion.perfil)
    ? verificacion.perfil[0]
    : verificacion.perfil;

  // Traer las fotos de perfil del usuario
  const { data: fotos } = await supabase
    .from("perfil_fotos")
    .select("id, url, orden")
    .eq("user_id", verificacion.user_id)
    .order("orden", { ascending: true });

  // Generar URL firmada para la selfie (bucket privado)
  const { data: urlFirmada } = await supabase.storage
    .from("verificaciones")
    .createSignedUrl(verificacion.selfie_url, 3600); // 1 hora

  const selfieUrl = urlFirmada?.signedUrl ?? null;

  const formatearFecha = (fecha: string) => {
    const d = new Date(fecha);
    return d.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date();
    const nac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) {
      edad--;
    }
    return edad;
  };

  const edad = calcularEdad(verificacion.fecha_nacimiento);

  return (
    <div className="space-y-6">

      <Link
        href="/ymix34/verificaciones"
        className="inline-flex items-center gap-2 text-sm text-texto-suave hover:text-marca transition"
      >
        ← Volver a verificaciones
      </Link>

      {/* Estado */}
      <div
        className={`
          p-4 rounded-2xl border flex items-center justify-between gap-4
          ${
            verificacion.estado === "pendiente"
              ? "bg-marca/10 border-marca/30"
              : verificacion.estado === "aprobado"
              ? "bg-exito/10 border-exito/30"
              : "bg-error/10 border-error/30"
          }
        `}
      >
        <div>
          <p className="text-xs uppercase font-semibold text-texto-suave">
            Estado
          </p>
          <p className="text-lg font-bold text-texto capitalize">
            {verificacion.estado === "pendiente" && "⏳ Pendiente"}
            {verificacion.estado === "aprobado" && "✅ Aprobado"}
            {verificacion.estado === "rechazado" && "❌ Rechazado"}
          </p>
        </div>

        {verificacion.revisado_en && (
          <div className="text-right">
            <p className="text-xs uppercase font-semibold text-texto-suave">
              Revisado
            </p>
            <p className="text-sm text-texto">
              {formatearFecha(verificacion.revisado_en)}
            </p>
          </div>
        )}
      </div>

      {verificacion.motivo_rechazo && (
        <div className="p-4 rounded-2xl bg-error/10 border border-error/30">
          <p className="text-xs uppercase font-semibold text-error">
            Motivo de rechazo
          </p>
          <p className="text-sm text-error mt-1">
            {verificacion.motivo_rechazo}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">

        {/* COLUMNA IZQUIERDA: Selfie + Fotos */}
        <div className="space-y-6">

          {/* Selfie */}
          <div className="bg-fondo-card border border-borde rounded-2xl p-5">
            <h3 className="text-sm font-bold text-texto mb-3 flex items-center gap-2">
              📸 Selfie de verificación
            </h3>

            {selfieUrl ? (
              <div className="aspect-square rounded-xl overflow-hidden border border-borde bg-fondo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selfieUrl}
                  alt="Selfie de verificación"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square rounded-xl border border-borde bg-fondo flex items-center justify-center">
                <p className="text-xs text-texto-suave">
                  No se pudo cargar la selfie
                </p>
              </div>
            )}
          </div>

          {/* Fotos de perfil */}
          <div className="bg-fondo-card border border-borde rounded-2xl p-5">
            <h3 className="text-sm font-bold text-texto mb-3 flex items-center gap-2">
              🖼️ Fotos de perfil ({fotos?.length ?? 0})
            </h3>

            {fotos && fotos.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {fotos.map((f) => (
                  <a
                    key={f.id}
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-square rounded-xl overflow-hidden border border-borde bg-fondo hover:border-marca/50 transition"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={f.url}
                      alt="Foto de perfil"
                      className="w-full h-full object-cover"
                    />
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-fondo rounded-xl border border-borde">
                <p className="text-xs text-texto-suave">
                  ⚠️ Sin fotos de perfil
                </p>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: Datos */}
        <div className="space-y-6">

          <div className="bg-fondo-card border border-borde rounded-2xl p-6 space-y-4">

            <div>
              <p className="text-xs text-texto-suave uppercase font-semibold">
                Nombre completo
              </p>
              <p className="text-2xl font-bold text-texto mt-1">
                {verificacion.nombre_completo}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-texto-suave uppercase font-semibold">
                  Fecha de nacimiento
                </p>
                <p className="text-base text-texto mt-1">
                  {new Date(verificacion.fecha_nacimiento).toLocaleDateString(
                    "es-ES"
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-texto-suave uppercase font-semibold">
                  Edad
                </p>
                <p className="text-base text-texto mt-1">
                  {edad} años
                </p>
              </div>
            </div>

            {edad < 18 && (
              <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-sm">
                ⚠️ <strong>Menor de edad</strong> — No debería verificarse
              </div>
            )}

            <div className="pt-4 border-t border-borde">
              <p className="text-xs text-texto-suave uppercase font-semibold">
                Usuario
              </p>
              <Link
                href={`/amigos/${perfil?.id}`}
                target="_blank"
                className="text-base text-marca hover:text-rosa transition mt-1 inline-block"
              >
                @{perfil?.username ?? "usuario"} →
              </Link>
            </div>

            <div className="pt-4 border-t border-borde">
              <p className="text-xs text-texto-suave uppercase font-semibold">
                Enviado
              </p>
              <p className="text-sm text-texto mt-1">
                {formatearFecha(verificacion.creado_en)}
              </p>
            </div>

          </div>

          {/* Panel de acciones (solo si está pendiente) */}
          {verificacion.estado === "pendiente" && (
            <PanelVerificar
              verificacionId={verificacion.id}
              userId={verificacion.user_id}
              nombreCompleto={verificacion.nombre_completo}
            />
          )}

        </div>
      </div>

    </div>
  );
}