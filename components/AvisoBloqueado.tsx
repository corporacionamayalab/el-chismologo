"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AvisoBloqueado() {
  const supabase = createClient();
  const [bloqueado, setBloqueado] = useState(false);
  const [motivo, setMotivo] = useState<string | null>(null);
  const [yaDescargo, setYaDescargo] = useState(false);
  const [cerrado, setCerrado] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: perfil } = await supabase
        .from("profiles")
        .select("bloqueado, motivo_bloqueo")
        .eq("id", user.id)
        .single();

      if (perfil?.bloqueado) {
        setBloqueado(true);
        setMotivo(perfil.motivo_bloqueo);

        // Ver si ya envió descargo
        const { data: descargos } = await supabase
          .from("descargos")
          .select("id")
          .eq("user_id", user.id)
          .limit(1);

        if (descargos && descargos.length > 0) {
          setYaDescargo(true);
        }
      }
    };

    cargar();
  }, []);

  if (!bloqueado || cerrado) return null;

  return (
    <div className="bg-error/10 border-b-2 border-error/40 sticky top-[57px] z-40 backdrop-blur-lg">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-start gap-4">
          <div className="text-3xl flex-shrink-0">🚫</div>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-error text-sm">
              Tu cuenta está bloqueada
            </p>
            {motivo && (
              <p className="text-xs text-texto-suave mt-1">
                <strong className="text-texto">Motivo:</strong> {motivo}
              </p>
            )}
            <p className="text-xs text-texto-suave mt-1.5">
              Puedes ver el contenido pero no publicar, comentar ni chatear.
              {!yaDescargo
                ? " Si crees que fue un error, puedes enviar tu descargo."
                : " Ya enviaste tu descargo, espera la respuesta del equipo."}
            </p>

            {!yaDescargo && (
              <Link
                href="/descargo"
                className="inline-block mt-3 text-xs font-semibold px-4 py-2 rounded-lg bg-error hover:bg-error/80 text-white transition"
              >
                💬 Enviar descargo
              </Link>
            )}

            {yaDescargo && (
              <span className="inline-block mt-3 text-xs font-semibold px-3 py-1.5 rounded-lg bg-exito/20 text-exito border border-exito/30">
                ✅ Descargo enviado
              </span>
            )}
          </div>

          <button
            onClick={() => setCerrado(true)}
            className="w-8 h-8 rounded-lg hover:bg-error/20 text-error flex items-center justify-center flex-shrink-0 transition"
            aria-label="Cerrar aviso"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}