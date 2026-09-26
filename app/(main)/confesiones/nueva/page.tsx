"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { contienePalabraProhibida } from "@/lib/palabrasProhibidas";

export default function NuevaConfesionPage() {
  const router = useRouter();
  const supabase = createClient();

  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [anonima, setAnonima] = useState(true);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validaciones
    if (titulo.trim().length < 5) {
      return setError("El título debe tener al menos 5 caracteres");
    }

    if (contenido.trim().length < 20) {
      return setError("El contenido debe tener al menos 20 caracteres");
    }

        // 🚫 Filtro de palabras prohibidas
    const filtroTitulo = contienePalabraProhibida(titulo);
    if (filtroTitulo.contiene) {
      return setError(
        "Tu confesión contiene lenguaje no permitido. Por favor revísala antes de enviar."
      );
    }

    const filtroContenido = contienePalabraProhibida(contenido);
    if (filtroContenido.contiene) {
      return setError(
        "Tu confesión contiene lenguaje no permitido. Por favor revísala antes de enviar."
      );
    }

    setCargando(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setCargando(false);
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("confesiones").insert({
      user_id: user.id,
      titulo: titulo.trim(),
      contenido: contenido.trim(),
      anonima,
      estado: "pendiente",
    });

    setCargando(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/confesiones/gracias");
  };

  return (
    <main className="min-h-screen py-12 px-6">
      <div className="max-w-2xl mx-auto">

        {/* Botón volver */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-texto-suave hover:text-marca transition mb-8"
        >
          ← Volver al inicio
        </Link>

        {/* Card */}
        <div className="bg-fondo-card border border-borde rounded-2xl p-8 shadow-2xl shadow-marca/10">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🤫</div>
            <h1 className="text-3xl font-bold gradient-animated">
              Cuenta tu confesión
            </h1>
            <p className="text-sm text-texto-suave mt-2">
              Lo que digas aquí puede que alguien lo lea 👀
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm">
              {error}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-texto-suave mb-1.5">
                Título <span className="text-rosa">*</span>
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                maxLength={120}
                placeholder="Un título llamativo..."
                className="w-full px-4 py-3 rounded-xl bg-fondo border border-borde text-texto placeholder-texto-suave/50 focus:border-marca focus:outline-none focus:ring-2 focus:ring-marca/20 transition"
              />
              <p className="text-xs text-texto-suave mt-1 text-right">
                {titulo.length}/120
              </p>
            </div>

            {/* Contenido */}
            <div>
              <label className="block text-sm font-medium text-texto-suave mb-1.5">
                Contenido <span className="text-rosa">*</span>
              </label>
              <textarea
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                required
                rows={8}
                maxLength={3000}
                placeholder="Escribe aquí tu confesión... sin miedo, aquí todo se sabe 🤫"
                className="w-full px-4 py-3 rounded-xl bg-fondo border border-borde text-texto placeholder-texto-suave/50 focus:border-marca focus:outline-none focus:ring-2 focus:ring-marca/20 transition resize-none"
              />
              <p className="text-xs text-texto-suave mt-1 text-right">
                {contenido.length}/3000
              </p>
            </div>

            {/* Anónima */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-fondo border border-borde">
              <button
                type="button"
                onClick={() => setAnonima(!anonima)}
                className={`
                  relative w-12 h-6 rounded-full transition-all flex-shrink-0 mt-0.5
                  ${anonima ? "bg-gradient-to-r from-marca to-rosa" : "bg-borde"}
                `}
              >
                <span
                  className={`
                    absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all
                    ${anonima ? "left-6" : "left-0.5"}
                  `}
                />
              </button>
              <div className="flex-1">
                <p className="text-sm font-medium text-texto">
                  Publicar como anónimo {anonima ? "✅" : ""}
                </p>
                <p className="text-xs text-texto-suave mt-1">
                  {anonima
                    ? "Nadie sabrá quién la escribió 🤫"
                    : "Se mostrará tu nombre de usuario"}
                </p>
              </div>
            </div>

            {/* Aviso de moderación */}
            <div className="p-4 rounded-xl bg-neon/5 border border-neon/20">
              <p className="text-xs text-texto-suave leading-relaxed">
                🔒 <strong className="text-neon">Aviso:</strong> Tu confesión pasará
                por revisión antes de ser publicada. Esto suele tardar unos minutos.
              </p>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={cargando}
              className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-marca to-rosa hover:from-marca-hover hover:to-rosa-hover transition-all duration-300 glow-marca disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {cargando ? "Enviando..." : "Enviar confesión 🚀"}
            </button>

          </form>

        </div>

        {/* Aviso legal */}
        <p className="text-xs text-center text-texto-suave mt-6">
          Al publicar aceptas nuestras normas de convivencia
        </p>

      </div>
    </main>
  );
}