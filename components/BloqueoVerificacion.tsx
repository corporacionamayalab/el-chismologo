"use client";

import Link from "next/link";

export default function BloqueoVerificacion({
  titulo = "Verifica tu cuenta",
  mensaje = "Para publicar, comentar y chatear necesitas verificarte. Es rápido y solo se hace una vez.",
  accion = "publicar",
}: {
  titulo?: string;
  mensaje?: string;
  accion?: string;
}) {
  return (
    <div className="bg-fondo-card border border-marca/30 rounded-2xl p-6 text-center">
      <div className="text-5xl mb-4">🛡️</div>

      <h3 className="text-xl font-bold text-texto mb-2">{titulo}</h3>

      <p className="text-sm text-texto-suave mb-6 max-w-md mx-auto">
        {mensaje}
      </p>

      <div className="space-y-2 max-w-xs mx-auto">
        <Link
          href="/verificacion"
          className="block w-full py-3 rounded-xl bg-gradient-to-r from-marca to-rosa text-white font-semibold hover:opacity-90 transition"
        >
          ✅ Verificarme ahora
        </Link>

        <Link
          href="/"
          className="block w-full py-3 rounded-xl border border-borde text-texto-suave hover:text-texto transition text-sm"
        >
          Volver al inicio
        </Link>
      </div>

      <p className="text-xs text-texto-suave mt-6">
        🔒 La verificación es gratis y solo toma 2 minutos
      </p>
    </div>
  );
}