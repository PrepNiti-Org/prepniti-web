import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  org: "prepniti",
  project: "prepniti-web",
  silent: true,
  widenClientFileUpload: true,
});
