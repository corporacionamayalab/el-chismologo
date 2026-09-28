"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import CampanitaNotificaciones from "./CampanitaNotificaciones";
import BotonTema from "./BotonTema";
import type { User } from "@supabase/supabase-js";

export default function Header() {
  const router = useRouter();
  const supabase = createClient();

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [menuUsuario, setMenuUsuario] = useState(false);
  const [scrolleado, setScrolleado] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string>("");
  const [cargando, setCargando] = useState(true);

  const menuUsuarioRef = useRef<HTMLDivElement>(null);

  // Detectar scroll
  useEffect(() => {
    const onScroll = () => setScrolleado(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickFuera = (e: MouseEvent) => {
      if (
        menuUsuarioRef.current &&
        !menuUsuarioRef.current.contains(e.target as Node)
      ) {
        setMenuUsuario(false);
      }
    };
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  // Cargar usuario
  useEffect(() => {
    const cargarUsuario = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);

      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", data.user.id)
          .single();
        setUsername(
          profile?.username ?? data.user.email?.split("@")[0] ?? "usuario"
        );
      }
      setCargando(false);
    };

    cargarUsuario();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from("profiles")
          .select("username")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => {
            setUsername(
              data?.username ?? session.user.email?.split("@")[0] ?? "usuario"
            );
          });
      } else {
        setUsername("");
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  // Bloquear scroll cuando el menú móvil está abierto
  useEffect(() => {
    document.body.style.overflow = menuAbierto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuAbierto]);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    setMenuUsuario(false);
    setMenuAbierto(false);
    router.push("/");
    router.refresh();
  };

  const toggleTemaMobile = () => {
    const esOscuro = document.documentElement.classList.contains("dark");
    if (esOscuro) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("tema", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("tema", "dark");
    }
    setMenuAbierto(false);
  };

  const enlaces = [
    { href: "/confesiones", label: "Confesiones", emoji: "📝" },
    { href: "/contactos", label: "Contactos", emoji: "💘" },
    { href: "/amigos", label: "Amigos", emoji: "👥" },
  ];

  const inicial = username?.[0]?.toUpperCase() ?? "?";

  return (
    <>
      {/* Línea superior con degradado */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-[60] bg-gradient-to-r from-marca via-rosa to-neon" />

      <header
        className={`
          sticky top-0 z-50 w-full
          transition-all duration-300
          ${
            scrolleado
              ? "bg-fondo/95 backdrop-blur-xl border-b border-borde shadow-lg shadow-marca/5"
              : "bg-fondo/70 backdrop-blur-md border-b border-transparent"
          }
        `}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          {/* 🔤 LOGO */}
          <Link href="/" className="flex items-center gap-2 group relative">
            <span className="text-2xl transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
              👀
            </span>
            <span className="text-xl md:text-2xl font-black tracking-tight gradient-animated">
              Chismólogo
            </span>
          </Link>

          {/* 🧭 NAV ESCRITORIO */}
          <nav className="hidden md:flex items-center gap-1">
            {enlaces.map((enlace) => (
              <Link
                key={enlace.href}
                href={enlace.href}
                className="group relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-texto-suave hover:text-texto hover:bg-fondo-card transition-all duration-300"
              >
                <span className="text-base transition-transform duration-300 group-hover:scale-125">
                  {enlace.emoji}
                </span>
                <span>{enlace.label}</span>

                {/* Subrayado animado al hover */}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 bg-gradient-to-r from-marca to-rosa transition-all duration-300 group-hover:w-2/3" />
              </Link>
            ))}
          </nav>

          {/* 🔐 ZONA DERECHA (escritorio) */}
          <div className="hidden md:flex items-center gap-3">
            {/* 🌗 Botón tema */}
            <BotonTema />

            {cargando ? (
              <div className="w-24 h-9 rounded-xl bg-fondo-card animate-pulse" />
            ) : user ? (
              <>
                {/* Botón confesar */}
                <Link
                  href="/confesiones/nueva"
                  className="text-sm font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-marca to-rosa text-white hover:from-marca-hover hover:to-rosa-hover transition-all hover:scale-105 shadow-lg shadow-marca/20"
                >
                  + Confesar
                </Link>

                {/* 🔔 Campanita */}
                <CampanitaNotificaciones />

                {/* Menú usuario */}
                <div className="relative" ref={menuUsuarioRef}>
                  <button
                    onClick={() => setMenuUsuario(!menuUsuario)}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:bg-fondo-card transition-all border border-transparent hover:border-borde"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-marca to-rosa flex items-center justify-center text-white font-bold text-sm">
                      {inicial}
                    </div>
                    <span className="text-sm font-medium text-texto max-w-[100px] truncate">
                      {username}
                    </span>
                    <svg
                      className={`w-4 h-4 text-texto-suave transition-transform ${
                        menuUsuario ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  {menuUsuario && (
                    <div className="absolute right-0 mt-2 w-56 bg-fondo-card border border-borde rounded-xl shadow-2xl shadow-marca/20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-3 border-b border-borde">
                        <p className="text-xs text-texto-suave">
                          Conectado como
                        </p>
                        <p className="text-sm font-semibold text-texto truncate">
                          @{username}
                        </p>
                      </div>

                      <div className="p-1">
                        <Link
                          href="/perfil"
                          onClick={() => setMenuUsuario(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-texto-suave hover:bg-fondo-card-hover hover:text-texto transition"
                        >
                          <span>👤</span> Mi perfil
                        </Link>
                        <Link
                          href="/mis-confesiones"
                          onClick={() => setMenuUsuario(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-texto-suave hover:bg-fondo-card-hover hover:text-texto transition"
                        >
                          <span>📝</span> Mis confesiones
                        </Link>
                        <Link
                          href="/mis-anuncios"
                          onClick={() => setMenuUsuario(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-texto-suave hover:bg-fondo-card-hover hover:text-texto transition"
                        >
                          <span>💘</span> Mis anuncios
                        </Link>
                        <Link
                          href="/mensajes"
                          onClick={() => setMenuUsuario(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-texto-suave hover:bg-fondo-card-hover hover:text-texto transition"
                        >
                          <span>💬</span> Mensajes
                        </Link>
                        <Link
                          href="/notificaciones"
                          onClick={() => setMenuUsuario(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-texto-suave hover:bg-fondo-card-hover hover:text-texto transition"
                        >
                          <span>🔔</span> Notificaciones
                        </Link>
                      </div>

                      <div className="p-1 border-t border-borde">
                        <button
                          onClick={cerrarSesion}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-error hover:bg-error/10 transition text-left"
                        >
                          <span>🚪</span> Cerrar sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="group relative text-sm font-medium text-texto-suave hover:text-texto transition-all px-3 py-2"
                >
                  Iniciar sesión
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-[2px] w-0 bg-texto transition-all duration-300 group-hover:w-1/2" />
                </Link>
                <Link
                  href="/register"
                  className="relative text-sm font-semibold px-5 py-2 rounded-xl text-white overflow-hidden glow-marca bg-gradient-to-r from-marca to-rosa"
                >
                  <span className="relative z-10">Registrarse →</span>
                </Link>
              </>
            )}
          </div>

          {/* 🍔 BOTÓN HAMBURGUESA */}
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="md:hidden relative w-11 h-11 rounded-xl flex flex-col justify-center items-center hover:bg-fondo-card transition-all duration-300 border border-transparent hover:border-borde"
            aria-label="Abrir menú"
          >
            <span
              className={`
                block w-6 h-0.5 rounded-full bg-gradient-to-r from-marca to-rosa
                transition-all duration-300
                ${menuAbierto ? "rotate-45 translate-y-[5px]" : ""}
              `}
            />
            <span
              className={`
                block w-6 h-0.5 rounded-full bg-gradient-to-r from-rosa to-neon
                my-1.5 transition-all duration-300
                ${menuAbierto ? "opacity-0 scale-0" : ""}
              `}
            />
            <span
              className={`
                block w-6 h-0.5 rounded-full bg-gradient-to-r from-neon to-marca
                transition-all duration-300
                ${menuAbierto ? "-rotate-45 -translate-y-[5px]" : ""}
              `}
            />
          </button>
        </div>
      </header>

      {/* 📱 OVERLAY OSCURO */}
      <div
        onClick={() => setMenuAbierto(false)}
        className={`
          md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40
          transition-opacity duration-300
          ${
            menuAbierto
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }
        `}
      />

      {/* 📱 MENÚ MÓVIL DESPLEGABLE */}
      <div
        className={`
          md:hidden fixed inset-x-0 top-[57px] z-40
          bg-fondo-card border-b border-borde shadow-2xl shadow-marca/20
          transition-all duration-500 ease-out overflow-hidden
          ${
            menuAbierto
              ? "max-h-[700px] opacity-100 translate-y-0"
              : "max-h-0 opacity-0 -translate-y-4"
          }
        `}
      >
        <nav className="flex flex-col p-4 gap-2">
          {enlaces.map((enlace, i) => (
            <Link
              key={enlace.href}
              href={enlace.href}
              onClick={() => setMenuAbierto(false)}
              style={{ transitionDelay: menuAbierto ? `${i * 60}ms` : "0ms" }}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl
                text-sm font-medium transition-all duration-300
                ${
                  menuAbierto
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-4 opacity-0"
                }
                text-texto-suave hover:bg-fondo-card-hover hover:text-texto
              `}
            >
              <span className="text-lg">{enlace.emoji}</span>
              <span>{enlace.label}</span>
            </Link>
          ))}

          <div className="border-t border-borde my-2" />

          {user ? (
            <>
              <div className="px-4 py-3 flex items-center gap-3 bg-fondo-card-hover rounded-xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-marca to-rosa flex items-center justify-center text-white font-bold">
                  {inicial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-texto-suave">Conectado como</p>
                  <p className="text-sm font-semibold text-texto truncate">
                    @{username}
                  </p>
                </div>
              </div>

              <Link
                href="/confesiones/nueva"
                onClick={() => setMenuAbierto(false)}
                className="px-4 py-3 rounded-xl text-sm font-semibold text-white text-center bg-gradient-to-r from-marca to-rosa transition shadow-lg shadow-marca/30"
              >
                + Confesar
              </Link>

              <Link
                href="/notificaciones"
                onClick={() => setMenuAbierto(false)}
                className="px-4 py-3 rounded-xl text-sm text-texto-suave hover:bg-fondo-card-hover hover:text-texto transition text-center"
              >
                🔔 Notificaciones
              </Link>

              <Link
                href="/mensajes"
                onClick={() => setMenuAbierto(false)}
                className="px-4 py-3 rounded-xl text-sm text-texto-suave hover:bg-fondo-card-hover hover:text-texto transition text-center"
              >
                💬 Mensajes
              </Link>

              <Link
                href="/perfil"
                onClick={() => setMenuAbierto(false)}
                className="px-4 py-3 rounded-xl text-sm text-texto-suave hover:bg-fondo-card-hover hover:text-texto transition text-center"
              >
                👤 Mi perfil
              </Link>

              <button
                onClick={toggleTemaMobile}
                className="px-4 py-3 rounded-xl text-sm text-texto-suave hover:bg-fondo-card-hover hover:text-texto transition text-center"
              >
                🌗 Cambiar tema
              </button>

              <button
                onClick={cerrarSesion}
                className="px-4 py-3 rounded-xl text-sm font-semibold text-error text-center border border-error/30 hover:bg-error/10 transition"
              >
                🚪 Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMenuAbierto(false)}
                className="px-4 py-3 rounded-xl text-sm text-texto-suave hover:bg-fondo-card-hover hover:text-texto transition text-center"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                onClick={() => setMenuAbierto(false)}
                className="px-4 py-3 rounded-xl text-sm font-semibold text-white text-center bg-gradient-to-r from-marca to-rosa transition shadow-lg shadow-marca/30"
              >
                Registrarse →
              </Link>
            </>
          )}
        </nav>
      </div>
    </>
  );
}