import { test, expect } from "@playwright/test";
import { networkInterfaces } from "node:os";
test("real network adapter origin loads dev assets and interactive Chinese home", async ({
  page,
}) => {
  const addresses = Object.values(networkInterfaces()).flatMap((list) =>
    (list ?? [])
      .filter((n) => n.family === "IPv4" && !n.internal)
      .map((n) => n.address),
  );
  test.skip(!addresses.length, "No external IPv4 adapter is available");
  const origin = `http://${addresses[0]}:3000`;
  const blocked: string[] = [];
  page.on("response", (r) => {
    if (r.url().includes("/_next/") && r.status() >= 400)
      blocked.push(`${r.status()} ${r.url()}`);
  });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(origin, { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true", {
    timeout: 60000,
  });
  await expect(page.getByRole("heading", { name: "欢迎回来." })).toBeVisible();
  await page.getByRole("button", { name: "切换深浅主题" }).click();
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(248, 250, 252)",
  );
  await page.getByRole("link", { name: "词汇学习", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "词汇学习", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(248, 250, 252)",
  );
  expect(blocked).toEqual([]);
  expect(errors).toEqual([]);
});
