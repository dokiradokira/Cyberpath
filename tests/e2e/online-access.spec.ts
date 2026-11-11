import { test, expect } from "@playwright/test";

test("serves installable manifest and iPhone home-screen metadata", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");

  const manifestHref = await page
    .locator('link[rel="manifest"]')
    .getAttribute("href");
  expect(manifestHref).toBe("/manifest.webmanifest");

  const manifestResponse = await request.get(manifestHref!);
  expect(manifestResponse.status()).toBe(200);
  expect(manifestResponse.headers()["content-type"]).toContain(
    "application/manifest+json",
  );
  const manifest = await manifestResponse.json();
  expect(manifest).toMatchObject({
    id: "/",
    scope: "/",
    start_url: "/",
    display: "standalone",
    lang: "zh-CN",
  });
  for (const icon of manifest.icons) {
    const iconResponse = await request.get(icon.src);
    expect(iconResponse.status()).toBe(200);
    expect(iconResponse.headers()["content-type"]).toContain("image/png");
  }

  const appleIcon = page.locator('link[rel="apple-touch-icon"]').first();
  await expect(appleIcon).toHaveAttribute("href", "/apple-touch-icon.png");
  await expect(appleIcon).toHaveAttribute("sizes", "180x180");
  const appleResponse = await request.get("/apple-touch-icon.png");
  expect(appleResponse.status()).toBe(200);
  expect(appleResponse.headers()["content-type"]).toContain("image/png");

  await expect(
    page.locator('meta[name="apple-mobile-web-app-capable"]'),
  ).toHaveAttribute("content", "yes");
  await expect(
    page.locator('meta[name="mobile-web-app-capable"]'),
  ).toHaveAttribute("content", "yes");
  await expect(
    page.locator('meta[name="apple-mobile-web-app-title"]'),
  ).toHaveAttribute("content", "CyberPath");

  // localhost/127.0.0.1 is a trustworthy origin, so this exercises the same
  // IndexedDB and secure-context APIs used by the future HTTPS deployment.
  expect(await page.evaluate(() => window.isSecureContext)).toBe(true);
  expect(await page.evaluate(() => typeof indexedDB !== "undefined")).toBe(
    true,
  );
  const crossOriginHttp = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .map((entry) => entry.name)
      .filter((name) => {
        const url = new URL(name);
        return url.protocol === "http:" && url.origin !== location.origin;
      }),
  );
  expect(crossOriginHttp).toEqual([]);
});
