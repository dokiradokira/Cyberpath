import { test, expect } from "@playwright/test";
import { availableLessons } from "../../src/content/lessons";
import { initialProgress } from "../../src/lib/storage";
const lesson = availableLessons[0];
test("real quizzes, historical errors, reviews, trends and backup roundtrip", async ({
  page,
}) => {
  await page.goto(`/courses/${lesson.id}`);
  const quiz = page.locator("#knowledge-check");
  for (const q of lesson.quiz)
    await quiz.locator(`input[name="${q.id}"][value="${q.answer}"]`).check();
  await quiz.getByRole("button", { name: "提交测验", exact: true }).click();
  await quiz.getByRole("button", { name: "重新测验", exact: true }).click();
  for (const [i, q] of lesson.quiz.entries())
    await quiz
      .locator(
        `input[name="${q.id}"][value="${i === 0 ? (q.answer + 1) % q.options.length : q.answer}"]`,
      )
      .check();
  await quiz.getByRole("button", { name: "提交测验", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("cyberpath.v1")!).study.history
            .length,
      ),
    )
    .toBe(2);
  await page.goto("/progress");
  await page.getByLabel("统计课程", { exact: true }).selectOption(lesson.id);
  const points = page
    .getByRole("group", { name: "测验正确率趋势图" })
    .getByRole("button");
  await expect(points).toHaveCount(2);
  await points.nth(0).focus();
  await points.nth(0).press("Enter");
  const item = page.getByRole("article", {
    name: `${lesson.id} ${lesson.quiz[0].id} 错题`,
    exact: true,
  });
  await item.getByRole("radio").nth(lesson.quiz[0].answer).check();
  await item.getByRole("button", { name: "提交错题练习", exact: true }).click();
  await expect(item.getByRole("status")).toContainText("复习回答正确");
  await expect(item).toBeVisible();
  await expect(points).toHaveCount(2);
  const before = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("cyberpath.v1")!),
  );
  expect(before.lessons[lesson.id]).toMatchObject({ latest: 4, best: 5 });
  expect(before.study.history).toHaveLength(3);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出 JSON", exact: true }).click();
  await downloadPromise;
  page.once("dialog", (d) => d.accept());
  await page
    .locator('input[type="file"]')
    .setInputFiles({
      name: "roundtrip.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(before)),
    });
  await expect(page.getByRole("status").last()).toContainText("导入成功");
  await page.reload();
  await expect(
    page.getByRole("group", { name: "测验正确率趋势图" }).getByRole("button"),
  ).toHaveCount(2);
  await page
    .getByLabel("统计课程", { exact: true })
    .selectOption(availableLessons[1].id);
  await expect(
    page.getByText("暂无真实测验历史，完成一次测验后即可查看趋势"),
  ).toBeVisible();
});
test("legacy summaries do not invent chart history and mobile charts remain accessible", async ({
  page,
}) => {
  const p = initialProgress();
  p.lessons[lesson.id].latest = 5;
  p.lessons[lesson.id].best = 5;
  p.favorites = ["packet"];
  await page.addInitScript((v) => {
    if (!sessionStorage.getItem("study-seed")) {
      localStorage.setItem("cyberpath.v1", JSON.stringify(v));
      sessionStorage.setItem("study-seed", "1");
    }
  }, p);
  await page.goto("/progress");
  await expect(
    page.getByText("暂无真实测验历史，完成一次测验后即可查看趋势"),
  ).toBeVisible();
  await page.goto(`/courses/${lesson.id}`);
  for (const q of lesson.quiz)
    await page
      .locator(`#knowledge-check input[name="${q.id}"][value="${q.answer}"]`)
      .check();
  await page.getByRole("button", { name: "提交测验", exact: true }).click();
  await expect(page.getByText("本次得分： 5 / 5")).toBeVisible();
  await page.goto("/progress");
  for (const width of [375, 768, 1280]) {
    await page.setViewportSize({ width, height: 850 });
    await expect(
      page.getByRole("group", { name: "测验正确率趋势图" }).getByRole("button"),
    ).toHaveCount(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.getByRole("button", { name: "切换深浅主题" }).click();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("cyberpath.v1")!).favorites,
    ),
  ).toContain("packet");
});
