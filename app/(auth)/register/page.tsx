"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (username.length < 3) {
      return setError("El usuario debe tener al menos 3 caracteres");
    }

    if (password.length < 6) {
      return setError("La contraseña debe tener al menos 6 caracteres");
    }

    if (password !== confirmPassword) {
      return setError("Las contraseñas no coinciden");
    }

    setCargando(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setCargando(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push(`/verificar-email?email=${encodeURIComponent(email)}`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
          <span className="text-3xl transition-transform group-hover:rotate-12">👀</span>
          <span className="text-2xl font-black gradient-animated">Chismólogo</span>
        </Link>

        <div className="bg-fondo-card border border-borde rounded-2xl p-8 shadow-2xl shadow-marca/10">
          <h1 className="text-2xl font-bold text-texto text-center">Crear cuenta</h1>
          <p className="text-sm text-texto-suave text-center mt-2">
            Únete y empieza a confesar, conocer y conectar
          </p>

          {error && (
            <div className="mt-6 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-texto-suave mb-1.5">
                Nombre de usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="tu_usuario"
                className="w-full px-4 py-3 rounded-xl bg-fondo border border-borde text-texto placeholder-texto-suave/50 focus:border-marca focus:outline-none focus:ring-2 focus:ring-marca/20 transition"
              />
            </div>

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
              <label className="block text-sm font-medium text-texto-suave mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-3 rounded-xl bg-fondo border border-borde text-texto placeholder-texto-suave/50 focus:border-marca focus:outline-none focus:ring-2 focus:ring-marca/20 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-texto-suave mb-1.5">
                Confirmar contraseña
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repite la contraseña"
                className="w-full px-4 py-3 rounded-xl bg-fondo border border-borde text-texto placeholder-texto-suave/50 focus:border-marca focus:outline-none focus:ring-2 focus:ring-marca/20 transition"
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-marca to-rosa hover:from-marca-hover hover:to-rosa-hover transition-all duration-300 glow-marca disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {cargando ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-borde" />
            <span className="text-xs text-texto-suave">o</span>
            <div className="flex-1 h-px bg-borde" />
          </div>

          <p className="text-sm text-center text-texto-suave">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-marca hover:text-rosa font-semibold transition">
              Inicia sesión
            </Link>
          </p>
        </div>

        <p className="text-xs text-center text-texto-suave mt-6">
          Al registrarte aceptas nuestros{" "}
          <Link href="/terminos" className="underline hover:text-marca">Términos</Link>{" "}
          y{" "}
          <Link href="/privacidad" className="underline hover:text-marca">Política de privacidad</Link>
        </p>
      </div>
    </main>
  );
}