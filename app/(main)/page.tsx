import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export default function Home() {
  return (
    <main className="min-h-screen">

      {/* 🌟 HERO */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 overflow-hidden">

        {/* Glow de fondo */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-125 h-125 bg-marca/20 rounded-full blur-3xl -z-10" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-75 bg-rosa/20 rounded-full blur-3xl -z-10" />

        

        {/* Título */}
        <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none">
          <span className="gradient-animated">Chismólogo</span>
        </h1>

        

        

        {/* Botones */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          <Link
            href="/confesiones"
            className="group px-8 py-3.5 rounded-xl bg-marca hover:bg-marca-hover text-white font-semibold transition-all duration-300 glow-marca flex items-center gap-2 justify-center"
          >
            <span className="text-lg group-hover:scale-125 transition-transform">📝</span>
            Confesiones
          </Link>
          <Link
            href="/contactos"
            className="group px-8 py-3.5 rounded-xl bg-rosa hover:bg-rosa-hover text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-rosa/40 hover:-translate-y-0.5 flex items-center gap-2 justify-center"
          >
            <span className="text-lg group-hover:scale-125 transition-transform">💘</span>
            Contactos
          </Link>
          <Link
            href="/amigos"
            className="group px-8 py-3.5 rounded-xl border-2 border-neon text-neon hover:bg-neon hover:text-fondo font-semibold transition-all duration-300 flex items-center gap-2 justify-center"
          >
            <span className="text-lg group-hover:scale-125 transition-transform">👥</span>
            Amigos
          </Link>
        </div>
      </section>

      {/* 🃏 TARJETAS DE SECCIONES */}
      <section className="max-w-6xl mx-auto px-6 pb-20 grid gap-6 md:grid-cols-3">

        {/* Confesiones */}
        <Link
          href="/confesiones"
          className="group bg-fondo-card border border-borde rounded-2xl p-6 hover:border-marca/50 hover:bg-fondo-card-hover transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-marca/10 rounded-full blur-2xl group-hover:bg-marca/20 transition-all" />
          <div className="relative">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform inline-block">📝</div>
            <h2 className="text-xl font-bold text-marca">Confesiones</h2>
            <p className="mt-2 text-sm text-texto-suave leading-relaxed">
              Publica lo que piensas de forma anónima o con tu nombre.
              Comenta y reacciona.
            </p>
            <span className="inline-block mt-4 text-xs text-marca group-hover:translate-x-1 transition-transform">
              Explorar →
            </span>
          </div>
        </Link>

        {/* Contactos */}
        <Link
          href="/contactos"
          className="group bg-fondo-card border border-borde rounded-2xl p-6 hover:border-rosa/50 hover:bg-fondo-card-hover transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-rosa/10 rounded-full blur-2xl group-hover:bg-rosa/20 transition-all" />
          <div className="relative">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform inline-block">💘</div>
            <h2 className="text-xl font-bold text-rosa">Contactos</h2>
            <p className="mt-2 text-sm text-texto-suave leading-relaxed">
              Publica tu anuncio para encontrar pareja o amistad.
            </p>
            <span className="inline-block mt-4 text-xs text-rosa group-hover:translate-x-1 transition-transform">
              Explorar →
            </span>
          </div>
        </Link>

        {/* Amigos */}
        <Link
          href="/amigos"
          className="group bg-fondo-card border border-borde rounded-2xl p-6 hover:border-neon/50 hover:bg-fondo-card-hover transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-neon/10 rounded-full blur-2xl group-hover:bg-neon/20 transition-all" />
          <div className="relative">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform inline-block">👥</div>
            <h2 className="text-xl font-bold text-neon">Amigos</h2>
            <p className="mt-2 text-sm text-texto-suave leading-relaxed">
              Envía solicitudes, chatea en tiempo real y conoce gente
              nueva de forma segura.
            </p>
            <span className="inline-block mt-4 text-xs text-neon group-hover:translate-x-1 transition-transform">
              Explorar →
            </span>
          </div>
        </Link>
      </section>

      {/* 🔒 AVISO */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="bg-fondo-card border border-borde rounded-2xl px-6 py-5 flex items-start gap-4">
          <span className="text-2xl">🔒</span>
          <div>
            <p className="text-sm font-semibold text-texto">
              Contenido revisado
            </p>
            <p className="text-xs text-texto-suave mt-1 leading-relaxed">
              Todas las publicaciones pasan por revisión antes de ser publicadas.
              Ayúdanos a mantener un espacio seguro.
            </p>
          </div>
        </div>
      </section>

    </main>
  );
}