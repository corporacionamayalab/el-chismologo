"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

type Foto = {
  id: string;
  url: string;
  orden: number;
};

export default function GaleriaFotos({
  userId,
  editable = false,
  maxFotos = 5,
}: {
  userId: string;
  editable?: boolean;
  maxFotos?: number;
}) {
  const supabase = createClient();
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [fotoAbierta, setFotoAbierta] = useState<Foto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar fotos
  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase
        .from("perfil_fotos")
        .select("id, url, orden")
        .eq("user_id", userId)
        .order("orden", { ascending: true });

      setFotos((data ?? []) as Foto[]);
      setCargando(false);
    };
    cargar();
  }, [userId]);

  // Subir foto
  const subirFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (fotos.length >= maxFotos) {
      setError(`Máximo ${maxFotos} fotos`);
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setError("La imagen no puede pesar más de 3MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten imágenes");
      return;
    }

    setSubiendo(true);
    setError(null);

    const extension = file.name.split(".").pop();
    const nombreArchivo = `${userId}/${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("perfil-fotos")
      .upload(nombreArchivo, file, { cacheControl: "3600" });

    if (uploadError) {
      setSubiendo(false);
      setError("Error al subir: " + uploadError.message);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("perfil-fotos")
      .getPublicUrl(nombreArchivo);

    // Insertar en la DB
    const { data: nueva, error: insertError } = await supabase
      .from("perfil_fotos")
      .insert({
        user_id: userId,
        url: urlData.publicUrl,
        orden: fotos.length,
      })
      .select()
      .single();

    setSubiendo(false);

    if (insertError) {
      setError(insertError.message);
      // Borrar el archivo subido si falló el insert
      await supabase.storage.from("perfil-fotos").remove([nombreArchivo]);
      return;
    }

    setFotos([...fotos, nueva as Foto]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Borrar foto
  const borrarFoto = async (foto: Foto) => {
    if (!confirm("¿Eliminar esta foto?")) return;

    // Extraer el path del storage desde la URL
    const path = foto.url.split("/perfil-fotos/")[1];
    if (path) {
      await supabase.storage.from("perfil-fotos").remove([path]);
    }

    const { error } = await supabase
      .from("perfil_fotos")
      .delete()
      .eq("id", foto.id);

    if (error) {
      setError(error.message);
      return;
    }

    setFotos(fotos.filter((f) => f.id !== foto.id));
  };

  // Cambiar orden (intercambiar 2 fotos)
  const moverFoto = async (index: number, direccion: -1 | 1) => {
    const nuevoIndex = index + direccion;
    if (nuevoIndex < 0 || nuevoIndex >= fotos.length) return;

    const nuevasFotos = [...fotos];
    [nuevasFotos[index], nuevasFotos[nuevoIndex]] = [
      nuevasFotos[nuevoIndex],
      nuevasFotos[index],
    ];

    // Actualizar orden en la DB
    await Promise.all(
      nuevasFotos.map((f, i) =>
        supabase.from("perfil_fotos").update({ orden: i }).eq("id", f.id)
      )
    );

    setFotos(nuevasFotos);
  };

  if (cargando) {
    return (
      <div className="text-center py-6">
        <p className="text-xs text-texto-suave">Cargando fotos...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Grid de fotos */}
      {fotos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-4">
          {fotos.map((foto, i) => (
            <div
              key={foto.id}
              className="group relative aspect-square rounded-xl overflow-hidden bg-fondo border border-borde hover:border-marca/40 transition"
            >
              <button
                onClick={() => setFotoAbierta(foto)}
                className="w-full h-full"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={foto.url}
                  alt={`Foto ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </button>

              {/* Controles (solo editable) */}
              {editable && (
                <>
                  <button
                    onClick={() => borrarFoto(foto)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-error/80 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    title="Eliminar"
                  >
                    ✕
                  </button>

                  {i > 0 && (
                    <button
                      onClick={() => moverFoto(i, -1)}
                      className="absolute bottom-1 left-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      title="Mover izquierda"
                    >
                      ←
                    </button>
                  )}
                  {i < fotos.length - 1 && (
                    <button
                      onClick={() => moverFoto(i, 1)}
                      className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      title="Mover derecha"
                    >
                      →
                    </button>
                  )}
                </>
              )}
            </div>
          ))}

          {/* Botón añadir (solo editable y si no llegó al límite) */}
          {editable && fotos.length < maxFotos && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={subiendo}
              className="aspect-square rounded-xl border-2 border-dashed border-borde hover:border-marca/50 flex flex-col items-center justify-center gap-1 transition text-texto-suave hover:text-marca disabled:opacity-50"
            >
              <span className="text-2xl">{subiendo ? "⏳" : "+"}</span>
              <span className="text-xs">
                {subiendo ? "Subiendo..." : "Añadir"}
              </span>
            </button>
          )}
        </div>
      )}

      {/* Estado vacío (solo editable) */}
      {fotos.length === 0 && editable && (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={subiendo}
          className="w-full py-10 rounded-xl border-2 border-dashed border-borde hover:border-marca/50 flex flex-col items-center justify-center gap-2 transition text-texto-suave hover:text-marca disabled:opacity-50"
        >
          <span className="text-4xl">{subiendo ? "⏳" : "📸"}</span>
          <span className="text-sm font-semibold">
            {subiendo ? "Subiendo..." : "Añade tu primera foto"}
          </span>
          <span className="text-xs">Máximo {maxFotos} fotos</span>
        </button>
      )}

      {/* Estado vacío (no editable) */}
      {fotos.length === 0 && !editable && (
        <div className="text-center py-6">
          <p className="text-xs text-texto-suave">Sin fotos</p>
        </div>
      )}

      {/* Contador */}
      {fotos.length > 0 && (
        <p className="text-xs text-texto-suave text-center mb-3">
          {fotos.length} / {maxFotos} fotos
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="mt-2 p-2 rounded-lg bg-error/10 border border-error/30 text-error text-xs">
          {error}
        </div>
      )}

      {/* Input file oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={subirFoto}
        className="hidden"
      />

      {/* Modal visor */}
      {fotoAbierta && (
        <div
          onClick={() => setFotoAbierta(null)}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fotoAbierta.url}
            alt="Foto ampliada"
            className="max-w-full max-h-full object-contain rounded-xl"
          />
          <button
            onClick={() => setFotoAbierta(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white text-xl flex items-center justify-center hover:bg-white/20 transition"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}