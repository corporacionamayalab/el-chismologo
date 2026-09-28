"use client";

import { useState, useEffect } from "react";

export default function PreviewMedia({
  archivo,
  onCancelar,
  onEnviar,
  onEditar,
}: {
  archivo: File;
  onCancelar: () => void;
  onEnviar: (efimero: boolean) => void;
  onEditar?: () => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [efimero, setEfimero] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const esVideo = archivo.type.startsWith("video/");
  const esImagen = archivo.type.startsWith("image/");

  // Crear URL de preview
  useEffect(() => {
    const url = URL.createObjectURL(archivo);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [archivo]);

  const pesoMB = (archivo.size / (1024 * 1024)).toFixed(2);

  const handleEnviar = () => {
    setEnviando(true);
    onEnviar(efimero);
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <button
          onClick={onCancelar}
          disabled={enviando}
          className="flex items-center gap-2 text-white/80 hover:text-white transition disabled:opacity-50"
        >
          <span className="text-2xl">✕</span>
          <span className="text-sm font-medium">Cancelar</span>
        </button>

        <div className="text-white text-sm">
          {esVideo ? "🎥 Video" : "📸 Imagen"} · {pesoMB} MB
        </div>

        <button
          onClick={handleEnviar}
          disabled={enviando}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-marca to-rosa text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {enviando ? (
            <>⏳ Enviando...</>
          ) : (
            <>📤 Enviar</>
          )}
        </button>
      </div>

      {/* Preview */}
            {/* Preview */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        {!previewUrl ? (
          <div className="text-white text-center">
            <p className="text-4xl mb-3">⏳</p>
            <p className="text-sm text-white/60">Cargando preview...</p>
          </div>
        ) : esVideo ? (
          <video
            src={previewUrl}
            className="max-w-full max-h-full object-contain rounded-2xl"
            controls
            autoPlay
            loop
            playsInline
          />
        ) : esImagen ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Preview"
            className="max-w-full max-h-full object-contain rounded-2xl"
          />
        ) : (
          <div className="text-white text-center">
            <p className="text-6xl mb-4">📄</p>
            <p>Tipo de archivo no soportado</p>
          </div>
        )}
      </div>

      {/* Footer con opciones */}
      <div className="p-4 border-t border-white/10 space-y-3">

        {/* Toggle efímero/permanente */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setEfimero(true)}
            disabled={enviando}
            className={`
              flex items-center gap-2 px-5 py-3 rounded-2xl transition
              ${
                efimero
                  ? "bg-gradient-to-r from-rosa to-marca text-white shadow-lg shadow-rosa/30"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              }
            `}
          >
            <span className="text-xl">🔥</span>
            <div className="text-left">
              <p className="text-sm font-bold">Ver 1 vez</p>
              <p className="text-xs opacity-80">Se borra al ver</p>
            </div>
          </button>

          <button
            onClick={() => setEfimero(false)}
            disabled={enviando}
            className={`
              flex items-center gap-2 px-5 py-3 rounded-2xl transition
              ${
                !efimero
                  ? "bg-gradient-to-r from-marca to-rosa text-white shadow-lg shadow-marca/30"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              }
            `}
          >
            <span className="text-xl">📎</span>
            <div className="text-left">
              <p className="text-sm font-bold">Permanente</p>
              <p className="text-xs opacity-80">Se queda en el chat</p>
            </div>
          </button>
        </div>

        {/* Info del modo seleccionado */}
        <p className="text-center text-xs text-white/50">
          {efimero
            ? "🔥 El receptor lo verá UNA sola vez y luego desaparecerá del chat"
            : "📎 El archivo se quedará visible en el chat siempre"}
        </p>

        {/* Botón Editar (solo para imágenes) */}
        {esImagen && onEditar && (
          <button
            onClick={onEditar}
            disabled={enviando}
            className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            ✏️ Editar antes de enviar
          </button>
        )}
      </div>

    </div>
  );
}