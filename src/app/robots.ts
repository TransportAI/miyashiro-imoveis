import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://miyashiroimoveis.com.br";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      // Autorização explícita para Crawlers de Motores de IA e Busca Generativa (GEO)
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "PerplexityBot",
          "Google-Extended",
          "anthropic-ai",
          "Claude-Web",
          "cohere-ai",
          "Applebot-Extended"
        ],
        allow: ["/", "/imoveis", "/imovel/*", "/sobre", "/contato"],
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
