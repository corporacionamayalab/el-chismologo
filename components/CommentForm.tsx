"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { contienePalabraProhibida } from "@/lib/palabrasProhibidas";
import BloqueoVerificacion from "./BloqueoVerificacion";
import type { User } from "@supabase/supabase-js";

export default function CommentForm({ confesionId }: { confesionId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [puedeInteractuar, setPuedeInteractuar] = useState(false);
  const [texto, setTexto] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const verificar = async (u: User) => {
      const { data: perfil } = await supabase
        .from("profiles")
        .select("verificado, exento_verificacion")
        .eq("id", u.id)
        .single();

      setPuedeInteractuar(
        (perfil?.verificado ?? false) || (perfil?.exento_verificacion ?? false)
      );
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      setCargandoSesion(false);
      if (u) verificar(u);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      setCargandoSesion(false);
      if (u) await verificar(u);
      else setPuedeInteractuar(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user || !puedeInteractuar) return;

    const contenido = texto.trim();

    if (contenido.length < 2) return setError("El comentario es muy corto");
    if (contenido.length > 500)
      return setError("El comentario no puede pasar de 500 caracteres");

    const filtro = contienePalabraProhibida(contenido);
    if (filtro.contiene)
      return setError("Tu comentario contiene lenguaje no permitido.");

    setCargando(true);

    const { error } = await supabase.from("comentarios").insert({
      confesion_id: confesionId,
      user_id: user.id,
      contenido,
    });

    setCargando(false);

    if (error) return setError(error.message);

    setTexto("");
    router.refresh();
  };

  if (cargandoSesion) {
    return (
      <div className="bg-fondo-card border border-borde rounded-2xl p-6 text-center">
        <p className="text-xs text-texto-suave">Cargando...</p>
      </div>
    );
  }

  // Sin login
  if (!user) {
    return (
      <div className="bg-fondo-card border border-borde rounded-2xl p-6 text-center">
        <p className="text-sm text-texto-suave">
          <Link
            href="/login"
            className="text-marca hover:text-rosa font-semibold underline"
          >
            Inicia sesión
          </Link>{" "}
          para dejar un comentario
        </p>
      </div>
    );
  }

  // Sin verificación
  if (!puedeInteractuar) {
    return <BloqueoVerificacion accion="comentar" />;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-fondo-card border border-borde rounded-2xl p-4"
    >
      {error && (
        <div className="mb-3 p-2 rounded-lg bg-error/10 border border-error/30 text-error text-xs">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          maxLength={500}
          placeholder="Escribe un comentario..."
          className="flex-1 px-4 py-3 rounded-xl bg-fondo border border-borde text-texto placeholder-texto-suave/50 focus:border-marca focus:outline-none focus:ring-2 focus:ring-marca/20 transition text-sm"
        />
        <button
          type="submit"
          disabled={cargando || !texto.trim()}
          className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-marca to-rosa hover:from-marca-hover hover:to-rosa-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
        >
          {cargando ? "..." : "Comentar"}
        </button>
      </div>

      <p className="text-xs text-texto-suave mt-2 text-right">
        {texto.length}/500
      </p>
    </form>
  );
}