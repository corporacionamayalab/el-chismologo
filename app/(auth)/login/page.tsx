"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const razon = searchParams.get("razon");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setCargando(false);

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        setError("Email o contraseña incorrectos");
      } else if (error.message.includes("Email not confirmed")) {
        setError("Debes verificar tu email antes de iniciar sesión");
      } else {
        setError(error.message);
      }
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 mb-8 group"
        >
          <span className="text-3xl transition-transform group-hover:rotate-12">
            👀
          </span>
          <span className="text-2xl font-black gradient-animated">
            Chismólogo
          </span>
        </Link>

        {/* Aviso de inactividad */}
        {razon === "inactividad" && (
          <div className="mb-6 p-4 rounded-xl bg-neon/10 border border-neon/30 text-sm">
            <p className="text-neon font-semibold mb-1">⏰ Sesión cerrada</p>
            <p className="text-texto-suave text-xs">
              Tu sesión se cerró automáticamente por inactividad. Vuelve a
              iniciar sesión.
            </p>
          </div>
        )}

        <div className="bg-fondo-card border border-borde rounded-2xl p-8 shadow-2xl shadow-marca/10">
          <h1 className="text-2xl font-bold text-texto text-center">
            Iniciar sesión
          </h1>
          <p className="text-sm text-texto-suave text-center mt-2">
            Bienvenido de nuevo 👋
          </p>

          {error && (
            <div className="mt-6 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-texto-suave">
                  Contraseña
                </label>
                <Link
                  href="/recuperar"
                  className="text-xs text-marca hover:text-rosa transition"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Tu contraseña"
                className="w-full px-4 py-3 rounded-xl bg-fondo border border-borde text-texto placeholder-texto-suave/50 focus:border-marca focus:outline-none focus:ring-2 focus:ring-marca/20 transition"
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-marca to-rosa hover:from-marca-hover hover:to-rosa-hover transition-all duration-300 glow-marca disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {cargando ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-borde" />
            <span className="text-xs text-texto-suave">o</span>
            <div className="flex-1 h-px bg-borde" />
          </div>

          <p className="text-sm text-center text-texto-suave">
            ¿No tienes cuenta?{" "}
            <Link
              href="/register"
              className="text-marca hover:text-rosa font-semibold transition"
            >
              Regístrate
            </Link>
          </p>
        </div>

        <p className="text-xs text-center text-texto-suave mt-6">
          Al iniciar sesión aceptas nuestros{" "}
          <Link href="/terminos" className="underline hover:text-marca">
            Términos
          </Link>{" "}
          y{" "}
          <Link href="/privacidad" className="underline hover:text-marca">
            Política de privacidad
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-texto-suave">Cargando...</p>
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}