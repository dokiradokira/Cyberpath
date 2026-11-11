import { test, expect } from "@playwright/test";
import { availableLessons } from "../../src/content/lessons";
import { initialProgress } from "../../src/lib/storage";

test("chapter navigation, reload resume and home continue retain progress without completion", async ({
  page,
}) => {
  const lesson = availableLessons[0],
    section = lesson.sections[1];
  await page.goto(`/courses/${lesson.id}`);
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  await page.getByRole("button", { name: "下一章节", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`#${section.id}$`));
  await expect(
    page.locator(`a[href="#${section.id}"][aria-current="location"]`).first(),
  ).toBeAttached();
  await expect
    .poll(() =>
      page.evaluate(
        (id) =>
          JSON.parse(localStorage.getItem("cyberpath.v1")!).lessons[id].section,
        lesson.id,
      ),
    )
    .toBe(section.id);
  // Remove the hash to exercise stored-position restoration rather than native anchor navigation.
  await page.evaluate(() => history.replaceState(null, "", location.pathname));
  await page.reload();
  await expect
    .poll(() =>
      page
        .locator(`#${section.id}`)
        .evaluate((e) => Math.abs(e.getBoundingClientRect().top - 96)),
    )
    .toBeLessThan(100);
  expect(
    await page.evaluate(
      (id) =>
        JSON.parse(localStorage.getItem("cyberpath.v1")!).lessons[id].completed,
      lesson.id,
    ),
  ).toBe(false);
  await page.getByRole("link", { name: "学习首页", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "继续学习", exact: true }),
  ).toHaveAttribute("href", `/courses/${lesson.id}#${section.id}`);
  await page.getByRole("link", { name: "继续学习", exact: true }).click();
  await page.getByRole("button", { name: "上一章节", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`#${lesson.sections[0].id}$`));
});

test("mobile chapter menu and old title backups preserve F01-F03 protection", async ({
  page,
}) => {
  const lesson = availableLessons[0],
    section = lesson.sections[2],
    p = initialProgress();
  p.lessons[lesson.id].section = section.title;
  p.notes[lesson.id] = "legacy note";
  await page.addInitScript((value) => {
    if (!sessionStorage.getItem("reading-seed")) {
      localStorage.setItem("cyberpath.v1", JSON.stringify(value));
      sessionStorage.setItem("reading-seed", "1");
    }
  }, p);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/courses/${lesson.id}`);
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  await page.locator(".mobile-chapters summary").click();
  await page
    .getByRole("navigation", { name: "手机章节目录" })
    .getByRole("link", { name: new RegExp(section.title) })
    .click();
  await expect(page).toHaveURL(new RegExp(`#${section.id}$`));
  await expect(
    page.getByLabel("记下你的理解，或想进一步探索的问题"),
  ).toHaveValue("legacy note");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("link", { name: "下一课： 2" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    availableLessons[1].title,
  );
  await expect(page.getByRole("button", { name: "提交测验" })).toBeDisabled();
});

test("manual scrolling records the active section and resumes with its hash retained", async ({
  page,
}) => {
  const lesson = availableLessons[1],
    section = lesson.sections[2];
  await page.goto(`/courses/${lesson.id}`);
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  await page.locator(`#${section.id}`).evaluate((element) => {
    history.replaceState(null, "", `#${element.id}`);
    window.scrollTo({
      top:
        window.scrollY +
        element.getBoundingClientRect().top +
        element.getBoundingClientRect().height * 0.35 -
        96,
      behavior: "instant",
    });
  });
  await expect
    .poll(() =>
      page.evaluate(
        (id) =>
          JSON.parse(localStorage.getItem("cyberpath.v1")!).lessons[id].section,
        lesson.id,
      ),
    )
    .toBe(section.id);
  await expect
    .poll(() =>
      page.evaluate(
        (id) =>
          JSON.parse(localStorage.getItem("cyberpath.v1")!).lessons[id]
            .sectionProgress,
        lesson.id,
      ),
    )
    .toBeGreaterThan(0.2);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  await expect
    .poll(() =>
      page
        .locator(`#${section.id}`)
        .evaluate(
          (e) =>
            (96 - e.getBoundingClientRect().top) /
            e.getBoundingClientRect().height,
        ),
    )
    .toBeGreaterThan(0.2);
  expect(
    await page.evaluate(
      (id) =>
        JSON.parse(localStorage.getItem("cyberpath.v1")!).lessons[id].completed,
      lesson.id,
    ),
  ).toBe(false);
});
