import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/api/:path*",
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
