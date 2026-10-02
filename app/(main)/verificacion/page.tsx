/* eslint-disable react-hooks/immutability */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import CamaraSelfie from "@/components/CamaraSelfie";
import SubirFotosPerfil from "@/components/SubirFotosPerfil";
import type { User } from "@supabase/supabase-js";

export default function VerificacionPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  // Datos
  const [nombreReal, setNombreReal] = useState("");
  const [apellidoReal, setApellidoReal] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [selfie, setSelfie] = useState<File | null>(null);
  const [cantidadFotos, setCantidadFotos] = useState(0);

  const [yaVerificado, setYaVerificado] = useState(false);
  const [estadoActual, setEstadoActual] = useState<string | null>(null);

  // Sesión
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        router.push("/login");
        return;
      }
      setUser(session.user);
      cargarEstado(session.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/login");
        return;
      }
      setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  // Cargar estado actual
  const cargarEstado = async (userId: string) => {
    const { data: perfil } = await supabase
      .from("profiles")
      .select("verificado, estado_verificacion, motivo_rechazo_verificacion")
      .eq("id", userId)
      .single();

    if (perfil) {
      if (perfil.verificado) {
        setYaVerificado(true);
      } else if (perfil.estado_verificacion) {
        setEstadoActual(perfil.estado_verificacion);
        if (perfil.motivo_rechazo_verificacion) {
          setError(perfil.motivo_rechazo_verificacion);
        }
      }
    }

    setCargando(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user) return;

    // Validaciones
    if (nombreReal.trim().length < 2) {
      return setError("El nombre debe tener al menos 2 caracteres");
    }

    if (apellidoReal.trim().length < 2) {
      return setError("El apellido debe tener al menos 2 caracteres");
    }

    if (!fechaNacimiento) {
      return setError("Debes indicar tu fecha de nacimiento");
    }

    // Verificar edad mínima (18 años)
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    const edad = hoy.getFullYear() - nacimiento.getFullYear();
    if (edad < 18) {
      return setError("Debes ser mayor de 18 años");
    }

    if (!selfie) {
      return setError("Debes tomar una selfie");
    }

    if (cantidadFotos < 3) {
      return setError("Debes subir al menos 3 fotos de perfil");
    }

    setEnviando(true);

    try {
      // 1. Subir selfie a bucket privado
      const selfieExtension = selfie.name.split(".").pop() || "jpg";
      const selfiePath = `${user.id}/selfie-${Date.now()}.${selfieExtension}`;

      const { error: uploadSelfieError } = await supabase.storage
        .from("verificaciones")
        .upload(selfiePath, selfie, { cacheControl: "3600" });

      if (uploadSelfieError) {
        throw new Error("Error al subir selfie: " + uploadSelfieError.message);
      }

      // 2. Crear registro en verificaciones
      const { error: insertError } = await supabase
        .from("verificaciones")
        .upsert(
          {
            user_id: user.id,
            nombre_completo: `${nombreReal.trim()} ${apellidoReal.trim()}`,
            fecha_nacimiento: fechaNacimiento,
            selfie_url: selfiePath, // guardamos el path, no la URL pública
            estado: "pendiente",
            motivo_rechazo: null,
            revisado_en: null,
            revisado_por: null,
          },
          { onConflict: "user_id" }
        );

      if (insertError) {
        throw new Error("Error al guardar: " + insertError.message);
      }

      // 3. Actualizar perfil
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          nombre_real: nombreReal.trim(),
          apellido_real: apellidoReal.trim(),
          fecha_nacimiento: fechaNacimiento,
          estado_verificacion: "pendiente",
          motivo_rechazo_verificacion: null,
        })
        .eq("id", user.id);

      if (updateError) {
        throw new Error("Error al actualizar perfil: " + updateError.message);
      }

      setExito(true);
      setEstadoActual("pendiente");
    } catch (err: unknown) {
      const mensaje =
        err instanceof Error ? err.message : "Error desconocido";
      setError(mensaje);
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-texto-suave">Cargando...</p>
      </main>
    );
  }

  // Ya verificado
  if (yaVerificado) {
    return (
      <main className="min-h-screen py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-fondo-card border border-borde rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-black gradient-animated mb-2">
              ¡Ya estás verificado!
            </h1>
            <p className="text-sm text-texto-suave mb-6">
              Tu cuenta está verificada y puedes usar todas las funciones
            </p>
            <Link
              href="/perfil"
              className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-marca to-rosa text-white font-semibold hover:opacity-90 transition"
            >
              Ir a mi perfil
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Pendiente
  if (estadoActual === "pendiente" && !exito) {
    return (
      <main className="min-h-screen py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-fondo-card border border-borde rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h1 className="text-2xl font-black gradient-animated mb-2">
              Verificación en revisión
            </h1>
            <p className="text-sm text-texto-suave mb-6">
              Estamos revisando tus datos. Te avisaremos pronto.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Éxito
  if (exito) {
    return (
      <main className="min-h-screen py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-fondo-card border border-borde rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-black gradient-animated mb-2">
              ¡Datos enviados!
            </h1>
            <p className="text-sm text-texto-suave mb-6">
              Estamos revisando tu información. Te avisaremos cuando esté lista.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-marca to-rosa text-white font-semibold hover:opacity-90 transition"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-10 px-6">
      <div className="max-w-2xl mx-auto space-y-6">

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-texto-suave hover:text-marca transition"
        >
          ← Volver al inicio
        </Link>

        <div>
          <h1 className="text-3xl md:text-4xl font-black gradient-animated">
            Verifica tu cuenta
          </h1>
          <p className="text-sm text-texto-suave mt-2">
            Necesitamos verificar tu identidad para mantener la seguridad
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-error/10 border border-error/30 text-error text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Paso 1: Datos personales */}
          <div className="bg-fondo-card border border-borde rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-texto flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-marca text-white text-sm flex items-center justify-center font-bold">
                1
              </span>
              Datos personales
            </h2>

            <div>
              <label className="block text-sm font-medium text-texto-suave mb-1.5">
                Nombre real *
              </label>
              <input
                type="text"
                value={nombreReal}
                onChange={(e) => setNombreReal(e.target.value)}
                required
                maxLength={50}
                placeholder="Ej: Cristian"
                className="w-full px-4 py-3 rounded-xl bg-fondo border border-borde text-texto placeholder-texto-suave/50 focus:border-marca focus:outline-none focus:ring-2 focus:ring-marca/20 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-texto-suave mb-1.5">
                Apellido real *
              </label>
              <input
                type="text"
                value={apellidoReal}
                onChange={(e) => setApellidoReal(e.target.value)}
                required
                maxLength={50}
                placeholder="Ej: Yzaguirre"
                className="w-full px-4 py-3 rounded-xl bg-fondo border border-borde text-texto placeholder-texto-suave/50 focus:border-marca focus:outline-none focus:ring-2 focus:ring-marca/20 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-texto-suave mb-1.5">
                Fecha de nacimiento *
              </label>
              <input
                type="date"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                required
                max={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-3 rounded-xl bg-fondo border border-borde text-texto focus:border-marca focus:outline-none focus:ring-2 focus:ring-marca/20 transition"
              />
              <p className="text-xs text-texto-suave mt-1">
                Debes ser mayor de 18 años
              </p>
            </div>
          </div>

          {/* Paso 2: Selfie */}
          <div className="bg-fondo-card border border-borde rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-texto flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-marca text-white text-sm flex items-center justify-center font-bold">
                2
              </span>
              Selfie en vivo
            </h2>

            <p className="text-xs text-texto-suave">
              Tómate una selfie con la cámara. <strong>No se permite subir fotos
              de la galería</strong>. Asegúrate de tener buena luz y tu rostro visible.
            </p>

            <CamaraSelfie onCaptura={setSelfie} />

            {selfie && (
              <div className="p-3 rounded-xl bg-exito/10 border border-exito/30 text-exito text-sm">
                ✅ Selfie capturada correctamente
              </div>
            )}
          </div>

          {/* Paso 3: Fotos de perfil */}
          <div className="bg-fondo-card border border-borde rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-texto flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-marca text-white text-sm flex items-center justify-center font-bold">
                3
              </span>
              Fotos de perfil
            </h2>

            <p className="text-xs text-texto-suave">
              Sube mínimo 3 fotos donde se te vea claramente. Estas fotos serán
              visibles en tu perfil público.
            </p>

            <SubirFotosPerfil
              minFotos={3}
              maxFotos={5}
              onCambio={setCantidadFotos}
            />
          </div>

          {/* Botón enviar */}
          <button
            type="submit"
            disabled={enviando}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-marca to-rosa text-white font-bold text-lg hover:from-marca-hover hover:to-rosa-hover transition-all disabled:opacity-50 shadow-lg shadow-marca/20"
          >
            {enviando ? "Enviando..." : "Enviar para verificación"}
          </button>

        </form>

        <div className="text-center text-xs text-texto-suave">
          Al enviar, aceptas nuestra{" "}
          <Link href="/privacidad" className="text-marca hover:underline">
            política de privacidad
          </Link>
        </div>
      </div>
    </main>
  );
}