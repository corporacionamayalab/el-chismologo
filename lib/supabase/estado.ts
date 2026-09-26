export function calcularEstado(ultimaConexion: string | null): {
  online: boolean;
  texto: string;
  emoji: string;
} {
  if (!ultimaConexion) {
    return { online: false, texto: "Desconocido", emoji: "⚫" };
  }

  const diff = Math.floor(
    (Date.now() - new Date(ultimaConexion).getTime()) / 1000
  );

  if (diff < 120) {
    return { online: true, texto: "En línea", emoji: "🟢" };
  }
  if (diff < 3600) {
    return {
      online: false,
      texto: `Hace ${Math.floor(diff / 60)} min`,
      emoji: "🟡",
    };
  }
  if (diff < 86400) {
    return {
      online: false,
      texto: `Hace ${Math.floor(diff / 3600)} h`,
      emoji: "🟡",
    };
  }

  const fecha = new Date(ultimaConexion);
  return {
    online: false,
    texto: `Última vez: ${fecha.toLocaleDateString("es-ES")}`,
    emoji: "⚫",
  };
}