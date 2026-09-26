"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function NuevaPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [cargandoInicial, setCargandoInicial] = useState(true);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);

  // Verificar que hay sesión (Supabase la crea al abrir el enlace)
  useEffect(() => {
    const verificar = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user ?? null);
      setCargandoInicial(false);
    };

    verificar();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      return setError("La contraseña debe tener al menos 6 caracteres");
    }

    if (password !== confirmPassword) {
      return setError("Las contraseñas no coinciden");
    }

    setCargando(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setCargando(false);

    if (error) {
      setError(error.message);
      return;
    }

    setExito(true);

    // Redirigir al home después de 2 segundos
    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 2000);
  };

  // Cargando inicial
  if (cargandoInicial) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-texto-suave">Verificando enlace...</p>
      </main>
    );
  }

  // Éxito
  if (exito) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md text-center">
          <div className="bg-fondo-card border border-borde rounded-2xl p-8">
            <div className="text-6xl mb-4 animate-bounce">✅</div>

            <h1 className="text-2xl font-bold text-texto">
              ¡Contraseña actualizada!
            </h1>

            <p className="text-sm text-texto-suave mt-4">
              Ya puedes usar tu nueva contraseña. Redirigiendo al inicio...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Sin sesión (enlace inválido o expirado)
  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md text-center">
          <div className="bg-fondo-card border border-borde rounded-2xl p-8">
            <div className="text-6xl mb-4">❌</div>

            <h1 className="text-2xl font-bold text-texto">
              Enlace inválido o expirado
            </h1>

            <p className="text-sm text-texto-suave mt-4 leading-relaxed">
              El enlace que usaste ya no es válido. Solicita uno nuevo.
            </p>

            <Link
              href="/recuperar"
              className="inline-block mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-marca to-rosa text-white font-semibold hover:from-marca-hover hover:to-rosa-hover transition"
            >
              🔑 Solicitar nuevo enlace
            </Link>
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
            <div className="text-4xl mb-3">🔐</div>
            <h1 className="text-2xl font-bold text-texto">
              Nueva contraseña
            </h1>
            <p className="text-sm text-texto-suave mt-2">
              Elige una contraseña segura
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
                Nueva contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
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
                minLength={6}
                placeholder="Repite la contraseña"
                className="w-full px-4 py-3 rounded-xl bg-fondo border border-borde text-texto placeholder-texto-suave/50 focus:border-marca focus:outline-none focus:ring-2 focus:ring-marca/20 transition"
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-marca to-rosa hover:from-marca-hover hover:to-rosa-hover transition-all duration-300 glow-marca disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {cargando ? "Guardando..." : "Cambiar contraseña 🔐"}
            </button>
          </form>

        </div>

      </div>
    </main>
  );
}