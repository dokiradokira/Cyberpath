import { test, expect } from "@playwright/test";
test("small vocabulary controls show feedback and single-item navigation is disabled", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/vocabulary");
  await page.getByRole("button", { name: "切换英语挑战模式" }).click();
  await expect(page.getByRole("log")).toContainText("英语挑战模式");
  await page.getByLabel("搜索词汇").fill("packet");
  const save = page.getByRole("button", { name: "收藏 packet", exact: true });
  await save.focus();
  await page.keyboard.press("Enter");
  const saved = page.getByRole("button", {
    name: "取消收藏 packet",
    exact: true,
  });
  await expect(saved).toHaveAttribute("aria-pressed", "true");
  await expect(saved.locator("svg")).toHaveAttribute("fill", "currentColor");
  await page.getByLabel("学习状态", { exact: true }).selectOption("saved");
  await page.getByRole("button", { name: "闪卡复习", exact: true }).click();
  await expect(page.getByRole("button", { name: "上一个词" })).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "下一个词", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "显示释义", exact: true }).click();
  await expect(page.locator(".flashcard h3")).toHaveText("数据包");
  await page.getByRole("button", { name: "取消收藏", exact: true }).click();
  await expect(page.getByRole("log").last()).toContainText("已取消收藏");
  await expect(page.getByRole("status")).toContainText("没有匹配");
});
test("lab controls have observable results and reset is disabled until needed", async ({
  page,
}) => {
  await page.goto("/labs");
  const tcp = page.locator("#lab-tcp");
  await expect(tcp.getByRole("button", { name: "重置模拟" })).toBeDisabled();
  await tcp.getByRole("button", { name: "下一步", exact: true }).click();
  await expect(tcp.getByRole("button", { name: "重置模拟" })).toBeEnabled();
  await tcp.getByRole("button", { name: "上一步", exact: true }).click();
  await expect(tcp.getByRole("button", { name: "重置模拟" })).toBeDisabled();
  const subnet = page.locator("#lab-subnet");
  await subnet
    .getByRole("button", { name: "192.168.1.100/24", exact: true })
    .click();
  await expect(subnet.getByRole("log")).toHaveText("已计算 192.168.1.100/24");
  await subnet
    .getByRole("button", { name: "192.168.1.100/26", exact: true })
    .click();
  await expect(subnet.getByRole("log")).toHaveText("已计算 192.168.1.100/26");
  await expect(subnet.getByText("192.168.1.64", { exact: true })).toBeVisible();
});
