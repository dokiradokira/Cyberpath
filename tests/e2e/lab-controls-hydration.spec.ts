import { test, expect } from "@playwright/test";

test("lab stepper is inert before hydration and enables reset after a step", async ({
  browser,
  page,
}) => {
  // Without JavaScript the static HTML must not offer dead step controls: a tap
  // before React hydrates would be dropped, leaving step 0 with reset disabled.
  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await noJs.newPage();
  await staticPage.goto("/labs");
  const tcpStatic = staticPage.locator("#lab-tcp");
  await expect(
    tcpStatic.getByRole("button", { name: "下一步", exact: true }),
  ).toBeDisabled();
  await expect(
    tcpStatic.getByRole("button", { name: "重置模拟" }),
  ).toBeDisabled();
  await noJs.close();

  await page.goto("/labs");
  const tcp = page.locator("#lab-tcp");
  const next = tcp.getByRole("button", { name: "下一步", exact: true });
  const reset = tcp.getByRole("button", { name: "重置模拟" });

  await expect(next).toBeEnabled();
  await next.click();
  await expect(tcp.locator(".step-controls > span")).toHaveText("2 / 4");
  await expect(reset).toBeEnabled();

  await reset.click();
  await expect(tcp.locator(".step-controls > span")).toHaveText("1 / 4");
  await expect(reset).toBeDisabled();
});
