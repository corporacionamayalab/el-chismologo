import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 3600; // se regenera cada hora

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.chismologo.online";
  const supabase = await createClient();

  // Páginas estáticas
  const estaticas: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/confesiones`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contactos`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terminos`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacidad`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Confesiones públicas (aprobadas)
  const { data: confesiones } = await supabase
    .from("confesiones")
    .select("id, actualizado_en")
    .eq("estado", "aprobada")
    .order("creado_en", { ascending: false })
    .limit(500);

  const urlsConfesiones: MetadataRoute.Sitemap = (confesiones ?? []).map(
    (c) => ({
      url: `${baseUrl}/confesiones/${c.id}`,
      lastModified: new Date(c.actualizado_en),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })
  );

  return [...estaticas, ...urlsConfesiones];
}