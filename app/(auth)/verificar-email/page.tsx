"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function VerificarEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "tu correo";

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md text-center">

        <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
          <span className="text-3xl group-hover:rotate-12 transition-transform">👀</span>
          <span className="text-2xl font-black gradient-animated">Chismólogo</span>
        </Link>

        <div className="bg-fondo-card border border-borde rounded-2xl p-8 shadow-2xl shadow-marca/10">

          <div className="text-6xl mb-4">✉️</div>

          <h1 className="text-2xl font-bold text-texto">
            Verifica tu correo
          </h1>

          <p className="text-sm text-texto-suave mt-4 leading-relaxed">
            Te enviamos un enlace de verificación a:
          </p>
          <p className="text-sm font-semibold text-marca mt-1 break-all">
            {email}
          </p>

          <p className="text-sm text-texto-suave mt-6 leading-relaxed">
            Haz clic en el enlace del correo para activar tu cuenta.
            Si no lo ves, revisa tu carpeta de <strong className="text-texto">spam</strong>.
          </p>

          <div className="mt-8 pt-6 border-t border-borde">
            <p className="text-xs text-texto-suave">
              ¿Ya verificaste?{" "}
              <Link href="/login" className="text-marca hover:text-rosa font-semibold transition">
                Inicia sesión
              </Link>
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}

export default function VerificarEmailPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-texto-suave">Cargando...</p>
      </main>
    }>
      <VerificarEmailContent />
    </Suspense>
  );
}