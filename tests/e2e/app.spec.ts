import { test, expect } from "@playwright/test";
const slugs = ["network-foundations", "dns-tcp-web", "ip-subnets-nat"];
test("navigation, real lessons, previews, and error-free console", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  const nav = page.getByRole("navigation", { name: "主导航" });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "学习概览" })).toBeVisible();
  await nav.getByRole("link", { name: "课程目录", exact: true }).click();
  await expect(page.getByText("即将推出", { exact: true })).toHaveCount(5);
  for (const slug of slugs) {
    // Exercise the real course navigation. Replacing the document while Next is
    // prefetching makes WebKit report cancelled same-origin requests as page errors.
    await page.locator(`.course-card a[href="/courses/${slug}"]`).click();
    await expect(
      page.getByRole("heading", { name: "知识测验", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "提交测验" })).toBeDisabled();
    if (slug !== slugs.at(-1))
      await nav.getByRole("link", { name: "课程目录", exact: true }).click();
  }
  await page.getByRole("link", { name: "互动实验", exact: true }).click();
  await expect(page.getByRole("heading", { name: "互动实验" })).toBeVisible();
  await page.getByRole("link", { name: "学习进度", exact: true }).click();
  await expect(page.getByRole("heading", { name: "学习进度" })).toBeVisible();
  expect(errors).toEqual([]);
});
test("quiz, completion, vocabulary, notes, and theme persist", async ({
  page,
}) => {
  await page.goto(`/courses/${slugs[0]}`);
  await page.getByRole("button", { name: "提交测验" }).waitFor();
  for (const [i, answer] of [0, 1, 2, 3, 0].entries()) {
    await page
      .locator("fieldset")
      .nth(i)
      .getByRole("radio")
      .nth(answer)
      .check();
  }
  await page.getByRole("button", { name: "提交测验" }).click();
  await expect(page.getByText("本次得分： 5 / 5")).toBeVisible();
  await page.getByRole("button", { name: "标记课程完成" }).click();
  await page.getByRole("button", { name: "收藏 packet", exact: true }).click();
  await page
    .getByLabel("记下你的理解，或想进一步探索的问题")
    .fill("A router forwards packets.");
  await page.getByRole("button", { name: "切换深浅主题" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect
    .poll(() =>
      page.evaluate(
        () => JSON.parse(localStorage.getItem("cyberpath.v1")!).theme,
      ),
    )
    .toBe("light");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "已完成", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "取消收藏 packet", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByLabel("记下你的理解，或想进一步探索的问题"),
  ).toHaveValue("A router forwards packets.");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.goto("/progress");
  await expect(page.getByText("A router forwards packets.")).toBeVisible();
  await expect(page.locator("tbody tr").first()).toContainText("已完成");
});
test("all four labs work", async ({ page }) => {
  await page.goto("/labs");
  const tcp = page.locator("#lab-tcp");
  await tcp.getByRole("button", { name: "下一步", exact: true }).click();
  await expect(tcp.getByText(/SYN：客户端/)).toBeVisible();
  await tcp.getByRole("button", { name: "下一步", exact: true }).click();
  await tcp.getByRole("button", { name: "下一步", exact: true }).click();
  await expect(tcp.getByText(/ACK：客户端/)).toBeVisible();
  await tcp.getByRole("button", { name: "重置模拟" }).click();
  await expect(tcp.getByText(/准备连接/)).toBeVisible();
  const dns = page.locator("#lab-dns");
  await dns.getByRole("checkbox").check();
  await dns.getByRole("button", { name: "下一步", exact: true }).click();
  await expect(dns.getByText(/缓存的 IP 地址返回/)).toBeVisible();
  const subnet = page.locator("#lab-subnet");
  await subnet
    .getByRole("button", { name: "192.168.1.100/26", exact: true })
    .click();
  await expect(subnet.getByText("192.168.1.64", { exact: true })).toBeVisible();
  await subnet.getByLabel("CIDR 前缀").fill("33");
  await subnet.getByRole("button", { name: "计算" }).click();
  await expect(subnet.getByRole("alert")).toBeVisible();
  const nat = page.locator("#lab-nat");
  await nat.getByRole("button", { name: "设备 2" }).click();
  await expect(nat.locator("tr.highlight")).toContainText(
    "192.168.1.101:51000",
  );
  await nat.getByRole("button", { name: "模拟返回流量" }).click();
  await expect(nat.getByRole("status")).toContainText("设备 2");
});
test("data export, validated import and reset confirmation", async ({
  page,
}) => {
  await page.goto("/progress");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出 JSON" }).click();
  expect((await download).suggestedFilename()).toBe("cyberpath-progress.json");
  await page.locator('input[type="file"]').setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":99}'),
  });
  await expect(page.getByRole("status")).toContainText("不兼容的数据版本");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "重置学习数据" }).click();
  await expect(page.getByRole("status")).toContainText("学习数据已重置");
});
test("responsive widths have no document overflow", async ({ page }) => {
  for (const width of [375, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/courses",
      "/labs",
      "/progress",
      `/courses/${slugs[2]}`,
    ]) {
      await page.goto(route);
      await expect(page.locator("main")).not.toContainText(
        "Opening your learning space",
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        `${route} at ${width}px`,
      ).toBe(true);
      if (width <= 390)
        expect(
          (await page
            .getByRole("button", { name: "切换深浅主题" })
            .boundingBox())!.height,
        ).toBeGreaterThanOrEqual(44);
    }
  }
});

test("learning mode, valid imports, confirmations, and visual previews", async ({
  page,
}, testInfo) => {
  await page.goto(`/courses/${slugs[0]}`);
  const word = page.getByRole("button", { name: /^packet/ });
  await expect(word).toContainText("数据包");
  await page.getByRole("button", { name: "切换英语挑战模式" }).click();
  await expect(word).not.toContainText("数据包");
  await word.click();
  await expect(word).toContainText("数据包");
  await page.goto("/progress");
  const backup = await page.evaluate(() =>
    localStorage.getItem("cyberpath.v1")!,
  );
  const parsed = JSON.parse(backup);
  parsed.notes[slugs[0]] = "Imported note";
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.locator('input[type="file"]').setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(parsed)),
  });
  await expect(page.getByRole("status")).toContainText("已取消导入");
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator('input[type="file"]').setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(parsed)),
  });
  await expect(page.getByText("Imported note", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("Imported note", { exact: true })).toBeVisible();
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("button", { name: "重置学习数据" }).click();
  await expect(page.getByText("Imported note", { exact: true })).toBeVisible();
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "学习概览" })).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("dashboard.png"),
    fullPage: true,
  });
  await page.goto("/labs");
  await expect(page.locator("#lab-nat")).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("labs.png"),
    fullPage: true,
  });
});
