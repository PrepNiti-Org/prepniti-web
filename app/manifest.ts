import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PrepNiti — Community & Study Platform for Aspirants",
    short_name: "PrepNiti",
    description: "Anonymous Peer Community and Intelligent Preparation Platform for UPSC, SSC, and Competitive Exam Aspirants.",
    start_url: "/",
    display: "standalone",
    background_color: "#090d16",
    theme_color: "#fe7d28",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "16x16 32x32 48x48 64x64",
        type: "image/x-icon",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    categories: ["education", "productivity", "social"],
  };
}
