/* eslint-disable react-hooks/immutability */
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function calcularEstado(ultimaConexion: string | null) {
  if (!ultimaConexion) {
    return { online: false, texto: "Desconectado", emoji: "⚫" };
  }

  const tiempo = Date.now() - new Date(ultimaConexion).getTime();
  const online = tiempo >= 0 && tiempo < 5 * 60 * 1000;

  return {
    online,
    texto: online ? "En línea" : "Desconectado",
    emoji: online ? "🟢" : "⚫",
  };
}

type Mensaje = {
  id: string;
  contenido: string;
  emisor_id: string;
  receptor_id: string;
  leido: boolean;
  creado_en: string;
};

type Amigo = {
  id: string;
  username: string;
  avatar_url: string | null;
  ultima_conexion: string | null;
};

export default function Chat({
  yoId,
  amigo,
  mensajesIniciales,
}: {
  yoId: string;
  amigo: Amigo;
  mensajesIniciales: Mensaje[];
}) {
  const supabase = createClient();
  const [mensajes, setMensajes] = useState<Mensaje[]>(mensajesIniciales);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [amigoEstado, setAmigoEstado] = useState(
    calcularEstado(amigo.ultima_conexion)
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll al final cuando hay nuevos mensajes
  const scrollAbajo = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollAbajo();
  }, [mensajes]);

  // Suscribirse a nuevos mensajes en tiempo real
  useEffect(() => {
    const canal = supabase
      .channel(`chat-${yoId}-${amigo.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensajes",
        },
        (payload) => {
          const nuevo = payload.new as Mensaje;

          // Solo si es de esta conversación
          const esDeEsta =
            (nuevo.emisor_id === yoId && nuevo.receptor_id === amigo.id) ||
            (nuevo.emisor_id === amigo.id && nuevo.receptor_id === yoId);

          if (esDeEsta) {
            setMensajes((prev) => {
              // Evitar duplicados
              if (prev.some((m) => m.id === nuevo.id)) return prev;
              return [...prev, nuevo];
            });

            // Marcar como leído si es del amigo
            if (nuevo.emisor_id === amigo.id) {
              supabase
                .from("mensajes")
                .update({ leido: true })
                .eq("id", nuevo.id);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [yoId, amigo.id]);

  // Actualizar estado del amigo cada 30s
  useEffect(() => {
    const intervalo = setInterval(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("ultima_conexion")
        .eq("id", amigo.id)
        .single();

      if (data) {
        setAmigoEstado(calcularEstado(data.ultima_conexion));
      }
    }, 30000);

    return () => clearInterval(intervalo);
  }, [amigo.id]);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();

    const contenido = texto.trim();
    if (!contenido || enviando) return;

    setEnviando(true);
    setTexto("");

    const { error } = await supabase.from("mensajes").insert({
      emisor_id: yoId,
      receptor_id: amigo.id,
      contenido,
    });

    setEnviando(false);

    if (error) {
      alert("Error: " + error.message);
      setTexto(contenido);
      return;
    }

    inputRef.current?.focus();
  };

  const inicial = (amigo.username?.[0] ?? "?").toUpperCase();

  const formatearHora = (fecha: string) => {
    return new Date(fecha).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatearFecha = (fecha: string) => {
    const d = new Date(fecha);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    if (d.toDateString() === hoy.toDateString()) return "Hoy";
    if (d.toDateString() === ayer.toDateString()) return "Ayer";

    return d.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
  };

  // Agrupar mensajes por fecha
  let ultimaFecha = "";

  return (
    <div className="bg-fondo-card border border-borde rounded-2xl overflow-hidden flex flex-col h-[calc(100vh-180px)]">

      {/* Header del chat */}
      <div className="bg-fondo-card border-b border-borde p-4 flex items-center gap-3">
        <Link
          href={`/amigos/${amigo.id}`}
          className="flex items-center gap-3 flex-1 min-w-0 group"
        >
          <div className="relative flex-shrink-0">
            {amigo.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={amigo.avatar_url}
                alt={amigo.username}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-marca to-rosa flex items-center justify-center text-white font-bold">
                {inicial}
              </div>
            )}
            <span
              className={`
                absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-fondo-card
                ${amigoEstado.online ? "bg-exito" : "bg-texto-suave"}
              `}
            />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-texto truncate group-hover:text-marca transition">
              @{amigo.username}
            </p>
            <p className="text-xs text-texto-suave">
              {amigoEstado.emoji} {amigoEstado.texto}
            </p>
          </div>
        </Link>
      </div>

      {/* Aviso seguridad */}
      <div className="bg-neon/5 border-b border-neon/20 px-4 py-2 text-xs text-texto-suave text-center">
        ⚠️ Nunca compartas datos personales, dinero o fotos íntimas
      </div>

      {/* Mensajes */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2"
      >
        {mensajes.length === 0 && (
          <div className="text-center py-10">
            <p className="text-sm text-texto-suave">
              Aún no hay mensajes. ¡Di hola! 👋
            </p>
          </div>
        )}

        {mensajes.map((m) => {
          const esMio = m.emisor_id === yoId;
          const fecha = formatearFecha(m.creado_en);
          const mostrarFecha = fecha !== ultimaFecha;
          ultimaFecha = fecha;

          return (
            <div key={m.id}>
              {mostrarFecha && (
                <div className="text-center my-3">
                  <span className="text-xs text-texto-suave bg-fondo px-3 py-1 rounded-full">
                    {fecha}
                  </span>
                </div>
              )}
              <div
                className={`flex ${esMio ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`
                    max-w-[75%] px-4 py-2 rounded-2xl break-words
                    ${
                      esMio
                        ? "bg-gradient-to-r from-marca to-rosa text-white rounded-br-sm"
                        : "bg-fondo border border-borde text-texto rounded-bl-sm"
                    }
                  `}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {m.contenido}
                  </p>
                  <p
                    className={`
                      text-[10px] mt-1 text-right
                      ${esMio ? "text-white/70" : "text-texto-suave"}
                    `}
                  >
                    {formatearHora(m.creado_en)}
                    {esMio && (
                      <span className="ml-1">
                        {m.leido ? "✓✓" : "✓"}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <form
        onSubmit={enviar}
        className="bg-fondo-card border-t border-borde p-3 flex gap-2"
      >
        <input
          ref={inputRef}
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          maxLength={1000}
          placeholder="Escribe un mensaje..."
          className="flex-1 px-4 py-3 rounded-xl bg-fondo border border-borde text-texto placeholder-texto-suave/50 focus:border-marca focus:outline-none focus:ring-2 focus:ring-marca/20 transition"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={!texto.trim() || enviando}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-marca to-rosa text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {enviando ? "..." : "➤"}
        </button>
      </form>

    </div>
  );
}