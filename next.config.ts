import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

// In production (Vercel), set BACKEND_URL to your Render backend URL.
// e.g. https://prepniti-backend.onrender.com
// In local development this falls back to localhost:8080.
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: "prepniti",
  project: "prepniti-web",
  silent: true,
  widenClientFileUpload: true,
});
