import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.chismologo.online";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/ymix34",
          "/ymix34/*",
          "/perfil",
          "/mis-confesiones",
          "/mis-anuncios",
          "/notificaciones",
          "/mensajes",
          "/mensajes/*",
          "/amigos/solicitudes",
          "/api/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}