"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  CIUDADES_PRINCIPALES,
  CIUDADES_SECUNDARIAS,
  CIUDADES_INTERNACIONALES,
} from "@/lib/ciudades";
import type { User } from "@supabase/supabase-js";

type Perfil = {
  id: string;
  username: string;
  avatar_url: string | null;
  ciudad: string | null;
};

type Relacion = {
  id: string;
  estado: string;
  solicitante_id: string;
  receptor_id: string;
};

export default function BuscarAmigosPage() {
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCiudad, setFiltroCiudad] = useState("");
  const [resultados, setResultados] = useState<Perfil[]>([]);
  const [relaciones, setRelaciones] = useState<Relacion[]>([]);
  const [cargando, setCargando] = useState(false);
  const [enviando, setEnviando] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user ?? null);

      if (user) {
        const { data } = await supabase
          .from("amistades")
          .select("id, estado, solicitante_id, receptor_id")
          .or(`solicitante_id.eq.${user.id},receptor_id.eq.${user.id}`);

        setRelaciones((data ?? []) as Relacion[]);
      }
    };

    init();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (busqueda.trim().length < 2 && !filtroCiudad) {
        setResultados([]);
        return;
      }

      setCargando(true);

      let query = supabase
        .from("profiles")
        .select("id, username, avatar_url, ciudad")
        .neq("id", user?.id ?? "")
        .limit(30);

      if (busqueda.trim().length >= 2) {
        query = query.ilike("username", `%${busqueda.trim()}%`);
      }

      if (filtroCiudad) {
        query = query.eq("ciudad", filtroCiudad);
      }

      const { data } = await query;

      setResultados((data ?? []) as Perfil[]);
      setCargando(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [busqueda, filtroCiudad, user]);

  const obtenerRelacion = (otroId: string) =>
    relaciones.find(
      (r) =>
        (r.solicitante_id === user?.id && r.receptor_id === otroId) ||
        (r.receptor_id === user?.id && r.solicitante_id === otroId)
    );

  const enviarSolicitud = async (receptorId: string) => {
    if (!user) return;

    setEnviando(receptorId);

    // 🔍 Verificar si ya existe
    const { data: existente } = await supabase
      .from("amistades")
      .select("id, estado, solicitante_id")
      .or(
        `and(solicitante_id.eq.${user.id},receptor_id.eq.${receptorId}),and(solicitante_id.eq.${receptorId},receptor_id.eq.${user.id})`
      )
      .maybeSingle();

    if (existente) {
      if (existente.estado === "pendiente" && existente.solicitante_id !== user.id) {
        // Aceptar automáticamente
        await supabase
          .from("amistades")
          .update({ estado: "aceptada" })
          .eq("id", existente.id);
      }
      setEnviando(null);
      return;
    }

    const { data, error } = await supabase
      .from("amistades")
      .insert({
        solicitante_id: user.id,
        receptor_id: receptorId,
      })
      .select()
      .single();

    setEnviando(null);

    if (error) {
      alert("Error: " + error.message);
      return;
    }

    setRelaciones([...relaciones, data as Relacion]);
  };

  return (
    <main className="min-h-screen py-10 px-6">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/amigos"
          className="inline-flex items-center gap-2 text-sm text-texto-suave hover:text-marca transition mb-8"
        >
          ← Volver a amigos
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black gradient-animated">
            Buscar personas
          </h1>
          <p className="text-sm text-texto-suave mt-2">
            Encuentra gente nueva 🔍
          </p>
        </div>

        {/* Buscador */}
        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-texto-suave">
            🔍
          </span>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Busca por nombre de usuario..."
            autoFocus
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-fondo-card border border-borde text-texto placeholder-texto-suave/50 focus:border-marca focus:outline-none focus:ring-2 focus:ring-marca/20 transition"
          />
        </div>

        {/* Filtro por ciudad */}
        <div className="mb-6">
          <select
            value={filtroCiudad}
            onChange={(e) => setFiltroCiudad(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-fondo-card border border-borde text-texto focus:border-marca focus:outline-none focus:ring-2 focus:ring-marca/20 transition"
          >
            <option value="">🌍 Todas las ciudades</option>
            <optgroup label="🔥 Principales">
              {CIUDADES_PRINCIPALES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </optgroup>
            <optgroup label="🟡 Otras ciudades">
              {CIUDADES_SECUNDARIAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </optgroup>
            <optgroup label="🌎 Internacional">
              {CIUDADES_INTERNACIONALES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Resultados */}
        {cargando && (
          <p className="text-center text-texto-suave text-sm py-4">
            Buscando...
          </p>
        )}

        {!cargando &&
          (busqueda.length >= 2 || filtroCiudad) &&
          resultados.length === 0 && (
            <div className="text-center py-16 bg-fondo-card border border-borde rounded-2xl">
              <div className="text-5xl mb-3">🔍</div>
              <p className="text-sm text-texto-suave">
                No se encontraron usuarios
              </p>
            </div>
          )}

        {busqueda.length < 2 && !filtroCiudad && (
          <div className="text-center py-16 bg-fondo-card border border-borde rounded-2xl">
            <div className="text-5xl mb-3">👥</div>
            <p className="text-sm text-texto-suave">
              Escribe al menos 2 letras o selecciona una ciudad
            </p>
          </div>
        )}

        <div className="grid gap-3">
          {resultados.map((p) => {
            const inicial = (p.username?.[0] ?? "?").toUpperCase();
            const relacion = obtenerRelacion(p.id);
            const estado = relacion?.estado;

            return (
              <div
                key={p.id}
                className="bg-fondo-card border border-borde rounded-2xl p-4 flex items-center gap-3 hover:border-marca/30 transition"
              >
                {p.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.avatar_url}
                    alt={p.username}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-marca to-rosa flex items-center justify-center text-white font-black flex-shrink-0">
                    {inicial}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-texto truncate">
                    @{p.username}
                  </p>
                  {p.ciudad && (
                    <p className="text-xs text-texto-suave truncate">
                      📍 {p.ciudad}
                    </p>
                  )}
                </div>

                {!estado && (
                  <button
                    onClick={() => enviarSolicitud(p.id)}
                    disabled={enviando === p.id}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-marca to-rosa text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 whitespace-nowrap"
                  >
                    {enviando === p.id ? "..." : "+ Agregar"}
                  </button>
                )}

                {estado === "pendiente" && relacion && (
                  <span className="text-xs px-3 py-1.5 rounded-xl bg-marca/10 border border-marca/30 text-marca whitespace-nowrap">
                    {relacion.solicitante_id === user?.id
                      ? "⏳ Enviada"
                      : "🔔 Te envió"}
                  </span>
                )}

                {estado === "aceptada" && (
                  <span className="text-xs px-3 py-1.5 rounded-xl bg-exito/10 border border-exito/30 text-exito whitespace-nowrap">
                    ✅ Amigos
                  </span>
                )}

                {estado === "rechazada" && (
                  <span className="text-xs px-3 py-1.5 rounded-xl bg-error/10 border border-error/30 text-error whitespace-nowrap">
                    ❌ Rechazada
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}