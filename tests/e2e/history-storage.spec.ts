import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { initialProgress } from "../../src/lib/storage";
import { availableLessons } from "../../src/content/lessons";
import { makeAttempt } from "../../src/lib/study";
import { encodeBackup } from "../../src/lib/history-backup";
const lesson = availableLessons[0],
  answers = Object.fromEntries(lesson.quiz.map((q) => [q.id, q.answer]));
const records = (n: number) =>
  Array.from({ length: n }, (_, i) =>
    makeAttempt(
      lesson,
      answers,
      "quiz",
      `fixture-${String(i).padStart(6, "0")}`,
      new Date(Date.UTC(2026, 0, 1, 0, i)).toISOString(),
    ),
  );
async function head(page: Page) {
  return page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const r = indexedDB.open("cyberpath.learning.v1", 1);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    try {
      return await new Promise<{
        count: number;
        revision: number;
        generation: string;
        profile: ReturnType<typeof initialProgress>;
      }>((resolve, reject) => {
        const r = db.transaction("meta").objectStore("meta").get("head");
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => reject(r.error);
      });
    } finally {
      db.close();
    }
  });
}
async function upload(page: Page, text: string) {
  page.once("dialog", (d) => d.accept());
  await page
    .locator('input[type="file"]')
    .setInputFiles({
      name: "history.json",
      mimeType: "application/json",
      buffer: Buffer.from(text),
    });
  await expect(page.getByRole("status").last()).toContainText("导入成功", {
    timeout: 30000,
  });
}

