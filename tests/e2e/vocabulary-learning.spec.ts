import { test, expect } from "@playwright/test";
import { initialProgress } from "../../src/lib/storage";
import { wordEntries } from "../../src/content/vocabulary";

test("inline vocabulary has keyboard-accessible examples, favorites and immediate mode changes", async ({
  page,
}) => {
  await page.goto("/courses/network-foundations");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  const term = page
    .locator("#section-0")
    .getByRole("button", { name: "解释 network", exact: true })
    .first();
  await term.focus();
  await term.press("Enter");
  const detail = page.getByRole("region", { name: "network 词汇解释" });
  await expect(detail).toContainText(
    wordEntries.find((w) => w.word === "network")!.example,
  );
  await detail
    .getByRole("button", { name: "收藏 network", exact: true })
    .click();
  await expect(
    detail.getByRole("button", { name: "取消收藏 network", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await detail
    .getByRole("button", { name: "取消收藏 network", exact: true })
    .press("Escape");
  await expect(detail).toHaveCount(0);
  await expect(term).toBeFocused();
  await page.getByRole("button", { name: "切换英语挑战模式" }).click();
  await expect(page.locator("#section-0 .term-translation")).toHaveCount(0);
  await term.click();
  await expect(
    page.locator("#section-0 .term-translation").first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "切换英语挑战模式" }).click();
  await page.getByRole("button", { name: "切换英语挑战模式" }).click();
  await expect(page.locator("#section-0 .term-translation")).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(
        () => JSON.parse(localStorage.getItem("cyberpath.v1")!).mode,
      ),
    )
    .toBe("challenge");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "切换英语挑战模式" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(() =>
      page.evaluate(
        () => JSON.parse(localStorage.getItem("cyberpath.v1")!).favorites,
      ),
    )
    .toContain("network");
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("cyberpath.v1")!).lessons[
          "network-foundations"
        ].completed,
    ),
  ).toBe(false);
  await page.goto("/vocabulary");
  await page.getByLabel("搜索词汇").fill("packet");
  // Search includes definitions: router/payload/routing also mention packets.
  const packet = page.locator(".word-entry").filter({
    has: page.getByRole("button", { name: "解释 packet", exact: true }),
  });
  await expect(packet).toHaveCount(1);
  await expect(packet.locator("small")).toBeHidden();
  await packet
    .getByRole("button", { name: "解释 packet", exact: true })
    .click();
  await expect(packet.locator("small")).toBeVisible();
  await page.getByRole("button", { name: "切换英语挑战模式" }).click();
  await page.getByRole("button", { name: "切换英语挑战模式" }).click();
  await expect(packet.locator("small")).toBeHidden();
});

test("saved flashcards finish a round, restart and preserve mastery on reload", async ({
  page,
}) => {
  const p = initialProgress();
  p.favorites = ["packet", "protocol"];
  await page.addInitScript((v) => {
    if (!sessionStorage.getItem("seed-v22b")) {
      localStorage.setItem("cyberpath.v1", JSON.stringify(v));
      sessionStorage.setItem("seed-v22b", "1");
    }
  }, p);
  await page.goto("/vocabulary");
  await page.getByLabel("学习状态", { exact: true }).selectOption("saved");
  await page.getByRole("button", { name: "闪卡复习", exact: true }).click();
  const card = page.getByRole("region", { name: "词汇复习卡片" });
  await card.focus();
  await card.press("Space");
  await expect(card.locator("h3")).toHaveText("数据包");
  await page.getByRole("button", { name: "认识，下一词", exact: true }).click();
  await expect(
    page.getByText("本轮已复习 1 个", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "显示释义", exact: true }).click();
  await page.getByRole("button", { name: "认识，下一词", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "本轮复习已完成" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "再复习一轮" }).click();
  await expect(card).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          Object.values(
            JSON.parse(localStorage.getItem("cyberpath.v1")!).reviews,
          ).filter((r) => (r as { known: boolean }).known).length,
      ),
    )
    .toBe(2);
  await page.reload();
  await expect(page.getByRole("heading", { name: "2 个已掌握" })).toBeVisible();
  await page.getByLabel("搜索词汇").fill("protocol");
  await page
    .getByRole("button", { name: "设为待巩固 protocol", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: "1 个已掌握" })).toBeVisible();
});

