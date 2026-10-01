"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Relacion = {
  id: string;
  estado: string;
  soySolicitante: boolean;
} | null;

export default function BotonesPerfil({
  usuarioId,
  yoId,
  relacion,
  bloqueado,
}: {
  usuarioId: string;
  yoId: string;
  relacion: Relacion;
  bloqueado: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [cargando, setCargando] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [mostrarReporte, setMostrarReporte] = useState(false);
  const [motivoReporte, setMotivoReporte] = useState("spam");
  const [detalleReporte, setDetalleReporte] = useState("");

  const ejecutar = async (fn: () => Promise<void>) => {
    setCargando(true);
    await fn();
    setCargando(false);
    router.refresh();
  };

  // 🔍 Buscar si ya existe una amistad entre ambos
  const buscarAmistadExistente = async () => {
    const { data } = await supabase
      .from("amistades")
      .select("id, estado, solicitante_id")
      .or(
        `and(solicitante_id.eq.${yoId},receptor_id.eq.${usuarioId}),and(solicitante_id.eq.${usuarioId},receptor_id.eq.${yoId})`
      )
      .maybeSingle();
    return data;
  };

  const enviarSolicitud = () =>
    ejecutar(async () => {
      // 🔍 Comprobar si YA existe una amistad entre ambos
      const existente = await buscarAmistadExistente();

      if (existente) {
        if (existente.estado === "pendiente") {
          // Si YO envié la solicitud → ya está enviada
          if (existente.solicitante_id === yoId) return;

          // Si la OTRA persona me la envió → aceptarla automáticamente
          const { error } = await supabase
            .from("amistades")
            .update({ estado: "aceptada" })
            .eq("id", existente.id);
          if (error) alert("Error: " + error.message);
          return;
        }
        // Ya aceptada o rechazada → no hacer nada
        return;
      }

      // ✅ No existe → crear la solicitud
      const { error } = await supabase.from("amistades").insert({
        solicitante_id: yoId,
        receptor_id: usuarioId,
      });
      if (error) alert("Error: " + error.message);
    });

  const aceptar = () =>
    ejecutar(async () => {
      if (!relacion) return;
      const { error } = await supabase
        .from("amistades")
        .update({ estado: "aceptada" })
        .eq("id", relacion.id);
      if (error) alert("Error: " + error.message);
    });

  const rechazar = () =>
    ejecutar(async () => {
      if (!relacion) return;
      const { error } = await supabase
        .from("amistades")
        .update({ estado: "rechazada" })
        .eq("id", relacion.id);
      if (error) alert("Error: " + error.message);
    });

  const cancelar = () =>
    ejecutar(async () => {
      if (!relacion) return;
      const { error } = await supabase
        .from("amistades")
        .delete()
        .eq("id", relacion.id);
      if (error) alert("Error: " + error.message);
    });

  const eliminarAmigo = () =>
    ejecutar(async () => {
      if (!relacion) return;
      if (!confirm("¿Eliminar a este amigo?")) return;
      const { error } = await supabase
        .from("amistades")
        .delete()
        .eq("id", relacion.id);
      if (error) alert("Error: " + error.message);
    });

  const bloquear = () =>
    ejecutar(async () => {
      if (!confirm("¿Bloquear a este usuario? Ya no podrá contactarte.")) return;
      const { error } = await supabase.from("bloqueos").insert({
        bloqueador: yoId,
        bloqueado: usuarioId,
      });
      if (error) alert("Error: " + error.message);
    });

  const desbloquear = () =>
    ejecutar(async () => {
      if (!confirm("¿Desbloquear a este usuario?")) return;
      const { error } = await supabase
        .from("bloqueos")
        .delete()
        .eq("bloqueador", yoId)
        .eq("bloqueado", usuarioId);
      if (error) alert("Error: " + error.message);
    });

  const enviarReporte = async () => {
    if (detalleReporte.trim().length < 5) {
      alert("Escribe un detalle (mínimo 5 caracteres)");
      return;
    }

    setCargando(true);
    const { error } = await supabase.from("reportes").insert({
      reportado_por: yoId,
      usuario_reportado: usuarioId,
      motivo: motivoReporte,
      detalle: detalleReporte.trim(),
    });
    setCargando(false);

    if (error) {
      alert("Error: " + error.message);
      return;
    }

    setMostrarReporte(false);
    setDetalleReporte("");
    alert("✅ Reporte enviado. Gracias por ayudar.");
  };

  // Bloqueado por mí
  if (bloqueado) {
    return (
      <button
        onClick={desbloquear}
        disabled={cargando}
        className="w-full py-3 rounded-xl border border-marca/40 text-marca hover:bg-marca/10 font-semibold transition disabled:opacity-50"
      >
        🚫 Desbloquear usuario
      </button>
    );
  }

  const estado = relacion?.estado;

  return (
    <div className="space-y-3">

      {/* Botones principales */}
      {!estado && (
        <button
          onClick={enviarSolicitud}
          disabled={cargando}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-marca to-rosa text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {cargando ? "..." : "+ Agregar amigo"}
        </button>
      )}

      {estado === "pendiente" && relacion?.soySolicitante && (
        <div className="flex gap-2">
          <div className="flex-1 py-3 rounded-xl bg-marca/10 border border-marca/30 text-marca font-semibold text-center text-sm">
            ⏳ Solicitud enviada
          </div>
          <button
            onClick={cancelar}
            disabled={cargando}
            className="px-4 py-3 rounded-xl border border-borde text-texto-suave hover:text-rosa hover:border-rosa/30 text-sm transition disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      )}

      {estado === "pendiente" && !relacion?.soySolicitante && (
        <div className="flex gap-2">
          <button
            onClick={aceptar}
            disabled={cargando}
            className="flex-1 py-3 rounded-xl bg-exito hover:bg-exito/80 text-white font-semibold transition disabled:opacity-50"
          >
            ✅ Aceptar
          </button>
          <button
            onClick={rechazar}
            disabled={cargando}
            className="flex-1 py-3 rounded-xl border border-error/40 text-error hover:bg-error/10 font-semibold transition disabled:opacity-50"
          >
            ❌ Rechazar
          </button>
        </div>
      )}

      {/* Botón de mensaje cuando son amigos */}
      {estado === "aceptada" && (
        <div className="space-y-2">
          <Link
            href={`/mensajes/${usuarioId}`}
            className="block py-3 rounded-xl bg-gradient-to-r from-marca to-rosa text-white font-semibold text-center hover:from-marca-hover hover:to-rosa-hover transition-all hover:scale-[1.02] shadow-lg shadow-marca/20"
          >
            💬 Enviar mensaje
          </Link>

          <div className="py-2.5 rounded-xl bg-exito/10 border border-exito/30 text-exito font-semibold text-center text-xs">
            ✅ Ya son amigos
          </div>

          <button
            onClick={eliminarAmigo}
            disabled={cargando}
            className="w-full py-2 rounded-xl border border-borde text-texto-suave hover:text-error hover:border-error/30 text-xs transition disabled:opacity-50"
          >
            Eliminar amigo
          </button>
        </div>
      )}

      {estado === "rechazada" && (
        <div className="py-3 rounded-xl bg-error/10 border border-error/30 text-error font-semibold text-center text-sm">
          ❌ Solicitud rechazada
        </div>
      )}

      {/* Menú de opciones */}
      <div className="relative">
        <button
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="w-full py-2.5 rounded-xl border border-borde text-texto-suave hover:text-texto hover:border-texto-suave/30 text-sm transition flex items-center justify-center gap-2"
        >
          ⚙️ Más opciones
        </button>

        {menuAbierto && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-fondo-card border border-borde rounded-xl shadow-2xl overflow-hidden z-10">
            <button
              onClick={() => {
                setMostrarReporte(true);
                setMenuAbierto(false);
              }}
              className="w-full text-left px-4 py-3 text-sm text-texto-suave hover:bg-fondo-card-hover hover:text-texto transition flex items-center gap-2"
            >
              🚩 Reportar usuario
            </button>
            <button
              onClick={() => {
                bloquear();
                setMenuAbierto(false);
              }}
              className="w-full text-left px-4 py-3 text-sm text-error hover:bg-error/10 transition flex items-center gap-2 border-t border-borde"
            >
              🚫 Bloquear usuario
            </button>
          </div>
        )}
      </div>

      {/* Modal reporte */}
      {mostrarReporte && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-fondo-card border border-borde rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-texto">
              🚩 Reportar usuario
            </h3>

            <div>
              <label className="block text-xs text-texto-suave mb-1.5">
                Motivo
              </label>
              <select
                value={motivoReporte}
                onChange={(e) => setMotivoReporte(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-fondo border border-borde text-texto focus:border-marca focus:outline-none"
              >
                <option value="spam">Spam</option>
                <option value="ofensivo">Contenido ofensivo</option>
                <option value="acoso">Acoso</option>
                <option value="sexual">Contenido sexual</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-texto-suave mb-1.5">
                Detalle
              </label>
              <textarea
                value={detalleReporte}
                onChange={(e) => setDetalleReporte(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Cuéntanos qué pasó..."
                className="w-full px-4 py-3 rounded-xl bg-fondo border border-borde text-texto focus:border-marca focus:outline-none resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={enviarReporte}
                disabled={cargando}
                className="flex-1 py-3 rounded-xl bg-error hover:bg-error/80 text-white font-semibold transition disabled:opacity-50"
              >
                {cargando ? "..." : "Enviar reporte"}
              </button>
              <button
                onClick={() => setMostrarReporte(false)}
                className="px-4 py-3 rounded-xl border border-borde text-texto-suave hover:text-texto transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}