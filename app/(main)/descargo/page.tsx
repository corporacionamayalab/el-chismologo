"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function DescargoPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [motivo, setMotivo] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [yaExiste, setYaExiste] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);

      const { data: perfil } = await supabase
        .from("profiles")
        .select("bloqueado, motivo_bloqueo")
        .eq("id", user.id)
        .single();

      if (!perfil?.bloqueado) {
        router.push("/");
        return;
      }

      setMotivo(perfil.motivo_bloqueo);

      const { data: descargos } = await supabase
        .from("descargos")
        .select("id, mensaje, respuesta, estado, creado_en")
        .eq("user_id", user.id)
        .order("creado_en", { ascending: false })
        .limit(1);

      if (descargos && descargos.length > 0) {
        setYaExiste(true);
      }

      setCargando(false);
    };

    cargar();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mensaje.trim().length < 20) {
      setError("El descargo debe tener al menos 20 caracteres");
      return;
    }

    if (mensaje.trim().length > 1000) {
      setError("El descargo no puede pasar de 1000 caracteres");
      return;
    }

    if (!user) return;

    setEnviando(true);

    const { error } = await supabase.from("descargos").insert({
      user_id: user.id,
      mensaje: mensaje.trim(),
    });

    setEnviando(false);

    if (error) {
      setError(error.message);
      return;
    }

    setEnviado(true);
  };

  if (cargando) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-texto-suave">Cargando...</p>
      </main>
    );
  }

  if (yaExiste && !enviado) {
    return (
      <main className="min-h-screen py-12 px-6">
        <div className="max-w-xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-texto-suave hover:text-marca transition mb-6"
          >
            ← Volver al inicio
          </Link>

          <div className="bg-fondo-card border border-borde rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">📬</div>
            <h1 className="text-2xl font-bold text-texto">
              Descargo ya enviado
            </h1>
            <p className="text-sm text-texto-suave mt-4 leading-relaxed">
              Ya enviaste un descargo. Está pendiente de revisión por el equipo.
              Te notificaremos cuando haya una respuesta.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (enviado) {
    return (
      <main className="min-h-screen py-12 px-6">
        <div className="max-w-xl mx-auto">
          <div className="bg-fondo-card border border-exito/30 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4 animate-bounce">✅</div>
            <h1 className="text-2xl font-bold text-exito">
              ¡Descargo enviado!
            </h1>
            <p className="text-sm text-texto-suave mt-4 leading-relaxed">
              Hemos recibido tu descargo. El equipo lo revisará y te responderá
              a la brevedad.
            </p>
            <Link
              href="/"
              className="inline-block mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-marca to-rosa text-white font-semibold hover:from-marca-hover hover:to-rosa-hover transition"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-12 px-6">
      <div className="max-w-xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-texto-suave hover:text-marca transition mb-6"
        >
          ← Volver al inicio
        </Link>

        <div className="bg-fondo-card border border-borde rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">💬</div>
            <h1 className="text-2xl font-bold text-texto">
              Enviar descargo
            </h1>
            <p className="text-sm text-texto-suave mt-2">
              Cuéntanos tu versión para revisar tu bloqueo
            </p>
          </div>

          {motivo && (
            <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/30">
              <p className="text-xs text-texto-suave uppercase font-semibold mb-1">
                Motivo del bloqueo
              </p>
              <p className="text-sm text-error font-medium">{motivo}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-texto-suave mb-2">
                Tu descargo
              </label>
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                required
                minLength={20}
                maxLength={1000}
                rows={6}
                placeholder="Explica por qué crees que el bloqueo fue un error o da tu versión de los hechos..."
                className="w-full px-4 py-3 rounded-xl bg-fondo border border-borde text-texto placeholder-texto-suave/50 focus:border-marca focus:outline-none focus:ring-2 focus:ring-marca/20 transition resize-none"
              />
              <p className="text-xs text-texto-suave mt-1 text-right">
                {mensaje.length}/1000
              </p>
            </div>

            <div className="p-3 rounded-xl bg-neon/10 border border-neon/30">
              <p className="text-xs text-texto-suave leading-relaxed">
                💡 <strong className="text-texto">Consejo:</strong> Sé honesto y respetuoso.
                Un buen descargo puede ayudar a que el equipo reconsidere tu caso.
              </p>
            </div>

            <button
              type="submit"
              disabled={enviando}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-marca to-rosa hover:from-marca-hover hover:to-rosa-hover transition-all glow-marca disabled:opacity-50"
            >
              {enviando ? "Enviando..." : "📩 Enviar descargo"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}