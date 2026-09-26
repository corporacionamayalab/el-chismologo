"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NuevoContactoPage() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    edad: "",
    ciudad: "",
    genero: "",
    busca: "",
    whatsapp: "",
  });

  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const update = (campo: string, valor: string) => {
    setForm({ ...form, [campo]: valor });
  };

  const handleImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede pesar más de 5MB");
      return;
    }

    setImagen(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.titulo.trim().length < 5) {
      return setError("El título debe tener al menos 5 caracteres");
    }
    if (form.descripcion.trim().length < 20) {
      return setError("La descripción debe tener al menos 20 caracteres");
    }
    if (form.edad && (parseInt(form.edad) < 18 || parseInt(form.edad) > 99)) {
      return setError("La edad debe estar entre 18 y 99");
    }

    setCargando(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCargando(false);
      router.push("/login");
      return;
    }

    let imagen_url: string | null = null;

    if (imagen) {
      const extension = imagen.name.split(".").pop();
      const nombreArchivo = `${user.id}/${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("contactos")
        .upload(nombreArchivo, imagen, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        setCargando(false);
        setError("Error al subir imagen: " + uploadError.message);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("contactos")
        .getPublicUrl(nombreArchivo);

      imagen_url = urlData.publicUrl;
    }

    const { error: insertError } = await supabase.from("contactos").insert({
      user_id: user.id,
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      edad: form.edad ? parseInt(form.edad) : null,
      ciudad: form.ciudad.trim() || null,
      genero: form.genero || null,
      busca: form.busca || null,
      whatsapp: form.whatsapp.trim() || null,
      imagen_url,
      estado: "pendiente",
    });

    setCargando(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push("/contactos/gracias");
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-fondo border border-borde text-texto placeholder-texto-suave/50 focus:border-rosa focus:outline-none focus:ring-2 focus:ring-rosa/20 transition";

  return (
    <main className="min-h-screen py-12 px-6">
      <div className="max-w-2xl mx-auto">

        <Link
          href="/contactos"
          className="inline-flex items-center gap-2 text-sm text-texto-suave hover:text-rosa transition mb-8"
        >
          ← Volver a contactos
        </Link>

        <div className="bg-fondo-card border border-borde rounded-2xl p-8 shadow-2xl shadow-rosa/10">

          <div className="text-center mb-8">
            <div className="text-5xl mb-4">💘</div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-rosa to-marca bg-clip-text text-transparent">
              Publica tu anuncio
            </h1>
            <p className="text-sm text-texto-suave mt-2">
              Encuentra a alguien especial 🔍
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-texto-suave mb-1.5">
                Título <span className="text-rosa">*</span>
              </label>
              <input
                type="text"
                value={form.titulo}
                onChange={(e) => update("titulo", e.target.value)}
                required
                maxLength={120}
                placeholder="Ej: Busco amistad en Lima 😊"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-texto-suave mb-1.5">
                Descripción <span className="text-rosa">*</span>
              </label>
              <textarea
                value={form.descripcion}
                onChange={(e) => update("descripcion", e.target.value)}
                required
                rows={5}
                maxLength={1000}
                placeholder="Cuéntanos sobre ti y qué buscas..."
                className={`${inputClass} resize-none`}
              />
              <p className="text-xs text-texto-suave mt-1 text-right">
                {form.descripcion.length}/1000
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-texto-suave mb-1.5">
                  Edad
                </label>
                <input
                  type="number"
                  value={form.edad}
                  onChange={(e) => update("edad", e.target.value)}
                  min={18}
                  max={99}
                  placeholder="Ej: 25"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-texto-suave mb-1.5">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={form.ciudad}
                  onChange={(e) => update("ciudad", e.target.value)}
                  maxLength={60}
                  placeholder="Ej: Lima"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-texto-suave mb-1.5">
                  Soy
                </label>
                <select
                  value={form.genero}
                  onChange={(e) => update("genero", e.target.value)}
                  className={inputClass}
                >
                  <option value="">Selecciona</option>
                  <option value="Hombre">Hombre</option>
                  <option value="Mujer">Mujer</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-texto-suave mb-1.5">
                  Busco
                </label>
                <select
                  value={form.busca}
                  onChange={(e) => update("busca", e.target.value)}
                  className={inputClass}
                >
                  <option value="">Selecciona</option>
                  <option value="Amistad">Amistad</option>
                  <option value="Pareja">Pareja</option>
                  <option value="Algo casual">Algo casual</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-texto-suave mb-1.5">
                WhatsApp
              </label>
              <input
                type="tel"
                value={form.whatsapp}
                onChange={(e) => update("whatsapp", e.target.value)}
                maxLength={20}
                placeholder="Ej: +51999888777"
                className={inputClass}
              />
              <p className="text-xs text-texto-suave mt-1">
                Se mostrará un botón para que te contacten
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-texto-suave mb-1.5">
                Foto (opcional)
              </label>
              <div className="flex items-center gap-4">
                {preview ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-20 h-20 rounded-xl object-cover border-2 border-rosa/30"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagen(null);
                        setPreview(null);
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-error text-white text-xs flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-borde hover:border-rosa/50 flex items-center justify-center cursor-pointer transition">
                    <span className="text-2xl text-texto-suave">📷</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImagen}
                      className="hidden"
                    />
                  </label>
                )}
                <div className="text-xs text-texto-suave">
                  <p>Sube una foto (máx 5MB)</p>
                  <p>No se permiten fotos con contenido sexual 🚫</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neon/5 border border-neon/20">
              <p className="text-xs text-texto-suave leading-relaxed">
                🔒 Tu anuncio pasará por revisión antes de ser publicado.
                Esto suele tardar unos minutos.
              </p>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-rosa to-marca hover:from-rosa-hover hover:to-marca-hover transition-all duration-300 shadow-lg shadow-rosa/30 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {cargando ? "Publicando..." : "Publicar anuncio 💘"}
            </button>

          </form>

        </div>

      </div>
    </main>
  );
}