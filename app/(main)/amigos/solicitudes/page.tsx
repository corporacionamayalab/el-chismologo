"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

type Solicitud = {
  id: string;
  solicitante_id: string;
  receptor_id: string;
  creado_en: string;
  solicitante: { id: string; username: string; avatar_url: string | null } | null;
  receptor: { id: string; username: string; avatar_url: string | null } | null;
};

export default function SolicitudesPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [recibidas, setRecibidas] = useState<Solicitud[]>([]);
  const [enviadas, setEnviadas] = useState<Solicitud[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState<string | null>(null);

  const cargar = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUser(user);

    const { data: rec } = await supabase
      .from("amistades")
      .select(
        `
        id, solicitante_id, receptor_id, creado_en,
        solicitante:profiles!amistades_solicitante_id_fkey ( id, username, avatar_url ),
        receptor:profiles!amistades_receptor_id_fkey ( id, username, avatar_url )
      `
      )
      .eq("receptor_id", user.id)
      .eq("estado", "pendiente")
      .order("creado_en", { ascending: false });

    const { data: env } = await supabase
      .from("amistades")
      .select(
        `
        id, solicitante_id, receptor_id, creado_en,
        solicitante:profiles!amistades_solicitante_id_fkey ( id, username, avatar_url ),
        receptor:profiles!amistades_receptor_id_fkey ( id, username, avatar_url )
      `
      )
      .eq("solicitante_id", user.id)
      .eq("estado", "pendiente")
      .order("creado_en", { ascending: false });

    setRecibidas(
      (rec ?? []).map((solicitud) => ({
        ...solicitud,
        solicitante: solicitud.solicitante[0] ?? null,
        receptor: solicitud.receptor[0] ?? null,
      })) as Solicitud[]
    );
    setEnviadas(
      (env ?? []).map((solicitud) => ({
        ...solicitud,
        solicitante: solicitud.solicitante[0] ?? null,
        receptor: solicitud.receptor[0] ?? null,
      })) as Solicitud[]
    );
    setCargando(false);
  };

  useEffect(() => {
    void Promise.resolve().then(cargar);
  }, []);

  const aceptar = async (id: string) => {
    setProcesando(id);
    await supabase
      .from("amistades")
      .update({ estado: "aceptada" })
      .eq("id", id);
    setProcesando(null);
    await cargar();
    router.refresh();
  };

  const rechazar = async (id: string) => {
    setProcesando(id);
    await supabase
      .from("amistades")
      .update({ estado: "rechazada" })
      .eq("id", id);
    setProcesando(null);
    await cargar();
    router.refresh();
  };

  const cancelar = async (id: string) => {
    setProcesando(id);
    await supabase.from("amistades").delete().eq("id", id);
    setProcesando(null);
    await cargar();
    router.refresh();
  };

  const getPerfil = (s: Solicitud) => {
    const sol = Array.isArray(s.solicitante) ? s.solicitante[0] : s.solicitante;
    const rec = Array.isArray(s.receptor) ? s.receptor[0] : s.receptor;
    return {
      solicitante: sol,
      receptor: rec,
    };
  };

  if (cargando) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-texto-suave">Cargando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-10 px-6">
      <div className="max-w-2xl mx-auto">

        <Link
          href="/amigos"
          className="inline-flex items-center gap-2 text-sm text-texto-suave hover:text-neon transition mb-8"
        >
          ← Volver a amigos
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-marca to-rosa bg-clip-text text-transparent">
            Solicitudes
          </h1>
          <p className="text-sm text-texto-suave mt-2">
            Gestiona tus invitaciones de amistad
          </p>
        </div>

        {/* Recibidas */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-texto mb-4 flex items-center gap-2">
            🔔 Recibidas ({recibidas.length})
          </h2>

          {recibidas.length === 0 ? (
            <div className="bg-fondo-card border border-borde rounded-2xl p-6 text-center">
              <p className="text-sm text-texto-suave">
                No tienes solicitudes pendientes
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recibidas.map((s) => {
                const { solicitante } = getPerfil(s);
                if (!solicitante) return null;
                const inicial = (solicitante.username?.[0] ?? "?").toUpperCase();

                return (
                  <div
                    key={s.id}
                    className="bg-fondo-card border border-borde rounded-2xl p-4 flex items-center gap-3"
                  >
                    {solicitante.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={solicitante.avatar_url}
                        alt={solicitante.username}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-marca to-rosa flex items-center justify-center text-white font-black flex-shrink-0">
                        {inicial}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-texto truncate">
                        @{solicitante.username}
                      </p>
                      <p className="text-xs text-texto-suave">
                        Quiere ser tu amigo
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => aceptar(s.id)}
                        disabled={procesando === s.id}
                        className="px-3 py-1.5 rounded-lg bg-exito hover:bg-exito/80 text-white text-xs font-semibold transition disabled:opacity-50"
                      >
                        ✅ Aceptar
                      </button>
                      <button
                        onClick={() => rechazar(s.id)}
                        disabled={procesando === s.id}
                        className="px-3 py-1.5 rounded-lg border border-error/30 text-error hover:bg-error/10 text-xs font-semibold transition disabled:opacity-50"
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Enviadas */}
        <section>
          <h2 className="text-lg font-bold text-texto-suave mb-4 flex items-center gap-2">
            📤 Enviadas ({enviadas.length})
          </h2>

          {enviadas.length === 0 ? (
            <div className="bg-fondo-card border border-borde rounded-2xl p-6 text-center">
              <p className="text-sm text-texto-suave">
                No has enviado solicitudes
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {enviadas.map((s) => {
                const { receptor } = getPerfil(s);
                if (!receptor) return null;
                const inicial = (receptor.username?.[0] ?? "?").toUpperCase();

                return (
                  <div
                    key={s.id}
                    className="bg-fondo-card border border-borde rounded-2xl p-4 flex items-center gap-3 opacity-70"
                  >
                    {receptor.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={receptor.avatar_url}
                        alt={receptor.username}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-fondo border border-borde flex items-center justify-center text-texto-suave font-bold flex-shrink-0">
                        {inicial}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-texto truncate">
                        @{receptor.username}
                      </p>
                      <p className="text-xs text-neon">⏳ Pendiente</p>
                    </div>

                    <button
                      onClick={() => cancelar(s.id)}
                      disabled={procesando === s.id}
                      className="px-3 py-1.5 rounded-lg border border-borde text-texto-suave hover:text-error hover:border-error/30 text-xs transition disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}