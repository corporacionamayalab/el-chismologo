"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

type Comentario = {
  id: string;
  contenido: string;
  creado_en: string;
  user_id: string;
  perfil: { username: string; avatar_url: string | null } | null;
};

export default function ComentariosContacto({
  contactoId,
}: {
  contactoId: string;
}) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [nuevo, setNuevo] = useState("");
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  // ========================================
  // 1. CARGAR SESIÓN CON SUSCRIPCIÓN
  // ========================================
  useEffect(() => {
    // Leer sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setCargandoSesion(false);
    });

    // Escuchar cambios (login, logout, refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setCargandoSesion(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // ========================================
  // 2. CARGAR COMENTARIOS + TIEMPO REAL
  // ========================================
  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase
        .from("comentarios_contactos")
        .select(
          `
          id,
          contenido,
          creado_en,
          user_id,
          perfil:profiles!comentarios_contactos_user_id_fkey ( username, avatar_url )
        `
        )
        .eq("contacto_id", contactoId)
        .order("creado_en", { ascending: true });

      setComentarios(
        (data ?? []).map((c) => ({
          ...c,
          perfil: Array.isArray(c.perfil) ? c.perfil[0] ?? null : c.perfil,
        })) as Comentario[]
      );
      setCargando(false);
    };

    cargar();

    const canal = supabase
      .channel(`comentarios-contacto-${contactoId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comentarios_contactos",
          filter: `contacto_id=eq.${contactoId}`,
        },
        async (payload) => {
          const nuevo = payload.new as {
            id: string;
            contenido: string;
            creado_en: string;
            user_id: string;
          };

          const { data: perfil } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", nuevo.user_id)
            .single();

          setComentarios((prev) => [
            ...prev,
            { ...nuevo, perfil: perfil ?? null },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [contactoId, supabase]);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !nuevo.trim() || enviando) return;

    setEnviando(true);

    const { error } = await supabase.from("comentarios_contactos").insert({
      contacto_id: contactoId,
      user_id: user.id,
      contenido: nuevo.trim(),
    });

    setEnviando(false);

    if (error) {
      alert("Error: " + error.message);
      return;
    }

    setNuevo("");
  };

  const borrar = async (id: string) => {
    if (!confirm("¿Eliminar comentario?")) return;

    const { error } = await supabase
      .from("comentarios_contactos")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Error: " + error.message);
      return;
    }

    setComentarios((prev) => prev.filter((c) => c.id !== id));
  };

  const formatearFecha = (fecha: string) => {
    const d = new Date(fecha);
    const ahora = new Date();
    const diff = Math.floor((ahora.getTime() - d.getTime()) / 1000);

    if (diff < 60) return "ahora";
    if (diff < 3600) return `${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} d`;

    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-texto flex items-center gap-2">
        💬 Comentarios
        {comentarios.length > 0 && (
          <span className="text-sm font-normal text-texto-suave">
            ({comentarios.length})
          </span>
        )}
      </h3>

      {cargando ? (
        <p className="text-xs text-texto-suave text-center py-4">
          Cargando comentarios...
        </p>
      ) : comentarios.length === 0 ? (
        <div className="text-center py-8 bg-fondo rounded-xl border border-borde">
          <p className="text-sm text-texto-suave">
            Sin comentarios aún. ¡Sé el primero! 👋
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {comentarios.map((c) => {
            const inicial = (c.perfil?.username?.[0] ?? "?").toUpperCase();
            const esMio = c.user_id === user?.id;

            return (
              <div
                key={c.id}
                className="flex gap-3 p-3 rounded-xl bg-fondo border border-borde group"
              >
                <div className="flex-shrink-0">
                  {c.perfil?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.perfil.avatar_url}
                      alt={c.perfil.username}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-marca to-rosa flex items-center justify-center text-white text-xs font-bold">
                      {inicial}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-texto truncate">
                      @{c.perfil?.username ?? "usuario"}
                    </p>
                    <span className="text-xs text-texto-suave">
                      · {formatearFecha(c.creado_en)}
                    </span>
                  </div>
                  <p className="text-sm text-texto mt-1 whitespace-pre-wrap break-words">
                    {c.contenido}
                  </p>
                </div>

                {esMio && (
                  <button
                    onClick={() => borrar(c.id)}
                    className="text-xs text-texto-suave hover:text-error transition opacity-0 group-hover:opacity-100 flex-shrink-0"
                    title="Eliminar"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* FORMULARIO / LOGIN */}
      {cargandoSesion ? (
        <div className="text-center py-4 bg-fondo rounded-xl border border-borde">
          <p className="text-xs text-texto-suave">Cargando...</p>
        </div>
      ) : user ? (
        <form onSubmit={enviar} className="flex gap-2">
          <input
            type="text"
            value={nuevo}
            onChange={(e) => setNuevo(e.target.value)}
            maxLength={500}
            placeholder="Escribe un comentario..."
            className="flex-1 px-4 py-3 rounded-xl bg-fondo border border-borde text-texto placeholder-texto-suave/50 focus:border-marca focus:outline-none focus:ring-2 focus:ring-marca/20 transition"
          />
          <button
            type="submit"
            disabled={!nuevo.trim() || enviando}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-marca to-rosa text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {enviando ? "..." : "Enviar"}
          </button>
        </form>
      ) : (
        <div className="text-center py-4 bg-fondo rounded-xl border border-borde">
          <p className="text-sm text-texto-suave">
            <a href="/login" className="text-marca hover:underline">
              Inicia sesión
            </a>{" "}
            para comentar
          </p>
        </div>
      )}
    </div>
  );
}