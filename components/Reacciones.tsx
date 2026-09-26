"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

type TipoReaccion = "me_gusta" | "risa" | "triste" | "sorpresa";

const REACCIONES: {
  tipo: TipoReaccion;
  emoji: string;
  label: string;
  color: string;
}[] = [
  { tipo: "me_gusta", emoji: "❤️", label: "Me gusta", color: "text-rosa" },
  { tipo: "risa", emoji: "😂", label: "Risa", color: "text-neon" },
  { tipo: "triste", emoji: "😢", label: "Triste", color: "text-marca" },
  { tipo: "sorpresa", emoji: "😮", label: "Sorpresa", color: "text-exito" },
];

export default function Reacciones({ confesionId }: { confesionId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [reacciones, setReacciones] = useState<
    { tipo: TipoReaccion; user_id: string }[]
  >([]);
  const [miReaccion, setMiReaccion] = useState<TipoReaccion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [animando, setAnimando] = useState<TipoReaccion | null>(null);

  // Cargar usuario
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
  }, []);

  // Cargar reacciones
  const cargarReacciones = async () => {
    const { data } = await supabase
      .from("reacciones")
      .select("tipo, user_id")
      .eq("confesion_id", confesionId);

    if (data) {
      setReacciones(data as { tipo: TipoReaccion; user_id: string }[]);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const mi = data.find((r) => r.user_id === user.id);
        setMiReaccion((mi?.tipo as TipoReaccion) ?? null);
      }
    }
    setCargando(false);
  };

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase
        .from("reacciones")
        .select("tipo, user_id")
        .eq("confesion_id", confesionId);

      if (data) {
        setReacciones(data as { tipo: TipoReaccion; user_id: string }[]);
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const mi = data.find((r) => r.user_id === user.id);
          setMiReaccion((mi?.tipo as TipoReaccion) ?? null);
        }
      }
      setCargando(false);
    };

    void cargar();
  }, [confesionId]);

  const contar = (tipo: TipoReaccion) =>
    reacciones.filter((r) => r.tipo === tipo).length;

  const handleReaccionar = async (tipo: TipoReaccion) => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Animación
    setAnimando(tipo);
    setTimeout(() => setAnimando(null), 400);

    // Si ya tengo esa reacción → quitarla
    if (miReaccion === tipo) {
      await supabase
        .from("reacciones")
        .delete()
        .eq("confesion_id", confesionId)
        .eq("user_id", user.id);

      setMiReaccion(null);
    } else {
      // Insertar o actualizar
      await supabase.from("reacciones").upsert(
        {
          confesion_id: confesionId,
          user_id: user.id,
          tipo,
        },
        { onConflict: "confesion_id,user_id" }
      );

      setMiReaccion(tipo);
    }

    // Recargar reacciones
    await cargarReacciones();
    router.refresh();
  };

  return (
    <div className="bg-fondo-card border border-borde rounded-2xl p-4">
      <div className="flex flex-wrap items-center gap-2">
        {REACCIONES.map((r) => {
          const total = contar(r.tipo);
          const activo = miReaccion === r.tipo;
          const estaAnimando = animando === r.tipo;

          return (
            <button
              key={r.tipo}
              onClick={() => handleReaccionar(r.tipo)}
              disabled={cargando}
              title={!user ? "Inicia sesión para reaccionar" : r.label}
              className={`
                group flex items-center gap-2 px-4 py-2 rounded-xl
                border transition-all duration-300
                ${
                  activo
                    ? `bg-gradient-to-r from-marca/20 to-rosa/20 border-marca/50 ${r.color}`
                    : "bg-fondo border-borde text-texto-suave hover:border-marca/30 hover:bg-fondo-card-hover"
                }
                ${estaAnimando ? "scale-125" : "scale-100"}
                disabled:opacity-50
              `}
            >
              <span
                className={`
                  text-xl transition-transform duration-300
                  group-hover:scale-125
                  ${estaAnimando ? "animate-bounce" : ""}
                `}
              >
                {r.emoji}
              </span>
              <span className="text-sm font-semibold">{total}</span>
            </button>
          );
        })}

        {/* Aviso login */}
        {!user && !cargando && (
          <p className="text-xs text-texto-suave ml-auto">
            <Link href="/login" className="text-marca hover:text-rosa underline">
              Inicia sesión
            </Link>{" "}
            para reaccionar
          </p>
        )}
      </div>
    </div>
  );
}