test("touch-sized inline details stay in flow at phone and tablet widths in both themes", async ({
  page,
}) => {
  for (const width of [375, 768, 1280]) {
    await page.setViewportSize({ width, height: 850 });
    await page.goto("/courses/network-foundations");
    await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
    await page
      .locator("#section-0")
      .getByRole("button", { name: "解释 network", exact: true })
      .first()
      .click();
    const detail = page.getByRole("region", { name: "network 词汇解释" });
    await expect(detail).toBeVisible();
    expect(await detail.evaluate((e) => getComputedStyle(e).position)).toBe(
      "static",
    );
    await page.getByRole("button", { name: "切换深浅主题" }).click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.goto("/vocabulary");
    await page.getByRole("button", { name: "闪卡复习", exact: true }).click();
    await expect(
      page.getByRole("region", { name: "词汇复习卡片" }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("vocabulary edits never overwrite corrupt storage", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("cyberpath.v1", "{broken-vocab");
  });
  await page.goto("/vocabulary");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  await page.getByRole("button", { name: "收藏 packet", exact: true }).click();
  expect(await page.evaluate(() => localStorage.getItem("cyberpath.v1"))).toBe(
    "{broken-vocab",
  );
  await expect(page.getByText(/原始记录已保护/).first()).toBeVisible();
});

test("quota failures preserve the profile and warn after vocabulary changes", async ({
  page,
}) => {
  const p = initialProgress();
  await page.addInitScript((v) => {
    localStorage.setItem("cyberpath.v1", JSON.stringify(v));
    Storage.prototype.setItem = () => {
      throw new DOMException("full", "QuotaExceededError");
    };
  }, p);
  await page.goto("/vocabulary");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  await page.getByRole("button", { name: "收藏 packet", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("无法保存进度");
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("cyberpath.v1")!).favorites,
    ),
  ).toEqual([]);
});

test("favorites can remove a locked quiz word and navigate the shrinking queue", async ({
  page,
}) => {
  const p = initialProgress();
  p.favorites = ["packet", "protocol"];
  await page.addInitScript(
    (v) => localStorage.setItem("cyberpath.v1", JSON.stringify(v)),
    p,
  );
  await page.goto("/vocabulary");
  await page.getByLabel("学习状态", { exact: true }).selectOption("saved");
  await page.getByRole("button", { name: "释义测验", exact: true }).click();
  await page.getByRole("button", { name: "数据包", exact: true }).click();
  await page.getByRole("button", { name: "取消收藏", exact: true }).click();
  await expect(page.locator(".flashcard h2")).toHaveText("packet");
  await page.getByRole("button", { name: "下一个词", exact: true }).click();
  await expect(page.locator(".flashcard h2")).toHaveText("protocol");
  await page.getByRole("button", { name: "协议", exact: true }).click();
  await page.getByRole("button", { name: "完成复习", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "本轮复习已完成" }),
  ).toBeVisible();
});

test("a known flashcard can return to practice and an initially empty filter stays distinct", async ({
  page,
}) => {
  const p = initialProgress();
  p.reviews.packet = { known: true, attempts: 1, correct: 1 };
  await page.addInitScript(
    (v) => localStorage.setItem("cyberpath.v1", JSON.stringify(v)),
    p,
  );
  await page.goto("/vocabulary");
  await page.getByLabel("学习状态", { exact: true }).selectOption("known");
  await page.getByRole("button", { name: "闪卡复习", exact: true }).click();
  await page.getByRole("button", { name: "显示释义", exact: true }).click();
  await page
    .getByRole("button", { name: "再练一次，下一词", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "本轮复习已完成" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "再复习一轮" }).click();
  await expect(page.getByRole("status")).toContainText("没有匹配");
});
