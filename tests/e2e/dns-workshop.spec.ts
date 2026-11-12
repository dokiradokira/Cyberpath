import { test, expect } from "@playwright/test";
test("DNS sample supports prediction, stale answers, expiry and negative caching", async ({
  page,
}) => {
  await page.goto("/courses/dns-tcp-web");
  // Let the profile load and reading-position restoration finish before interacting.
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  const lab = page.getByRole("region", { name: "DNS cache investigation" });
  await expect(
    page.getByRole("heading", { name: "Technical Goals", exact: true }),
  ).toBeVisible();
  await expect(
    lab.getByRole("button", { name: "执行 DNS 查询" }),
  ).toBeDisabled();
  const query = async (value: string) => {
    await lab.getByLabel("预测下一次答案").selectOption(value);
    await lab.getByRole("button", { name: "执行 DNS 查询" }).click();
  };
  await query("192.0.2.10");
  await expect(lab.getByRole("status")).toContainText("authority");
  await lab.getByRole("button", { name: "权威地址改为 .20" }).click();
  await lab.getByRole("button", { name: "时间前进 30 秒" }).click();
  await query("192.0.2.20");
  await expect(lab.getByRole("status")).toContainText("预测不符：192.0.2.10");
  await expect(lab.getByRole("status")).toContainText("t=60s");
  await lab.getByRole("button", { name: "时间前进 30 秒" }).click();
  await query("192.0.2.20");
  await expect(lab.getByRole("status")).toContainText("预测正确：192.0.2.20");
  await lab.getByRole("button", { name: "重置实验" }).click();
  await lab.getByRole("button", { name: "删除此名称" }).click();
  await query("NXDOMAIN");
  await lab.getByRole("button", { name: "权威地址改为 .20" }).click();
  await query("NXDOMAIN");
  await expect(lab.getByRole("status")).toContainText("cache");
  await lab.getByRole("button", { name: "时间前进 30 秒" }).click();
  await query("192.0.2.20");
  await expect(lab.getByRole("status")).toContainText("authority");
  const exercise = page.getByRole("region", { name: "Apply exercise" });
  await exercise
    .getByRole("button", {
      name: "Only the new address, because updates push to all caches",
      exact: true,
    })
    .click();
  await expect(exercise.getByRole("status")).toContainText(
    "does not invalidate",
  );
  await exercise
    .getByRole("button", {
      name: "The old address with 30 seconds remaining",
      exact: true,
    })
    .click();
  await expect(exercise.getByRole("status")).toContainText("Correct");
  await page.setViewportSize({ width: 375, height: 850 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(lab.getByRole("img")).toBeVisible();
  await page.getByRole("button", { name: "收藏 ttl", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "取消收藏 ttl", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});
