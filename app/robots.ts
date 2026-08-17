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
          "/api/*",
          "/notifications",
          "/forgot-password",
          "/reset-password",
          "/tracker",
          "/insights",
          "/bookmarks",
          "/buddies",
          "/chat",
          "/profile",
          "/posts/create",
          "/submit",
          "/dashboard",
        ],
      },
      {
        userAgent: [
          "GPTBot",
          "PerplexityBot",
          "ClaudeBot",
          "Google-Extended",
          "Applebot",
          "Bingbot",
          "CCBot",
        ],
        allow: [
          "/",
          "/posts",
          "/posts/*",
          "/about",
          "/feedback",
          "/privacy",
          "/terms",
          "/llms.txt",
        ],
        disallow: [
          "/api/*",
          "/auth/*",
          "/notifications",
          "/forgot-password",
          "/reset-password",
          "/tracker",
          "/insights",
          "/bookmarks",
          "/buddies",
          "/chat",
          "/profile",
          "/posts/create",
          "/submit",
          "/dashboard",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
