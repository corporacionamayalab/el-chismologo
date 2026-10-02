"use client";

import { useState, useRef, useEffect } from "react";

export default function CamaraSelfie({
  onCaptura,
}: {
  onCaptura: (file: File) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [activa, setActiva] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [capturada, setCapturada] = useState<File | null>(null);

  // Iniciar cámara
  const iniciarCamara = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user", // cámara frontal
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setActiva(true);
    } catch (err: unknown) {
      const errorObj = err as { name?: string; message?: string };

      if (errorObj.name === "NotAllowedError") {
        setError(
          "Debes permitir el acceso a la cámara. Ve a los ajustes del navegador y actívalo."
        );
      } else {
        setError(
          "No se pudo acceder a la cámara: " +
            (errorObj.message ?? "Error desconocido")
        );
      }
    }
  };

  // Detener cámara
  const detenerCamara = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setActiva(false);
  };

  // Limpiar al desmontar
  useEffect(() => {
    return () => detenerCamara();
  }, []);

  // Capturar foto
  const capturar = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        const file = new File([blob], `selfie-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        const url = URL.createObjectURL(blob);
        setPreview(url);
        setCapturada(file);
        detenerCamara();
      },
      "image/jpeg",
      0.85
    );
  };

  // Confirmar
  const confirmar = () => {
    if (capturada) {
      onCaptura(capturada);
    }
  };

  // Reintentar
  const reintentar = () => {
    setPreview(null);
    setCapturada(null);
    iniciarCamara();
  };

  return (
    <div className="space-y-4">
      {/* Cámara activa */}
      {activa && (
        <div className="relative rounded-2xl overflow-hidden border-2 border-marca/40 bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-auto"
          />
          {/* Guía de óvalo */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-48 h-64 rounded-full border-4 border-white/60" />
          </div>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="relative rounded-2xl overflow-hidden border-2 border-marca/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Selfie" className="w-full h-auto" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-sm">
          {error}
        </div>
      )}

      {/* Controles */}
      <div className="flex gap-3">
        {!activa && !preview && (
          <button
            type="button"
            onClick={iniciarCamara}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-marca to-rosa text-white font-semibold hover:opacity-90 transition"
          >
            📸 Abrir cámara
          </button>
        )}

        {activa && (
          <>
            <button
              type="button"
              onClick={capturar}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-marca to-rosa text-white font-semibold hover:opacity-90 transition"
            >
              📸 Capturar
            </button>
            <button
              type="button"
              onClick={detenerCamara}
              className="px-5 py-3 rounded-xl border border-borde text-texto-suave hover:text-texto transition"
            >
              Cancelar
            </button>
          </>
        )}

        {preview && (
          <>
            <button
              type="button"
              onClick={confirmar}
              className="flex-1 py-3 rounded-xl bg-exito hover:bg-exito/80 text-white font-semibold transition"
            >
              ✅ Usar esta foto
            </button>
            <button
              type="button"
              onClick={reintentar}
              className="px-5 py-3 rounded-xl border border-borde text-texto-suave hover:text-texto transition"
            >
              🔄 Reintentar
            </button>
          </>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}