test("100 legacy records migrate idempotently and the 101st quiz persists with a complete export", async ({
  page,
}) => {
  const p = initialProgress();
  p.study = { version: 1, history: records(100) };
  p.favorites = ["packet"];
  p.notes[lesson.id] = "legacy note";
  p.lessons[lesson.id].latest = 5;
  p.lessons[lesson.id].best = 5;
  await page.addInitScript((v) => {
    if (!sessionStorage.getItem("legacy-history-seed")) {
      localStorage.setItem("cyberpath.v1", JSON.stringify(v));
      sessionStorage.setItem("legacy-history-seed", "1");
    }
  }, p);
  await page.goto("/progress");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  expect((await head(page)).count).toBe(100);
  const generation = (await head(page)).generation;
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  expect((await head(page)).generation).toBe(generation);
  expect((await head(page)).count).toBe(100);
  await page.goto(`/courses/${lesson.id}`);
  for (const q of lesson.quiz)
    await page
      .locator(`#knowledge-check input[name="${q.id}"][value="${q.answer}"]`)
      .check();
  await page.getByRole("button", { name: "提交测验", exact: true }).click();
  await expect(page.getByText("本次得分： 5 / 5")).toBeVisible();
  expect((await head(page)).count).toBe(101);
  await page.goto("/progress");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出 JSON", exact: true }).click();
  const download = await downloadPromise;
  const exported = JSON.parse(await readFile((await download.path())!, "utf8"));
  expect(exported.version).toBe(2);
  expect(exported.history).toHaveLength(101);
  expect(exported.profile.notes[lesson.id]).toBe("legacy note");
  expect(exported.profile.favorites).toContain("packet");
  const rawPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出原始数据", exact: true }).click();
  const raw = await rawPromise;
  expect(
    JSON.parse(await readFile((await raw.path())!, "utf8")).study.history,
  ).toHaveLength(100);
});
test("1001 records import atomically, paginate, export completely and retain exact statistics", async ({
  page,
}) => {
  test.setTimeout(120000);
  const fixtures = records(1001);
  await page.goto("/progress");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  await upload(page, encodeBackup(initialProgress(), fixtures));
  expect((await head(page)).count).toBe(1001);
  const mirror = await page.evaluate(
    () => JSON.parse(localStorage.getItem("cyberpath.v1")!),
  );
  expect(mirror.historyStorage.version).toBe(1);
  expect(mirror.study.history).toHaveLength(20);
  expect(mirror.study.history.at(-1).id).toBe(fixtures[1000].id);
  const points = page
    .getByRole("group", { name: "测验正确率趋势图" })
    .getByRole("button");
  await expect(points).toHaveCount(20);
  await page.getByRole("button", { name: "更早记录", exact: true }).click();
  await expect(points).toHaveCount(20);
  await expect(page.getByText(/错误 0 \/ 作答 1001 次/).first()).toBeVisible();
  const before = await head(page);
  await page
    .locator('input[type="file"]')
    .setInputFiles({
      name: "invalid.json",
      mimeType: "application/json",
      buffer: Buffer.from('{"format":"cyberpath","version":2,"profile":{}}'),
    });
  await expect(page.getByRole("status").last()).toContainText("导入失败");
  expect((await head(page)).generation).toBe(before.generation);
  expect((await head(page)).count).toBe(1001);
  const d = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出 JSON", exact: true }).click();
  const file = await d;
  const text = await readFile((await file.path())!, "utf8");
  const exported = JSON.parse(text);
  expect(exported.history).toHaveLength(1001);
  const times = exported.history.map((a: { at: string }) => Date.parse(a.at));
  expect(times).toEqual([...times].sort((a, b) => a - b));
  await upload(page, text);
  expect((await head(page)).count).toBe(1001);
  await page.setViewportSize({ width: 375, height: 850 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("interrupted migration keeps raw data and retries safely after reload", async ({
  page,
}) => {
  const p = initialProgress();
  p.study = { version: 1, history: records(100) };
  await page.addInitScript((v) => {
    if (!sessionStorage.getItem("migration-seed")) {
      localStorage.setItem("cyberpath.v1", JSON.stringify(v));
      sessionStorage.setItem("migration-seed", "1");
    }
    const add = IDBObjectStore.prototype.add;
    IDBObjectStore.prototype.add = function (
      ...args: Parameters<IDBObjectStore["add"]>
    ) {
      if (
        this.name === "history" &&
        !sessionStorage.getItem("migration-aborted")
      ) {
        sessionStorage.setItem("migration-aborted", "1");
        this.transaction.abort();
        throw new DOMException("interrupted", "AbortError");
      }
      return add.apply(this, args);
    };
  }, p);
  await page.goto("/progress");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("cyberpath.v1")!).study.history.length,
    ),
  ).toBe(100);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  expect((await head(page)).count).toBe(100);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  expect((await head(page)).count).toBe(100);
});
test("IndexedDB unavailable permits reading but never claims a quiz was saved", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "indexedDB", {
      get() {
        throw new DOMException("blocked", "SecurityError");
      },
    });
  });
  await page.goto(`/courses/${lesson.id}`);
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  for (const q of lesson.quiz)
    await page
      .locator(`#knowledge-check input[name="${q.id}"][value="${q.answer}"]`)
      .check();
  await page.getByRole("button", { name: "提交测验", exact: true }).click();
  await expect(
    page.locator("#knowledge-check").getByRole("alert"),
  ).toContainText("历史未保存");
  await expect(page.getByText("本次得分： 5 / 5")).toHaveCount(0);
});
test("quota failure rolls back history and score, and stale tabs cannot overwrite", async ({
  page,
  context,
}) => {
  await page.goto(`/courses/${lesson.id}`);
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  const before = await head(page);
  await page.evaluate(() => {
    const add = IDBObjectStore.prototype.add;
    IDBObjectStore.prototype.add = function (
      ...args: Parameters<IDBObjectStore["add"]>
    ) {
      if (this.name === "history")
        throw new DOMException("quota full", "QuotaExceededError");
      return add.apply(this, args);
    };
  });
  for (const q of lesson.quiz)
    await page
      .locator(`#knowledge-check input[name="${q.id}"][value="${q.answer}"]`)
      .check();
  await page.getByRole("button", { name: "提交测验", exact: true }).click();
  await expect(
    page.locator("#knowledge-check").getByRole("alert"),
  ).toContainText("历史未保存");
  expect((await head(page)).count).toBe(before.count);
  expect((await head(page)).profile.lessons[lesson.id].latest).toBeNull();
  await page.goto("/vocabulary");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  const other = await context.newPage();
  await other.goto("/vocabulary");
  await expect(other.locator("html")).toHaveAttribute("data-hydrated", "true");
  await page.getByRole("button", { name: "收藏 packet", exact: true }).click();
  await expect
    .poll(async () => (await head(page)).profile.favorites)
    .toContain("packet");
  await other
    .getByRole("button", { name: "收藏 protocol", exact: true })
    .click();
  await expect(other.getByRole("status")).toContainText("其他标签页");
  expect((await head(page)).profile.favorites).not.toContain("protocol");
});
