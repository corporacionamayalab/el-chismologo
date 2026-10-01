import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.chismologo.online";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/confesiones",
          "/confesiones/*",
          "/contactos",
          "/contactos/*",
          "/amigos",
          "/login",
          "/register",
          "/terminos",
          "/privacidad",
          "/cookies",
          "/descargo",
        ],
        disallow: [
          // Admin
          "/ymix34",
          "/ymix34/*",
          // Zona privada
          "/perfil",
          "/mis-confesiones",
          "/mis-anuncios",
          "/notificaciones",
          "/mensajes",
          "/mensajes/*",
          "/amigos/solicitudes",
          // Auth
          "/nueva-password",
          "/recuperar",
          "/auth/*",
          // API
          "/api/*",
          // Búsquedas (evita contenido duplicado)
          "/*?q=",
          "/*?search=",
        ],
      },
      // Bloqueo explícito a bots basura
      {
        userAgent: ["AhrefsBot", "SemrushBot", "MJ12bot", "DotBot"],
        disallow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}