import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

const FILTROS = [
  { valor: "pendiente", label: "Pendientes", emoji: "⏳" },
  { valor: "aprobado", label: "Aprobados", emoji: "✅" },
  { valor: "rechazado", label: "Rechazados", emoji: "❌" },
];

export default async function AdminVerificacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>;
}) {
  const { filtro = "pendiente" } = await searchParams;
  const supabase = await createClient();

  const { data: verificaciones, error } = await supabase
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
    .eq("estado", filtro)
    .order("creado_en", { ascending: false });

  const total = verificaciones?.length ?? 0;

  const formatearFecha = (fecha: string) => {
    const d = new Date(fecha);
    return d.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
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

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-texto flex items-center gap-2">
          ✅ Verificaciones
        </h2>
        <p className="text-sm text-texto-suave mt-1">
          {total} usuario{total !== 1 ? "s" : ""} en estado &ldquo;{filtro}&rdquo;
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <Link
            key={f.valor}
            href={`/ymix34/verificaciones?filtro=${f.valor}`}
            className={`
              px-4 py-2 rounded-xl text-sm font-medium transition-all
              ${
                filtro === f.valor
                  ? "bg-gradient-to-r from-marca to-rosa text-white shadow-lg shadow-marca/20"
                  : "bg-fondo-card border border-borde text-texto-suave hover:text-texto hover:border-marca/30"
              }
            `}
          >
            {f.emoji} {f.label}
          </Link>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-error/10 border border-error/30 text-error text-sm">
          Error: {error.message}
        </div>
      )}

      {/* Estado vacío */}
      {!verificaciones?.length && !error && (
        <div className="text-center py-20 bg-fondo-card border border-borde rounded-2xl">
          <div className="text-6xl mb-4">
            {filtro === "pendiente" && "🎉"}
            {filtro === "aprobado" && "📭"}
            {filtro === "rechazado" && "📭"}
          </div>
          <h3 className="text-xl font-bold text-texto">
            {filtro === "pendiente" && "¡Todo al día!"}
            {filtro === "aprobado" && "Sin aprobaciones"}
            {filtro === "rechazado" && "Sin rechazos"}
          </h3>
          <p className="text-sm text-texto-suave mt-2">
            {filtro === "pendiente" && "No hay verificaciones pendientes"}
            {filtro === "aprobado" && "No hay usuarios aprobados aún"}
            {filtro === "rechazado" && "No hay usuarios rechazados"}
          </p>
        </div>
      )}

      {/* Lista */}
      <div className="space-y-4">
        {verificaciones?.map((v) => {
          const perfil = Array.isArray(v.perfil) ? v.perfil[0] : v.perfil;
          const edad = calcularEdad(v.fecha_nacimiento);

          return (
            <div
              key={v.id}
              className="bg-fondo-card border border-borde rounded-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-marca/5 border-b border-borde px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-marca/20 text-marca border border-marca/30">
                      🔍 Verificación #{v.id.slice(0, 8)}
                    </span>
                    <span className="text-xs text-texto-suave">
                      @{perfil?.username ?? "usuario"}
                    </span>
                  </div>
                  <p className="text-sm text-texto mt-2">
                    <strong>Enviado:</strong>{" "}
                    {formatearFecha(v.creado_en)}
                  </p>
                </div>

                <Link
                  href={`/ymix34/verificaciones/${v.id}`}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-marca to-rosa text-white text-sm font-semibold hover:opacity-90 transition"
                >
                  Ver detalle →
                </Link>
              </div>

              {/* Resumen */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
                {/* Selfie */}
                <div>
                  <p className="text-xs text-texto-suave uppercase font-semibold mb-2">
                    Selfie
                  </p>
                  <div className="aspect-square rounded-xl overflow-hidden border border-borde bg-fondo">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        // El bucket es privado, generamos URL firmada
                        // Por ahora mostramos el path
                        v.selfie_url.startsWith("http")
                          ? v.selfie_url
                          : "/placeholder-selfie.png"
                      }
                      alt="Selfie"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Datos */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-texto-suave uppercase font-semibold">
                      Nombre completo
                    </p>
                    <p className="text-lg font-bold text-texto mt-1">
                      {v.nombre_completo}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-texto-suave uppercase font-semibold">
                        Fecha de nacimiento
                      </p>
                      <p className="text-sm text-texto mt-1">
                        {new Date(v.fecha_nacimiento).toLocaleDateString(
                          "es-ES"
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-texto-suave uppercase font-semibold">
                        Edad
                      </p>
                      <p className="text-sm text-texto mt-1">
                        {edad} años {edad < 18 && "⚠️ MENOR DE EDAD"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-texto-suave uppercase font-semibold">
                      Usuario
                    </p>
                    <p className="text-sm text-texto mt-1">
                      @{perfil?.username ?? "usuario"}
                    </p>
                  </div>

                  {v.motivo_rechazo && (
                    <div>
                      <p className="text-xs text-error uppercase font-semibold">
                        Motivo de rechazo
                      </p>
                      <p className="text-sm text-error mt-1">
                        {v.motivo_rechazo}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}