import type { NextConfig } from "next";
import { networkInterfaces, hostname } from "node:os";
// Allow only this computer's actual addresses, not arbitrary origins.
const localHosts = Object.values(networkInterfaces()).flatMap((entries) =>
  (entries ?? [])
    .filter((entry) => entry.family === "IPv4")
    .map((entry) => entry.address),
);
const config: NextConfig = {
  poweredByHeader: false,
  agentRules: false,
  allowedDevOrigins: ["127.0.0.1", hostname(), ...localHosts],
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next-v2",
  experimental: { webpackBuildWorker: false, cpus: 1 },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};
export default config;
