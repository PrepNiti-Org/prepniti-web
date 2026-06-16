import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://prepniti.com";

  const routes = [
    "",
    "/tracker",
    "/posts",
    "/insights",
    "/mock-tests",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/posts" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route === "/posts" ? 0.8 : 0.5,
  }));
}
