import { MetadataRoute } from "next";
import { getProperties } from "@/lib/properties";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://miyashiroimoveis.com.br";
  const properties = getProperties();

  // Rotas estáticas principais
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/imoveis`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/sobre`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contato`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/anunciar`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.85,
    },
  ];

  // Rotas dinâmicas de cada imóvel
  const propertyRoutes: MetadataRoute.Sitemap = properties
    .filter((p) => p.status !== "arquivado")
    .map((p) => ({
      url: `${baseUrl}/imovel/${p.slug}`,
      lastModified: new Date(p.createdAt || new Date()),
      changeFrequency: "weekly",
      priority: p.featured ? 0.9 : 0.8,
    }));

  return [...staticRoutes, ...propertyRoutes];
}
