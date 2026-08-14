import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://prepniti.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/posts",
          "/posts/*",
          "/mock-tests",
          "/about",
          "/feedback",
          "/privacy",
          "/terms",
          "/llms.txt",
          "/manifest.json",
          "/icon.png",
          "/og-image.png",
          "/favicon.ico",
        ],
        disallow: [
          "/auth/*",
          "/notifications",
          "/forgot-password",
          "/reset-password",
          "/api/*",
        ],
      },
      {
        userAgent: ["GPTBot", "PerplexityBot", "ClaudeBot", "Google-Extended", "Applebot", "Bingbot", "CCBot"],
        allow: [
          "/",
          "/posts",
          "/posts/*",
          "/mock-tests",
          "/about",
          "/llms.txt",
        ],
        disallow: ["/api/*", "/auth/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
