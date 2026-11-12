import { test, expect } from "@playwright/test";
import { readPersistedProfile } from "../support/persisted-profile";
import { readFileSync } from "node:fs";
const { version } = JSON.parse(
  readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
) as { version: string };

test("DNS lab centre and course expose the same prediction, expiry and negative-cache experiment", async ({
  page,
}) => {
  for (const route of ["/labs", "/courses/dns-tcp-web"]) {
    await page.goto(route);
    await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
    if (route === "/labs") {
      await expect(
        page.getByRole("region", { name: "DNS 缓存实验入口" }),
      ).toContainText("预测缓存答案");
      await page
        .getByRole("link", { name: "开始 DNS 缓存实验", exact: true })
        .click();
      await expect(page).toHaveURL(/#lab-dns-cache$/);
      for (const id of ["tcp", "dns", "subnet", "nat"])
        await expect(page.locator(`#lab-${id}`)).toHaveCount(1);
    } else {
      await expect(
        page.getByRole("link", { name: "在互动实验中心打开此实验" }),
      ).toHaveAttribute("href", "/labs#lab-dns-cache");
    }
    const lab = page.getByRole("region", { name: "DNS cache investigation" });
    const query = async (prediction: string) => {
      await lab.getByLabel("预测下一次答案").selectOption(prediction);
      await lab.getByRole("button", { name: "执行 DNS 查询" }).click();
    };
    await query("192.0.2.10");
    await lab.getByRole("button", { name: "权威地址改为 .20" }).click();
    await lab.getByRole("button", { name: "时间前进 30 秒" }).click();
    await query("192.0.2.10");
    await expect(lab.getByRole("status")).toContainText("cache：");
    await lab.getByRole("button", { name: "时间前进 30 秒" }).click();
    await query("192.0.2.20");
    await expect(lab.getByRole("status")).toContainText(
      "预测正确：192.0.2.20 · authority",
    );
    await lab.getByRole("button", { name: "重置实验" }).click();
    await lab.getByRole("button", { name: "删除此名称" }).click();
    await query("NXDOMAIN");
    await lab.getByRole("button", { name: "权威地址改为 .20" }).click();
    await query("NXDOMAIN");
    await expect(lab.getByRole("status")).toContainText(
      "预测正确：NXDOMAIN · cache",
    );
    await lab.getByRole("button", { name: "时间前进 30 秒" }).click();
    await query("192.0.2.20");
    await expect(lab.getByRole("status")).toContainText("authority");
  }
});

test("goals and feedback offer contextual terms, favorites persist and new terms enter existing review", async ({
  page,
}) => {
  await page.goto("/courses/dns-tcp-web");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  await expect(page.locator("#prerequisites").locator("..")).toContainText(
    "客户端",
  );
  await expect(page.locator("#technical-goals").locator("..")).toContainText(
    "缓存未命中",
  );
  const term = page
    .locator("#english-goals")
    .locator("..")
    .getByRole("button", { name: "解释 expire", exact: true });
  await term.focus();
  const height = await page
    .locator(".learning-brief")
    .evaluate((e) => e.getBoundingClientRect().height);
  await term.press("Enter");
  const detail = page.getByRole("region", { name: "expire 词汇解释" });
  await expect(detail).toContainText("原文语境");
  await expect(detail).toContainText("Use resolve, cache and expire");
  expect(
    await page
      .locator(".learning-brief")
      .evaluate((e) => e.getBoundingClientRect().height),
  ).toBe(height);
  await detail
    .getByRole("button", { name: "收藏 expire", exact: true })
    .click();
  await detail.getByRole("button", { name: "收起解释" }).press("Escape");
  await expect(term).toBeFocused();
  await term.press("Enter");
  const theme = page.getByRole("button", { name: "切换深浅主题" });
  await theme.focus();
  await expect(detail).toHaveCount(0);
  await expect(theme).toBeFocused();
  await expect
    .poll(async () => (await readPersistedProfile(page))?.favorites)
    .toContain("expire");
  await page.getByRole("button", { name: "切换英语挑战模式" }).click();
  await expect(page.locator(".learning-brief .term-translation")).toHaveCount(
    0,
  );
  await term.click();
  await expect(detail).toContainText("到期");
  await detail.getByRole("button", { name: "收起解释" }).click();
  const exercise = page.getByRole("region", { name: "Apply exercise" });
  await exercise
    .getByRole("button", {
      name: "Only the new address, because updates push to all caches",
      exact: true,
    })
    .click();
  await expect(
    exercise.getByRole("button", { name: "解释 invalidate", exact: true }),
  ).toBeVisible();
  await expect
    .poll(async () => (await readPersistedProfile(page))?.mode)
    .toBe("challenge");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  await expect(
    page.getByRole("button", { name: "切换英语挑战模式" }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(
    (await readPersistedProfile(page))?.lessons["dns-tcp-web"].completed,
  ).toBe(false);
  await page.goto("/vocabulary");
  await page.getByLabel("搜索词汇").fill("expire");
  await page.getByLabel("学习状态", { exact: true }).selectOption("saved");
  await page.getByRole("button", { name: "闪卡复习", exact: true }).click();
  await page.getByRole("button", { name: "显示释义", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "词汇复习卡片" }),
  ).toContainText("到期");
});

test("reading blocks, mobile sheet, reduced motion and package version remain coherent", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/courses/dns-tcp-web");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  await expect(page.locator(".version")).toHaveText(`V${version}`);
  await expect(page.locator(".learning-brief .learning-block")).toHaveCount(3);
  expect(
    await page.locator("#dns-cache-clock > div > p[lang=en]").count(),
  ).toBeGreaterThan(1);
  for (const width of [375, 768, 1280]) {
    await page.setViewportSize({ width, height: 850 });
    const term = page
      .locator("#english-goals")
      .locator("..")
      .getByRole("button", { name: "解释 expire", exact: true });
    await term.click();
    const detail = page.getByRole("region", { name: "expire 词汇解释" });
    await expect(detail).toBeVisible();
    if (width <= 600) {
      const sheet = await detail.boundingBox();
      const navigation = await page
        .getByRole("navigation", { name: "主导航" })
        .boundingBox();
      expect(sheet!.y + sheet!.height).toBeLessThanOrEqual(navigation!.y);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      await term.evaluate((e) => getComputedStyle(e).transitionDuration),
    ).toBe("0s");
    await page.screenshot({
      path: testInfo.outputPath(`reading-${width}.png`),
    });
    await detail.getByRole("button", { name: "收起解释" }).click();
    await page.getByRole("button", { name: "切换深浅主题" }).click();
  }
});
