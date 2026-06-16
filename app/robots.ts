import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://prepniti.com";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/posts", "/submit"],
      disallow: [
        "/tracker",
        "/profile",
        "/bookmarks",
        "/insights",
        "/notifications",
        "/forgot-password",
        "/reset-password",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
