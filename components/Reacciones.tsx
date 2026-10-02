/* eslint-disable react-hooks/set-state-in-effect */
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
  { tipo: "risa", emoji: "😂", label: "Risa", color: "text-marca" },
  { tipo: "triste", emoji: "😢", label: "Triste", color: "text-marca" },
  { tipo: "sorpresa", emoji: "😮", label: "Sorpresa", color: "text-exito" },
];

export default function Reacciones({ confesionId }: { confesionId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [puedeInteractuar, setPuedeInteractuar] = useState(false);
  const [reacciones, setReacciones] = useState<
    { tipo: TipoReaccion; user_id: string }[]
  >([]);
  const [miReaccion, setMiReaccion] = useState<TipoReaccion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [animando, setAnimando] = useState<TipoReaccion | null>(null);

  // Sesión + verificación
  useEffect(() => {
    const verificar = async (u: User) => {
      const { data: perfil } = await supabase
        .from("profiles")
        .select("verificado, exento_verificacion")
        .eq("id", u.id)
        .single();

      setPuedeInteractuar(
        (perfil?.verificado ?? false) || (perfil?.exento_verificacion ?? false)
      );
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      setCargandoSesion(false);
      if (u) verificar(u);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      setCargandoSesion(false);
      if (u) await verificar(u);
      else setPuedeInteractuar(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Cargar reacciones
  const cargarReacciones = async () => {
    const { data } = await supabase
      .from("reacciones")
      .select("tipo, user_id")
      .eq("confesion_id", confesionId);

    if (data) {
      setReacciones(data as { tipo: TipoReaccion; user_id: string }[]);
      if (user) {
        const mi = data.find((r) => r.user_id === user.id);
        setMiReaccion((mi?.tipo as TipoReaccion) ?? null);
      } else {
        setMiReaccion(null);
      }
    }
    setCargando(false);
  };

  useEffect(() => {
    void cargarReacciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confesionId, user]);

  const contar = (tipo: TipoReaccion) =>
    reacciones.filter((r) => r.tipo === tipo).length;

  const handleReaccionar = async (tipo: TipoReaccion) => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!puedeInteractuar) {
      router.push("/verificacion");
      return;
    }

    setAnimando(tipo);
    setTimeout(() => setAnimando(null), 400);

    if (miReaccion === tipo) {
      await supabase
        .from("reacciones")
        .delete()
        .eq("confesion_id", confesionId)
        .eq("user_id", user.id);
      setMiReaccion(null);
    } else {
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
              disabled={cargando || cargandoSesion}
              title={
                !user
                  ? "Inicia sesión para reaccionar"
                  : !puedeInteractuar
                  ? "Verifica tu cuenta para reaccionar"
                  : r.label
              }
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

        {!cargandoSesion && !user && (
          <p className="text-xs text-texto-suave ml-auto">
            <Link href="/login" className="text-marca hover:text-rosa underline">
              Inicia sesión
            </Link>{" "}
            para reaccionar
          </p>
        )}

        {!cargandoSesion && user && !puedeInteractuar && (
          <p className="text-xs text-rosa ml-auto">
            <Link
              href="/verificacion"
              className="text-marca hover:text-rosa underline"
            >
              Verifica tu cuenta
            </Link>{" "}
            para reaccionar
          </p>
        )}
      </div>
    </div>
  );
}