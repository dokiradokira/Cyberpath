import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import manifest from "../src/app/manifest";
import vercel from "../vercel.json";

const pngSize = (file: string) => {
  const bytes = readFileSync(resolve(process.cwd(), "public", file));
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  };
};

describe("V2.3-A online access", () => {
  it("publishes a stable standalone manifest with installable icons", () => {
    const pwa = manifest();
    expect(pwa.id).toBe("/");
    expect(pwa.scope).toBe("/");
    expect(pwa.start_url).toBe("/");
    expect(pwa.display).toBe("standalone");
    expect(pwa.lang).toBe("zh-CN");
    expect(pwa.categories).toContain("education");
    expect(pwa.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sizes: "192x192", type: "image/png" }),
        expect.objectContaining({ sizes: "512x512", type: "image/png" }),
      ]),
    );
    expect(pngSize("icon-192.png")).toEqual({ width: 192, height: 192 });
    expect(pngSize("icon-512.png")).toEqual({ width: 512, height: 512 });
  });

  it("ships an opaque 180px Apple touch icon", () => {
    expect(pngSize("apple-touch-icon.png")).toEqual({
      width: 180,
      height: 180,
    });
  });

  it("uses the standard Next.js output on Vercel only", async () => {
    vi.resetModules();
    vi.stubEnv("VERCEL", "1");
    const onVercel = (await import("../next.config")).default;
    vi.stubEnv("VERCEL", "");
    vi.resetModules();
    const local = (await import("../next.config")).default;
    vi.unstubAllEnvs();
    expect(onVercel.distDir).toBe(".next");
    expect(local.distDir).toBe(".next-v2");
  });

  it("declares a deterministic Vercel build without rewrites", () => {
    expect(vercel.framework).toBe("nextjs");
    expect(vercel.buildCommand).toBe("npm run build");
    expect(vercel.installCommand).toBe("npm ci");
    expect(vercel).not.toHaveProperty("rewrites");
    expect(vercel).not.toHaveProperty("redirects");
  });
});
