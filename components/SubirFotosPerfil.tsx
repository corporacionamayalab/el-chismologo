/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

type Foto = {
  id: string;
  url: string;
  orden: number;
};

export default function SubirFotosPerfil({
  minFotos = 3,
  maxFotos = 5,
  onCambio,
}: {
  minFotos?: number;
  maxFotos?: number;
  onCambio?: (count: number) => void;
}) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sesión
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Cargar fotos existentes
  useEffect(() => {
    if (!user) {
      setCargando(false);
      return;
    }

    const cargar = async () => {
      const { data } = await supabase
        .from("perfil_fotos")
        .select("id, url, orden")
        .eq("user_id", user.id)
        .order("orden", { ascending: true });

      const fotosCargadas = (data ?? []) as Foto[];
      setFotos(fotosCargadas);
      onCambio?.(fotosCargadas.length);
      setCargando(false);
    };

    cargar();
  }, [user, supabase]);

  // Subir foto
  const subir = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

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
    const nombreArchivo = `${user.id}/${Date.now()}.${extension}`;

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

    const { data: nueva, error: insertError } = await supabase
      .from("perfil_fotos")
      .insert({
        user_id: user.id,
        url: urlData.publicUrl,
        orden: fotos.length,
      })
      .select()
      .single();

    setSubiendo(false);

    if (insertError) {
      setError(insertError.message);
      await supabase.storage.from("perfil-fotos").remove([nombreArchivo]);
      return;
    }

    const nuevasFotos = [...fotos, nueva as Foto];
    setFotos(nuevasFotos);
    onCambio?.(nuevasFotos.length);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Borrar foto
  const borrar = async (foto: Foto) => {
    if (!confirm("¿Eliminar esta foto?")) return;

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

    const nuevasFotos = fotos.filter((f) => f.id !== foto.id);
    setFotos(nuevasFotos);
    onCambio?.(nuevasFotos.length);
  };

  if (cargando) {
    return <p className="text-xs text-texto-suave">Cargando fotos...</p>;
  }

  if (!user) {
    return <p className="text-xs text-error">Debes iniciar sesión</p>;
  }

  const cumpleMinimo = fotos.length >= minFotos;

  return (
    <div className="space-y-4">
      {/* Estado */}
      <div
        className={`
          p-3 rounded-xl border text-sm flex items-center justify-between
          ${
            cumpleMinimo
              ? "bg-exito/10 border-exito/30 text-exito"
              : "bg-marca/10 border-marca/30 text-marca"
          }
        `}
      >
        <span>
          {cumpleMinimo
            ? "✅ Fotos suficientes"
            : `📸 Sube al menos ${minFotos} fotos`}
        </span>
        <span className="font-semibold">
          {fotos.length} / {minFotos}
        </span>
      </div>

      {/* Grid */}
      {fotos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {fotos.map((foto) => (
            <div
              key={foto.id}
              className="relative aspect-square rounded-xl overflow-hidden bg-fondo border border-borde group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={foto.url}
                alt="Foto"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => borrar(foto)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-error/90 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                title="Eliminar"
              >
                ✕
              </button>
            </div>
          ))}

          {fotos.length < maxFotos && (
            <button
              type="button"
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

      {/* Estado vacío */}
      {fotos.length === 0 && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={subiendo}
          className="w-full py-10 rounded-xl border-2 border-dashed border-borde hover:border-marca/50 flex flex-col items-center justify-center gap-2 transition text-texto-suave hover:text-marca disabled:opacity-50"
        >
          <span className="text-4xl">{subiendo ? "⏳" : "📸"}</span>
          <span className="text-sm font-semibold">
            {subiendo ? "Subiendo..." : "Sube tu primera foto"}
          </span>
          <span className="text-xs">
            Mínimo {minFotos}, máximo {maxFotos}
          </span>
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-sm">
          {error}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={subir}
        className="hidden"
      />
    </div>
  );
}