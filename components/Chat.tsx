"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { calcularEstado } from "@/lib/estado";
import VisorMedia from "./VisorMedia";
import PreviewMedia from "./PreviewMedia";

type Mensaje = {
  id: string;
  contenido: string | null;
  media_url: string | null;
  media_tipo: string | null;
  tipo: string;
  efimero: boolean;
  visto: boolean;
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

const EMOJIS_HOT = [
  "😂", "😍", "🥰", "😎", "🤔", "😅", "😢", "😡", "😏", "😈", "🤭", "😴",
  "😘", "😜", "🤤", "😳", "🥵", "🥶", "🤯", "😱", "🤗", "🙃", "😋", "😝",
  "❤️", "💕", "💖", "💘", "💔", "💋", "💯", "🔥", "✨", "⭐", "💫", "🌟",
  "👍", "👎", "👏", "🙏", "💪", "🤝", "✌️", "👀", "💅", "🤙", "🤌", "💃",
  "🍑", "🍆", "👅", "💦", "🌶️", "😈", "💋", "🫦", "🥵", "🤭",
  "🎉", "🎊", "🎁", "🌹", "🍕", "🍔", "🍟", "☕", "🍺", "🍷", "🍿", "🎬",
];

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
  const [subiendo, setSubiendo] = useState(false);
  const [archivoPreview, setArchivoPreview] = useState<File | null>(null);
  const [mostrarEmojis, setMostrarEmojis] = useState(false);
  const [mediaAbierta, setMediaAbierta] = useState<Mensaje | null>(null);
  const [amigoEstado, setAmigoEstado] = useState(
    calcularEstado(amigo.ultima_conexion)
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  const scrollAbajo = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollAbajo();
  }, [mensajes]);

  useEffect(() => {
    const handleClickFuera = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setMostrarEmojis(false);
      }
    };
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  useEffect(() => {
    const bloquear = (e: MouseEvent) => e.preventDefault();
    const chat = scrollRef.current;
    if (chat) {
      chat.addEventListener("contextmenu", bloquear);
      return () => chat.removeEventListener("contextmenu", bloquear);
    }
  }, []);

  useEffect(() => {
    const canal = supabase
      .channel(`chat-${yoId}-${amigo.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mensajes" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const nuevo = payload.new as Mensaje;
            const esDeEsta =
              (nuevo.emisor_id === yoId && nuevo.receptor_id === amigo.id) ||
              (nuevo.emisor_id === amigo.id && nuevo.receptor_id === yoId);

            if (esDeEsta) {
              setMensajes((prev) => {
                if (prev.some((m) => m.id === nuevo.id)) return prev;
                return [...prev, nuevo];
              });

              if (nuevo.emisor_id === amigo.id) {
                supabase
                  .from("mensajes")
                  .update({ leido: true })
                  .eq("id", nuevo.id);
              }
            }
          } else if (payload.eventType === "DELETE") {
            const borrado = payload.old as { id: string };
            setMensajes((prev) => prev.filter((m) => m.id !== borrado.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [yoId, amigo.id]);

  useEffect(() => {
    const intervalo = setInterval(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("ultima_conexion")
        .eq("id", amigo.id)
        .single();

      if (data) setAmigoEstado(calcularEstado(data.ultima_conexion));
    }, 30000);

    return () => clearInterval(intervalo);
  }, [amigo.id]);

  const enviarTexto = async (e: React.FormEvent) => {
    e.preventDefault();

    const contenido = texto.trim();
    if (!contenido || enviando) return;

    setEnviando(true);
    setTexto("");

    const { error } = await supabase.from("mensajes").insert({
      emisor_id: yoId,
      receptor_id: amigo.id,
      contenido,
      tipo: "texto",
      efimero: false,
    });

    setEnviando(false);

    if (error) {
      alert("Error: " + error.message);
      setTexto(contenido);
      return;
    }

    inputRef.current?.focus();
  };

  const handleSeleccionArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const esVideo = file.type.startsWith("video/");
    const esImagen = file.type.startsWith("image/");

    if (!esVideo && !esImagen) {
      alert("Solo se permiten imágenes o videos");
      return;
    }

    const maxSize = esVideo ? 20 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(
        esVideo
          ? "El video no puede pesar más de 20MB"
          : "La imagen no puede pesar más de 5MB"
      );
      return;
    }

    setArchivoPreview(file);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const enviarArchivo = async (efimero: boolean) => {
    if (!archivoPreview) return;

    const file = archivoPreview;
    const esVideo = file.type.startsWith("video/");

    setSubiendo(true);

    const extension = file.name.split(".").pop();
    const nombreArchivo = `${yoId}/${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("chat")
      .upload(nombreArchivo, file, { cacheControl: "3600" });

    if (uploadError) {
      setSubiendo(false);
      alert("Error al subir: " + uploadError.message);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("chat")
      .getPublicUrl(nombreArchivo);

    const { error: insertError } = await supabase.from("mensajes").insert({
      emisor_id: yoId,
      receptor_id: amigo.id,
      media_url: urlData.publicUrl,
      media_tipo: esVideo ? "video" : "imagen",
      tipo: "media",
      efimero,
      visto: false,
    });

    setSubiendo(false);

    if (insertError) {
      alert("Error: " + insertError.message);
      return;
    }

    setArchivoPreview(null);
  };

  const formatearHora = (fecha: string) =>
    new Date(fecha).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatearFecha = (fecha: string) => {
    const d = new Date(fecha);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    if (d.toDateString() === hoy.toDateString()) return "Hoy";
    if (d.toDateString() === ayer.toDateString()) return "Ayer";

    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  };

  const inicial = (amigo.username?.[0] ?? "?").toUpperCase();
  let ultimaFecha = "";

  return (
    <>
      <div className="bg-fondo-card border border-borde rounded-2xl overflow-hidden flex flex-col h-[calc(100vh-180px)]">

        {/* Header */}
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

        {/* Aviso seguridad — CELESTE suave */}
        <div className="bg-marca/5 border-b border-marca/20 px-4 py-2 text-xs text-texto-suave text-center">
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
            // eslint-disable-next-line react-hooks/immutability
            ultimaFecha = fecha;

            const esMedia = m.tipo === "media";
            const esEfimeroVisto = m.efimero && m.visto && !esMio;
            const puedoVer = esMio || !m.efimero || !m.visto;

            return (
              <div key={m.id}>
                {mostrarFecha && (
                  <div className="text-center my-3">
                    <span className="text-xs text-texto-suave bg-fondo px-3 py-1 rounded-full">
                      {fecha}
                    </span>
                  </div>
                )}

                {esEfimeroVisto && (
                  <div className={`flex ${esMio ? "justify-end" : "justify-start"}`}>
                    <div className="max-w-[75%] px-4 py-3 rounded-2xl bg-fondo border border-borde text-texto-suave text-xs italic flex items-center gap-2">
                      <span>🔥</span>
                      <span>Contenido visto · Ya no disponible</span>
                    </div>
                  </div>
                )}

                {!esEfimeroVisto && (
                  <div className={`flex ${esMio ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`
                        max-w-[75%] rounded-2xl break-words overflow-hidden
                        ${
                          esMio
                            ? "bg-gradient-to-r from-marca to-rosa text-white rounded-br-sm"
                            : "bg-fondo border border-borde text-texto rounded-bl-sm"
                        }
                      `}
                    >
                      {esMedia && m.media_url && (
                        <button
                          onClick={() => {
                            if (puedoVer) {
                              setMediaAbierta(m);
                            }
                          }}
                          className="relative block w-full"
                        >
                          {m.media_tipo === "video" ? (
                            <div className="relative w-64 h-64 bg-black flex items-center justify-center">
                              <video
                                src={m.media_url}
                                className="w-full h-full object-cover pointer-events-none"
                                muted
                                playsInline
                              />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <span className="text-5xl">▶️</span>
                              </div>
                            </div>
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={m.media_url}
                              alt="Media"
                              className="max-w-full max-h-80 object-cover"
                              onContextMenu={(e) => e.preventDefault()}
                            />
                          )}

                          {m.efimero && (
                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                              🔥 Ver 1 vez
                            </div>
                          )}
                        </button>
                      )}

                      {m.contenido && (
                        <p className="px-4 py-2 text-sm whitespace-pre-wrap">
                          {m.contenido}
                        </p>
                      )}

                      <p
                        className={`
                          text-[10px] px-4 pb-2 text-right
                          ${esMio ? "text-white/70" : "text-texto-suave"}
                        `}
                      >
                        {formatearHora(m.creado_en)}
                        {esMio && <span className="ml-1">{m.leido ? "✓✓" : "✓"}</span>}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selector emojis */}
        {mostrarEmojis && (
          <div
            ref={emojiRef}
            className="bg-fondo-card border-t border-borde p-3 max-h-52 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-texto-suave font-medium">
                Emojis 🔥
              </p>
              <button
                onClick={() => setMostrarEmojis(false)}
                className="text-xs text-texto-suave hover:text-rosa"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-8 gap-1">
              {EMOJIS_HOT.map((emoji, i) => (
                <button
                  key={`${emoji}-${i}`}
                  onClick={() => {
                    setTexto((t) => t + emoji);
                    inputRef.current?.focus();
                  }}
                  className="text-2xl p-1.5 rounded-lg hover:bg-fondo-card-hover transition hover:scale-125"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={enviarTexto}
          className="bg-fondo-card border-t border-borde p-3"
        >
          {subiendo && (
            <div className="text-xs text-marca mb-2 text-center">
              ⏳ Subiendo archivo...
            </div>
          )}

          <div className="flex gap-2 items-center">
            <button
              type="button"
              onClick={() => setMostrarEmojis(!mostrarEmojis)}
              className={`
                w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0
                ${
                  mostrarEmojis
                    ? "bg-marca/20 text-marca"
                    : "hover:bg-fondo-card-hover text-texto-suave"
                }
              `}
              title="Emojis"
            >
              😀
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={subiendo}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-texto-suave hover:bg-fondo-card-hover transition-all flex-shrink-0 disabled:opacity-50"
              title="Enviar foto o video"
            >
              📎
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleSeleccionArchivo}
              className="hidden"
            />

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
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-marca to-rosa text-white flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 hover:scale-105"
              title="Enviar"
            >
              {enviando ? "⏳" : "➤"}
            </button>
          </div>
        </form>

      </div>

      {archivoPreview && (
        <PreviewMedia
          archivo={archivoPreview}
          onCancelar={() => setArchivoPreview(null)}
          onEnviar={(efimero) => enviarArchivo(efimero)}
        />
      )}

      {mediaAbierta && (
        <VisorMedia
          mensaje={mediaAbierta}
          yoId={yoId}
          onCerrar={() => setMediaAbierta(null)}
          onVerCompletado={() => {
            setMensajes((prev) =>
              prev.map((m) =>
                m.id === mediaAbierta.id ? { ...m, visto: true } : m
              )
            );
            setMediaAbierta(null);
          }}
        />
      )}
    </>
  );
}