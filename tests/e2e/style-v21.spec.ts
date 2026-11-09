import { test, expect } from "@playwright/test";
import { availableLessons } from "../../src/content/lessons";
test("V2.1 restrained headings and bilingual course titles", async ({
  page,
}) => {
  for (const route of ["/", "/courses", "/labs", "/progress", "/vocabulary"]) {
    await page.goto(route);
    const heading = page.locator(".page-heading");
    await expect(heading.locator("h1")).toBeVisible();
    expect(await heading.locator("h1").innerText()).not.toMatch(
      /[。，！？,.!?]/,
    );
    await expect(
      heading.locator(".eyebrow,.header-pill,small,.badge"),
    ).toHaveCount(0);
    expect(await page.locator("body").innerText()).not.toMatch(
      /\p{Extended_Pictographic}/u,
    );
  }
  await page.goto("/courses");
  for (const lesson of availableLessons) {
    const card = page.locator(".course-card").filter({
      has: page.getByRole("heading", { name: lesson.title, exact: true }),
    });
    await expect(card.locator("h2")).toHaveText(lesson.title);
    await expect(card.locator(".chinese")).toHaveText(lesson.zh);
  }
  await page.setViewportSize({ width: 375, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: availableLessons[0].title,
      exact: true,
      level: 2,
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
