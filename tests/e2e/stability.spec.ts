import { test, expect } from "@playwright/test";
import { initialProgress } from "../../src/lib/storage";
import { wordEntries } from "../../src/content/vocabulary";
test("F02 raw recovery survives reading, refresh, cancelled reset and exports inert text", async ({
  page,
}) => {
  const raw = "{broken <script>alert(1)</script>";
  await page.addInitScript((v) => {
    if (!sessionStorage.getItem("seed")) {
      localStorage.setItem("cyberpath.v1", v);
      sessionStorage.setItem("seed", "1");
    }
  }, raw);
  await page.goto("/courses/network-foundations");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  await page.getByLabel("记下你的理解，或想进一步探索的问题").fill("temporary");
  expect(await page.evaluate(() => localStorage.getItem("cyberpath.v1"))).toBe(
    raw,
  );
  await page.goto("/progress");
  page.once("dialog", (d) => d.dismiss());
  await page.getByRole("button", { name: "重置学习数据" }).click();
  expect(await page.evaluate(() => localStorage.getItem("cyberpath.v1"))).toBe(
    raw,
  );
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出原始数据" }).click();
  expect((await download).suggestedFilename()).toContain("raw");
  await page.reload();
  expect(await page.evaluate(() => localStorage.getItem("cyberpath.v1"))).toBe(
    raw,
  );
});
test("F01 invalid import leaves current profile intact", async ({ page }) => {
  await page.goto("/progress");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  const before = await page.evaluate(() =>
    localStorage.getItem("cyberpath.v1"),
  );
  const p = initialProgress();
  await page.locator('input[type="file"]').setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({ ...p, currentLesson: [p.currentLesson] }),
    ),
  });
  await expect(page.getByRole("status")).toContainText("导入失败");
  expect(await page.evaluate(() => localStorage.getItem("cyberpath.v1"))).toBe(
    before,
  );
});
test("F03 practice queue advances from two to one and completes at zero", async ({
  page,
}) => {
  const p = initialProgress();
  for (const w of wordEntries)
    if (!["packet", "protocol"].includes(w.word))
      p.reviews[w.word] = { known: true, attempts: 1, correct: 1 };
  await page.addInitScript(
    (v) => localStorage.setItem("cyberpath.v1", JSON.stringify(v)),
    p,
  );
  await page.goto("/vocabulary");
  await page.getByLabel("学习状态", { exact: true }).selectOption("practice");
  await page.getByRole("button", { name: "释义测验", exact: true }).click();
  await page.getByRole("button", { name: "数据包", exact: true }).click();
  await expect(page.locator(".meaning-options button:enabled")).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("cyberpath.v1")!).reviews.packet
            .attempts,
      ),
    )
    .toBe(1);
  await expect(
    page.getByRole("button", { name: "下一个词", exact: true }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "下一个词", exact: true }).click();
  await expect(page.locator(".flashcard h2")).toHaveText("protocol");
  await page.getByRole("button", { name: "协议", exact: true }).click();
  await page.getByRole("button", { name: "完成复习", exact: true }).click();
  await expect(page.getByText("本轮复习已完成", { exact: true })).toBeVisible();
});
