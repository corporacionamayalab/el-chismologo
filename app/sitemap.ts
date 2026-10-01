import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 3600; // se regenera cada hora

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.chismologo.online";
  const supabase = await createClient();

  // ============ PÁGINAS ESTÁTICAS ============
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
      priority: 0.95,
    },
    {
      url: `${baseUrl}/contactos`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/confesiones/nueva`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contactos/nuevo`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/amigos/buscar`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
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
    {
      url: `${baseUrl}/cookies`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/descargo`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // ============ CONFESIONES APROBADAS ============
  const { data: confesiones } = await supabase
    .from("confesiones")
    .select("id, actualizado_en")
    .eq("estado", "aprobada")
    .order("creado_en", { ascending: false })
    .limit(1000);

  const urlsConfesiones: MetadataRoute.Sitemap = (confesiones ?? []).map(
    (c) => ({
      url: `${baseUrl}/confesiones/${c.id}`,
      lastModified: new Date(c.actualizado_en),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })
  );

  // ============ CONTACTOS APROBADOS ============
  const { data: contactos } = await supabase
    .from("contactos")
    .select("id, creado_en")
    .eq("estado", "aprobada")
    .order("creado_en", { ascending: false })
    .limit(1000);

  const urlsContactos: MetadataRoute.Sitemap = (contactos ?? []).map(
    (c) => ({
      url: `${baseUrl}/contactos/${c.id}`,
      lastModified: new Date(c.creado_en),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })
  );

  return [...estaticas, ...urlsConfesiones, ...urlsContactos];
}