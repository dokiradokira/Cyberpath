import { test, expect } from "@playwright/test";

const lessons = [
  {
    slug: "how-computers-work",
    title: "How Computers Work",
    lab: "cpu",
  },
  {
    slug: "operating-systems-basics",
    title: "Operating Systems Basics",
    lab: "os",
  },
  {
    slug: "linux-command-line",
    title: "Linux and the Command Line",
    lab: "terminal",
  },
] as const;

test("foundations lessons expose goals, tiered practice and a registered lab", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const lesson of lessons) {
    await page.goto(`/courses/${lesson.slug}`);
    await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
    await expect(
      page.getByRole("heading", { name: lesson.title, level: 1 }),
    ).toBeVisible();
    await expect(page.locator(".learning-brief .learning-block")).toHaveCount(3);
    for (const level of ["Understand", "Apply", "Reason"]) {
      await expect(
        page.getByRole("region", { name: `${level} exercise` }),
      ).toHaveCount(1);
    }
    await expect(
      page.getByRole("link", { name: "在互动实验中心打开此实验" }),
    ).toHaveAttribute("href", `/labs#lab-${lesson.lab}`);
    await expect(page.locator(`#lab-${lesson.lab}`)).toHaveCount(1);
    await expect(
      page.getByRole("heading", { name: "知识测验", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "提交测验" })).toBeDisabled();
  }
  expect(errors).toEqual([]);
});

test("tiered practice gives per-option feedback", async ({ page }) => {
  await page.goto("/courses/operating-systems-basics");
  const exercise = page.getByRole("region", { name: "Understand exercise" });
  await exercise
    .getByRole("button", {
      name: "User mode runs applications with limited privilege; kernel mode performs protected operations",
      exact: true,
    })
    .click();
  await expect(exercise.getByRole("status")).toContainText("Correct");
  const wrong = page.getByRole("region", { name: "Reason exercise" });
  await wrong
    .getByRole("button", { name: "The CPU is permanently broken", exact: true })
    .click();
  await expect(wrong.getByRole("status")).toContainText("Try again");
  await expect(wrong.getByRole("status")).toContainText("reboot");
});

test("CPU lab executes the program and checks the prediction", async ({
  page,
}) => {
  await page.goto("/labs#lab-cpu");
  const lab = page.locator("#lab-cpu");
  await expect(lab).toBeVisible();
  await lab.getByLabel("Memory cell 10 value").fill("4");
  await lab.getByLabel("Memory cell 11 value").fill("6");
  await lab.getByLabel("Predict the stored result").fill("10");
  await lab.getByRole("button", { name: "单步执行" }).click();
  await expect(lab).toContainText("phase=decode");
  await lab.getByRole("button", { name: "运行到结束" }).click();
  await expect(lab.getByRole("status")).toContainText("Prediction correct: 10");
  await expect(lab).toContainText("memory[12]=10");
  await lab.getByRole("button", { name: "重置模拟" }).click();
  await expect(lab).toContainText("phase=fetch");
});

test("scheduler lab switches policy and reports waiting time", async ({
  page,
}) => {
  await page.goto("/labs#lab-os");
  const lab = page.locator("#lab-os");
  await lab.getByRole("button", { name: "Round Robin 时间片" }).click();
  await lab.getByRole("button", { name: "下一步" }).click();
  await lab.getByRole("button", { name: "运行到结束" }).click();
  await expect(lab.getByRole("status")).toContainText("First to finish");
  await expect(lab.getByRole("status")).toContainText("Average waiting time");
  await lab.getByLabel("预测先完成的进程").selectOption("p3");
});

test("terminal lab completes the missions without running real commands", async ({
  page,
}) => {
  await page.goto("/courses/linux-command-line");
  const lab = page.locator("#lab-terminal");
  const input = lab.getByLabel("输入命令");
  const commands = [
    "pwd",
    "ls -la",
    "mkdir -p ~/notes",
    "echo hello > ~/notes/today.txt",
    "cat ~/notes/today.txt",
    "chmod 600 ~/notes/today.txt",
  ];
  for (const command of commands) {
    await input.fill(command);
    await input.press("Enter");
  }
  await expect(lab).toContainText("4 / 4 个任务完成");
  await expect(lab.getByRole("log")).toContainText("hello");
  await lab.getByRole("button", { name: "重置实验" }).click();
  await expect(lab).toContainText("0 / 4 个任务完成");
});

test("foundations pages fit a narrow phone viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of [
    ...lessons.map((lesson) => `/courses/${lesson.slug}`),
    "/labs",
  ]) {
    await page.goto(route);
    await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `${route} overflows at 390px`,
    ).toBe(true);
  }
  await page.goto("/labs#lab-terminal");
  const input = page.locator("#lab-terminal").getByLabel("输入命令");
  await expect(input).toBeVisible();
  const box = await input.boundingBox();
  expect(box!.width).toBeGreaterThan(100);
});
