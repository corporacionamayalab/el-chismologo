"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RecuperarPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/nueva-password`,
    });

    setCargando(false);

    if (error) {
      setError(error.message);
      return;
    }

    setEnviado(true);
  };

  if (enviado) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md text-center">

          <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
            <span className="text-3xl group-hover:rotate-12 transition-transform">👀</span>
            <span className="text-2xl font-black gradient-animated">Chismólogo</span>
          </Link>

          <div className="bg-fondo-card border border-borde rounded-2xl p-8 shadow-2xl shadow-marca/10">
            <div className="text-6xl mb-4">📩</div>

            <h1 className="text-2xl font-bold text-texto">
              Revisa tu correo
            </h1>

            <p className="text-sm text-texto-suave mt-4 leading-relaxed">
              Te enviamos un enlace para restablecer tu contraseña a:
            </p>
            <p className="text-sm font-semibold text-marca mt-1 break-all">
              {email}
            </p>

            <p className="text-sm text-texto-suave mt-6 leading-relaxed">
              Haz clic en el enlace del correo para crear una nueva contraseña.
              Si no lo ves, revisa tu carpeta de <strong className="text-texto">spam</strong>.
            </p>

            <div className="mt-8 pt-6 border-t border-borde">
              <p className="text-xs text-texto-suave">
                ¿Ya lo recordaste?{" "}
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

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">

        <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
          <span className="text-3xl group-hover:rotate-12 transition-transform">👀</span>
          <span className="text-2xl font-black gradient-animated">Chismólogo</span>
        </Link>

        <div className="bg-fondo-card border border-borde rounded-2xl p-8 shadow-2xl shadow-marca/10">

          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🔑</div>
            <h1 className="text-2xl font-bold text-texto">
              Recuperar contraseña
            </h1>
            <p className="text-sm text-texto-suave mt-2">
              Te enviaremos un enlace para restablecerla
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-texto-suave mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className="w-full px-4 py-3 rounded-xl bg-fondo border border-borde text-texto placeholder-texto-suave/50 focus:border-marca focus:outline-none focus:ring-2 focus:ring-marca/20 transition"
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-marca to-rosa hover:from-marca-hover hover:to-rosa-hover transition-all duration-300 glow-marca disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {cargando ? "Enviando..." : "Enviar enlace 📩"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-borde" />
            <span className="text-xs text-texto-suave">o</span>
            <div className="flex-1 h-px bg-borde" />
          </div>

          <p className="text-sm text-center text-texto-suave">
            ¿Ya la recordaste?{" "}
            <Link href="/login" className="text-marca hover:text-rosa font-semibold transition">
              Inicia sesión
            </Link>
          </p>

        </div>

      </div>
    </main>
  );
}