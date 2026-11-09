import { test, expect } from "@playwright/test";
import { initialProgress } from "../../src/lib/storage";
const routes = [
  "/",
  "/courses",
  "/labs",
  "/vocabulary",
  "/progress",
  "/courses/network-foundations",
];
test("V2 Chinese navigation and actual global theme colors persist on every route", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await page.getByRole("button", { name: "切换深浅主题" }).click();
  for (const route of routes) {
    await page.goto(route);
    await expect(
      page.getByRole("button", { name: "切换深浅主题" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("body")).toHaveCSS(
      "background-color",
      "rgb(248, 250, 252)",
    );
    await expect(page.locator(".panel").first()).toHaveCSS(
      "background-color",
      "rgb(255, 255, 255)",
    );
  }
  await page.getByRole("button", { name: "切换深浅主题" }).click();
  await page.getByRole("link", { name: "学习首页", exact: true }).click();
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(11, 18, 32)",
  );
  await expect(page.locator(".panel").first()).toHaveCSS(
    "background-color",
    "rgb(17, 29, 46)",
  );
  expect(errors).toEqual([]);
});
test("V2 server-rendered content remains readable without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3100/");
  await expect(page.getByRole("heading", { name: "欢迎回来." })).toBeVisible();
  await expect(page.getByText("Opening your learning space")).toHaveCount(0);
  await page.getByRole("link", { name: "课程目录", exact: true }).click();
  await expect(page.getByText("即将推出", { exact: true })).toHaveCount(5);
  await page.goto("http://127.0.0.1:3100/courses/network-foundations");
  await expect(
    page.getByRole("heading", { name: "What is a computer network?" }),
  ).toBeVisible();
  await context.close();
});
test("V2 failed app scripts show recovery instead of a blank loading screen", async ({
  page,
}) => {
  await page.route("**/_next/**/*.js*", (route) => route.abort());
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "欢迎回来." })).toBeVisible();
  await expect(page.locator("#startup-recovery")).toBeVisible({
    timeout: 12000,
  });
});
test("V2 blocked browser storage never prevent mobile learning", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("SecurityError");
      },
    });
  });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  await expect(page.getByRole("heading", { name: "欢迎回来." })).toBeVisible();
  await page.getByRole("button", { name: "切换深浅主题" }).click();
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(248, 250, 252)",
  );
  await expect(page.getByText(/当前浏览器无法保存进度/)).toBeVisible();
});
test("V2 legacy V1 records and preferences survive upgrade", async ({
  page,
}) => {
  const old = initialProgress();
  const { reviews: _reviews, ...legacy } = old;
  void _reviews;
  legacy.theme = "light";
  legacy.favorites = ["packet"];
  legacy.notes[legacy.currentLesson] = "V1 preserved";
  legacy.lessons[legacy.currentLesson].completed = true;
  await page.addInitScript(
    (p) => localStorage.setItem("cyberpath.v1", JSON.stringify(p)),
    legacy,
  );
  await page.goto("/progress");
  await expect(page.getByText("V1 preserved")).toBeVisible();
  await expect(page.locator("tbody tr").first()).toContainText("已完成");
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(248, 250, 252)",
  );
  await page.goto("/vocabulary");
  await expect(page.getByRole("heading", { name: "1 个收藏" })).toBeVisible();
});
test("V2 inline Chinese hints and vocabulary search, cards, quiz, favorite and backup work", async ({
  page,
}, testInfo) => {
  await page.goto("/courses/network-foundations");
  const reading = page.locator("#section-0");
  await expect(reading.locator(".term-translation").first()).toBeVisible();
  await page.getByRole("button", { name: "切换英语挑战模式" }).click();
  await expect(reading.locator(".term-translation")).toHaveCount(0);
  await reading
    .getByRole("button", { name: /解释 network/i })
    .first()
    .click();
  await expect(reading.locator(".term-translation").first()).toBeVisible();
  await page.getByRole("link", { name: "词汇学习", exact: true }).click();
  await page.getByLabel("搜索词汇").fill("packet");
  await expect(
    page.getByRole("button", { name: "收藏 packet", exact: true }),
  ).toBeVisible();
  await expect(
    page.locator(".word-entry").filter({ hasText: "数据包" }),
  ).toContainText("packet");
  await page.getByRole("button", { name: "收藏 packet", exact: true }).click();
  await page.getByLabel("学习状态", { exact: true }).selectOption("saved");
  await expect(page.locator(".word-entry")).toHaveCount(1);
  await page.getByRole("button", { name: "闪卡复习", exact: true }).click();
  await expect(page.locator(".flashcard h3")).toHaveCount(0);
  await page.getByRole("button", { name: "显示释义", exact: true }).click();
  await expect(page.locator(".flashcard h3")).toHaveText("数据包");
  await page.getByRole("button", { name: "认识，下一词", exact: true }).click();
  await expect(page.getByRole("heading", { name: "1 个已掌握" })).toBeVisible();
  await page.getByRole("button", { name: "释义测验", exact: true }).click();
  await page.getByRole("button", { name: "数据包", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("回答正确");
  await page.reload();
  await expect(page.getByRole("heading", { name: "1 个已掌握" })).toBeVisible();
  await page.getByLabel("搜索词汇").fill("数据包");
  await expect(page.locator(".word-entry")).toContainText("packet");
  await page.getByLabel("搜索词汇").fill("no-such-term");
  await expect(page.getByRole("status")).toContainText("没有匹配");
  await page.getByLabel("搜索词汇").fill("");
  await page.screenshot({
    path: testInfo.outputPath("vocabulary-v2.png"),
    fullPage: true,
  });
  await page.goto("/");
  await page.screenshot({
    path: testInfo.outputPath("home-v2.png"),
    fullPage: true,
  });
});
test("V2 vocabulary has no mobile overflow at all supported widths", async ({
  page,
}) => {
  for (const width of [375, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/vocabulary");
    await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("V2 corrupted storage safely recovers without blocking the page", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("cyberpath.v1", "{broken"),
  );
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  await expect(page.getByRole("heading", { name: "欢迎回来." })).toBeVisible();
  await expect(page.getByText(/本机数据无法读取/)).toBeVisible();
  await page.getByRole("button", { name: "切换深浅主题" }).click();
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(248, 250, 252)",
  );
});
