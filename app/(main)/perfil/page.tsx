"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

type Perfil = {
  username: string;
  avatar_url: string | null;
  rol: string;
  creado_en: string;
  bio: string | null;
  intereses: string[] | null;
  ciudad: string | null;
  fecha_nacimiento: string | null;
  genero: string | null;
};

export default function PerfilPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Nuevos estados
  const [bio, setBio] = useState("");
  const [intereses, setIntereses] = useState<string[]>([]);
  const [nuevoInteres, setNuevoInteres] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [genero, setGenero] = useState("");

  const [stats, setStats] = useState({
    confesiones: 0,
    anuncios: 0,
  });

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardandoInfo, setGuardandoInfo] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [mensaje, setMensaje] = useState<{
    tipo: "ok" | "error";
    texto: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar datos
  useEffect(() => {
    const cargar = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);

      const { data: p } = await supabase
        .from("profiles")
        .select(
          "username, avatar_url, rol, creado_en, bio, intereses, ciudad, fecha_nacimiento, genero"
        )
        .eq("id", user.id)
        .single();

      if (p) {
        setPerfil(p as Perfil);
        setUsername(p.username ?? "");
        setAvatarUrl(p.avatar_url);
        setBio(p.bio ?? "");
        setIntereses(p.intereses ?? []);
        setCiudad(p.ciudad ?? "");
        setFechaNacimiento(p.fecha_nacimiento ?? "");
        setGenero(p.genero ?? "");
      }

      // Estadísticas
      const { count: confCount } = await supabase
        .from("confesiones")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      const { count: contCount } = await supabase
        .from("contactos")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      setStats({
        confesiones: confCount ?? 0,
        anuncios: contCount ?? 0,
      });

      setCargando(false);
    };

    cargar();
  }, []);

  const handleGuardarUsername = async () => {
    setMensaje(null);

    if (!user) return;

    const limpio = username.trim();

    if (limpio.length < 3) {
      setMensaje({ tipo: "error", texto: "Mínimo 3 caracteres" });
      return;
    }

    if (limpio.length > 30) {
      setMensaje({ tipo: "error", texto: "Máximo 30 caracteres" });
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(limpio)) {
      setMensaje({
        tipo: "error",
        texto: "Solo letras, números y guión bajo",
      });
      return;
    }

    setGuardando(true);

    const { error } = await supabase
      .from("profiles")
      .update({ username: limpio })
      .eq("id", user.id);

    setGuardando(false);

    if (error) {
      if (error.message.includes("duplicate")) {
        setMensaje({ tipo: "error", texto: "Ese nombre ya está en uso" });
      } else {
        setMensaje({ tipo: "error", texto: error.message });
      }
      return;
    }

    setMensaje({ tipo: "ok", texto: "¡Usuario actualizado! ✅" });
    router.refresh();
  };

  // Guardar info extra
  const handleGuardarInfo = async () => {
    if (!user) return;
    setMensaje(null);
    setGuardandoInfo(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        bio: bio.trim() || null,
        intereses: intereses.length > 0 ? intereses : null,
        ciudad: ciudad || null,
        fecha_nacimiento: fechaNacimiento || null,
        genero: genero || null,
      })
      .eq("id", user.id);

    setGuardandoInfo(false);

    if (error) {
      setMensaje({ tipo: "error", texto: error.message });
      return;
    }

    setMensaje({ tipo: "ok", texto: "¡Perfil actualizado! ✅" });
    router.refresh();
  };

  const agregarInteres = () => {
    const limpio = nuevoInteres.trim();
    if (!limpio) return;
    if (intereses.includes(limpio)) {
      setNuevoInteres("");
      return;
    }
    if (intereses.length >= 10) {
      setMensaje({ tipo: "error", texto: "Máximo 10 intereses" });
      return;
    }
    setIntereses([...intereses, limpio]);
    setNuevoInteres("");
  };

  const quitarInteres = (i: string) => {
    setIntereses(intereses.filter((x) => x !== i));
  };

  const handleSubirAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      setMensaje({ tipo: "error", texto: "La imagen no puede pesar más de 2MB" });
      return;
    }

    setSubiendoFoto(true);
    setMensaje(null);

    const extension = file.name.split(".").pop();
    const nombreArchivo = `${user.id}/${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("avatares")
      .upload(nombreArchivo, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      setSubiendoFoto(false);
      setMensaje({ tipo: "error", texto: "Error al subir: " + uploadError.message });
      return;
    }

    const { data: urlData } = supabase.storage
      .from("avatares")
      .getPublicUrl(nombreArchivo);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: urlData.publicUrl })
      .eq("id", user.id);

    setSubiendoFoto(false);

    if (updateError) {
      setMensaje({ tipo: "error", texto: updateError.message });
      return;
    }

    setAvatarUrl(urlData.publicUrl);
    setMensaje({ tipo: "ok", texto: "¡Foto actualizada! ✅" });
    router.refresh();
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (cargando) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-texto-suave">Cargando...</p>
      </main>
    );
  }

  if (!user || !perfil) return null;

  const inicial = (perfil.username?.[0] ?? "?").toUpperCase();
  const fechaRegistro = new Date(perfil.creado_en).toLocaleDateString(
    "es-ES",
    { day: "numeric", month: "long", year: "numeric" }
  );

  return (
    <main className="min-h-screen py-10 px-6">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-black gradient-animated">
            Mi perfil
          </h1>
          <p className="text-sm text-texto-suave mt-2">
            Aquí controlas tu información
          </p>
        </div>

        {/* Mensaje */}
        {mensaje && (
          <div
            className={`
              p-3 rounded-xl text-sm border
              ${
                mensaje.tipo === "ok"
                  ? "bg-exito/10 border-exito/30 text-exito"
                  : "bg-error/10 border-error/30 text-error"
              }
            `}
          >
            {mensaje.texto}
          </div>
        )}

        {/* Card: Avatar */}
        <div className="bg-fondo-card border border-borde rounded-2xl p-6">
          <div className="flex items-center gap-5">

            {/* Avatar */}
            <div className="relative">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={perfil.username}
                  className="w-20 h-20 rounded-full object-cover border-2 border-marca/30"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-marca to-rosa flex items-center justify-center text-white text-3xl font-black">
                  {inicial}
                </div>
              )}

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={subiendoFoto}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-marca text-white text-xs flex items-center justify-center hover:bg-marca-hover transition shadow-lg"
                title="Cambiar foto"
              >
                {subiendoFoto ? "..." : "📷"}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleSubirAvatar}
                className="hidden"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xl font-bold text-texto truncate">
                @{perfil.username}
              </p>
              <p className="text-xs text-texto-suave truncate">
                {user.email}
              </p>
              <p className="text-xs text-texto-suave mt-1">
                📅 Desde {fechaRegistro}
              </p>
              {perfil.rol === "admin" && (
                <span className="inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-marca/20 text-marca border border-marca/30">
                  🎛️ ymix34
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card: Cambiar username */}
        <div className="bg-fondo-card border border-borde rounded-2xl p-6">
          <h2 className="text-lg font-bold text-texto mb-4">
            ✏️ Nombre de usuario
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={30}
              className="flex-1 px-4 py-3 rounded-xl bg-fondo border border-borde text-texto focus:border-marca focus:outline-none focus:ring-2 focus:ring-marca/20 transition"
            />
            <button
              onClick={handleGuardarUsername}
              disabled={guardando || username === perfil.username}
              className="px-5 py-3 rounded-xl bg-marca hover:bg-marca-hover text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {guardando ? "..." : "Guardar"}
            </button>
          </div>

          <p className="text-xs text-texto-suave mt-2">
            Solo letras, números y guión bajo. Mínimo 3 caracteres.
          </p>
        </div>

        {/* Card: Sobre mí */}
        <div className="bg-fondo-card border border-borde rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-bold text-texto">
            ✨ Sobre mí
          </h2>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-texto-suave mb-1.5">
              Bio (máx 160 caracteres)
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
              rows={3}
              placeholder="Cuéntanos algo sobre ti..."
              className="w-full px-4 py-3 rounded-xl bg-fondo border border-borde text-texto placeholder-texto-suave/50 focus:border-marca focus:outline-none focus:ring-2 focus:ring-marca/20 transition resize-none"
            />
            <p className="text-xs text-texto-suave mt-1 text-right">
              {bio.length}/160
            </p>
          </div>

          {/* Intereses */}
          <div>
            <label className="block text-sm font-medium text-texto-suave mb-1.5">
              Intereses (máx 10)
            </label>

            {intereses.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {intereses.map((i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-marca/10 border border-marca/30 text-marca text-sm"
                  >
                    {i}
                    <button
                      type="button"
                      onClick={() => quitarInteres(i)}
                      className="text-marca/70 hover:text-error transition"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}

            {intereses.length < 10 && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nuevoInteres}
                  onChange={(e) => setNuevoInteres(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      agregarInteres();
                    }
                  }}
                  maxLength={20}
                  placeholder="Ej: Música, viajes, deportes..."
                  className="flex-1 px-4 py-2 rounded-xl bg-fondo border border-borde text-texto placeholder-texto-suave/50 focus:border-marca focus:outline-none focus:ring-2 focus:ring-marca/20 transition text-sm"
                />
                <button
                  type="button"
                  onClick={agregarInteres}
                  disabled={!nuevoInteres.trim()}
                  className="px-4 py-2 rounded-xl bg-marca hover:bg-marca-hover text-white text-sm font-semibold transition disabled:opacity-50"
                >
                  + Añadir
                </button>
              </div>
            )}
          </div>

          {/* Ciudad + Género */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-texto-suave mb-1.5">
                📍 Ciudad
              </label>
              <select
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-fondo border border-borde text-texto focus:border-marca focus:outline-none focus:ring-2 focus:ring-marca/20 transition"
              >
                <option value="">Sin especificar</option>
                <option value="Trujillo">Trujillo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-texto-suave mb-1.5">
                👤 Género
              </label>
              <select
                value={genero}
                onChange={(e) => setGenero(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-fondo border border-borde text-texto focus:border-marca focus:outline-none focus:ring-2 focus:ring-marca/20 transition"
              >
                <option value="">Sin especificar</option>
                <option value="Hombre">Hombre</option>
                <option value="Mujer">Mujer</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          {/* Fecha nacimiento */}
          <div>
            <label className="block text-sm font-medium text-texto-suave mb-1.5">
              🎂 Fecha de nacimiento
            </label>
            <input
              type="date"
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-fondo border border-borde text-texto focus:border-marca focus:outline-none focus:ring-2 focus:ring-marca/20 transition"
            />
          </div>

          {/* Botón guardar */}
          <button
            onClick={handleGuardarInfo}
            disabled={guardandoInfo}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-marca to-rosa text-white font-semibold hover:from-marca-hover hover:to-rosa-hover transition-all disabled:opacity-50"
          >
            {guardandoInfo ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>

        {/* Card: Estadísticas */}
        <div className="bg-fondo-card border border-borde rounded-2xl p-6">
          <h2 className="text-lg font-bold text-texto mb-4">
            📊 Mis estadísticas
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/mis-confesiones"
              className="bg-fondo rounded-xl p-4 border border-borde hover:border-marca/50 transition"
            >
              <p className="text-3xl font-black text-marca">
                {stats.confesiones}
              </p>
              <p className="text-xs text-texto-suave mt-1">
                📝 Confesiones
              </p>
            </Link>

            <Link
              href="/mis-anuncios"
              className="bg-fondo rounded-xl p-4 border border-borde hover:border-rosa/50 transition"
            >
              <p className="text-3xl font-black text-rosa">
                {stats.anuncios}
              </p>
              <p className="text-xs text-texto-suave mt-1">
                💘 Anuncios
              </p>
            </Link>
          </div>
        </div>

        {/* Card: Acciones */}
        <div className="bg-fondo-card border border-borde rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-bold text-texto mb-2">
            ⚙️ Acciones
          </h2>

          <Link
            href="/mis-confesiones"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-fondo-card-hover transition text-sm text-texto-suave hover:text-texto"
          >
            <span>📝</span> Ver mis confesiones
          </Link>

          <Link
            href="/mis-anuncios"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-fondo-card-hover transition text-sm text-texto-suave hover:text-texto"
          >
            <span>💘</span> Ver mis anuncios
          </Link>

          <button
            onClick={cerrarSesion}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-error/10 transition text-sm text-error text-left"
          >
            <span>🚪</span> Cerrar sesión
          </button>
        </div>

      </div>
    </main>
  );
}