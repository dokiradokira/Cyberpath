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
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Welcome back." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Course library", exact: true }).click();
  await expect(page.getByText("Coming Soon", { exact: true })).toHaveCount(5);
  for (const slug of slugs) {
    await page.goto(`/courses/${slug}`);
    await expect(
      page.getByRole("heading", { name: "Knowledge Check", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Submit quiz" }),
    ).toBeDisabled();
  }
  await page
    .getByRole("link", { name: "Interactive labs", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your network sandbox." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "My progress", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Your progress, your pace." }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("quiz, completion, vocabulary, notes, and theme persist", async ({
  page,
}) => {
  await page.goto(`/courses/${slugs[0]}`);
  await page.getByRole("button", { name: "Submit quiz" }).waitFor();
  for (const [i, answer] of [0, 1, 2, 3, 0].entries()) {
    await page
      .locator("fieldset")
      .nth(i)
      .getByRole("radio")
      .nth(answer)
      .check();
  }
  await page.getByRole("button", { name: "Submit quiz" }).click();
  await expect(page.getByText("Your score: 5 / 5")).toBeVisible();
  await page.getByRole("button", { name: "Mark lesson complete" }).click();
  await page.getByRole("button", { name: "Save packet", exact: true }).click();
  await page
    .getByLabel("What clicked? What would you like to investigate?")
    .fill("A router forwards packets.");
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Completed", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Unsave packet", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByLabel("What clicked? What would you like to investigate?"),
  ).toHaveValue("A router forwards packets.");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.goto("/progress");
  await expect(page.getByText("A router forwards packets.")).toBeVisible();
  await expect(page.locator("tbody tr").first()).toContainText("Completed");
});
test("all four labs work", async ({ page }) => {
  await page.goto("/labs");
  const tcp = page.locator("#lab-tcp");
  await tcp.getByRole("button", { name: "Next Step", exact: true }).click();
  await expect(tcp.getByText(/SYN: the client/)).toBeVisible();
  await tcp.getByRole("button", { name: "Next Step", exact: true }).click();
  await tcp.getByRole("button", { name: "Next Step", exact: true }).click();
  await expect(tcp.getByText(/ACK: the client acknowledges/)).toBeVisible();
  await tcp.getByRole("button", { name: "Reset simulation" }).click();
  await expect(tcp.getByText(/Ready to connect/)).toBeVisible();
  const dns = page.locator("#lab-dns");
  await dns.getByRole("checkbox").check();
  await dns.getByRole("button", { name: "Next Step", exact: true }).click();
  await expect(dns.getByText(/cached IP address is returned/)).toBeVisible();
  const subnet = page.locator("#lab-subnet");
  await subnet
    .getByRole("button", { name: "192.168.1.100/26", exact: true })
    .click();
  await expect(subnet.getByText("192.168.1.64", { exact: true })).toBeVisible();
  await subnet.getByLabel("CIDR prefix").fill("33");
  await subnet.getByRole("button", { name: "Calculate" }).click();
  await expect(subnet.getByRole("alert")).toBeVisible();
  const nat = page.locator("#lab-nat");
  await nat.getByRole("button", { name: "Device 2" }).click();
  await expect(nat.locator("tr.highlight")).toContainText(
    "192.168.1.101:51000",
  );
  await nat.getByRole("button", { name: "Simulate return traffic" }).click();
  await expect(nat.getByRole("status")).toContainText("Device 2");
});
test("data export, validated import and reset confirmation", async ({
  page,
}) => {
  await page.goto("/progress");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON" }).click();
  expect((await download).suggestedFilename()).toBe("cyberpath-progress.json");
  await page.locator('input[type="file"]').setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":99}'),
  });
  await expect(page.getByRole("status")).toContainText(
    "Unsupported data version",
  );
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reset data" }).click();
  await expect(page.getByRole("status")).toContainText("Learning data reset");
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
            .getByRole("button", { name: "Toggle theme" })
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
  await page
    .getByRole("button", { name: "Toggle English challenge mode" })
    .click();
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
  await expect(page.getByRole("status")).toContainText("Import cancelled");
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
  await page.getByRole("button", { name: "Reset data" }).click();
  await expect(page.getByText("Imported note", { exact: true })).toBeVisible();
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Welcome back." }),
  ).toBeVisible();
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
