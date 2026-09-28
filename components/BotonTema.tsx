"use client";

import { useState, useEffect } from "react";

export default function BotonTema() {
  const [tema, setTema] = useState<"light" | "dark">("light");
  const [montado, setMontado] = useState(false);

  // Detectar el tema al montar
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMontado(true);

      const esOscuro = document.documentElement.classList.contains("dark");
      setTema(esOscuro ? "dark" : "light");
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  const toggleTema = () => {
    const nuevoTema = tema === "dark" ? "light" : "dark";

    if (nuevoTema === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    localStorage.setItem("tema", nuevoTema);
    setTema(nuevoTema);
  };

  // Evitar parpadeo antes de montar
  if (!montado) {
    return (
      <button
        className="w-10 h-10 rounded-xl flex items-center justify-center border border-transparent"
        aria-label="Cambiar tema"
      >
        <span className="text-xl opacity-0">🌙</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTema}
      className="relative w-10 h-10 rounded-xl flex items-center justify-center hover:bg-fondo-card transition-all border border-transparent hover:border-borde group"
      aria-label={tema === "dark" ? "Activar modo claro" : "Activar modo oscuro"}
      title={tema === "dark" ? "Modo claro" : "Modo oscuro"}
    >
      <span
        className={`
          text-xl transition-all duration-500
          ${tema === "dark" ? "rotate-0" : "rotate-180"}
          group-hover:scale-125
        `}
      >
        {tema === "dark" ? "🌙" : "☀️"}
      </span>
    </button>
  );
}