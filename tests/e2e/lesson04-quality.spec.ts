import { test, expect } from "@playwright/test";

test("Lesson 04 exposes corrected vocabulary and a free-response explanation task", async ({
  page,
}) => {
  await page.goto("/courses/how-computers-work");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");

  const term = page.getByRole("button", { name: "解释 program counter" }).first();
  await term.scrollIntoViewIfNeeded();
  await term.click();
  const dialog = page.getByRole("dialog", { name: "词汇详情" });
  await expect(dialog).toContainText("程序计数器");
  await expect(dialog).toContainText("address of the next instruction");
  await page.getByRole("button", { name: "收起解释" }).click();

  const explain = page.getByRole("region", { name: "Explain exercise" });
  await expect(explain).toContainText(
    /working set[\s\S]*fits entirely in RAM/,
  );
  await explain.getByLabel("Your explanation").fill(
    "It may miss cache and wait on memory latency, even though no paging occurs.",
  );
  await explain
    .getByRole("button", { name: "Show reference explanation" })
    .click();
  await expect(explain).toContainText("Fitting in RAM removes the need to page");
  await expect(explain).toContainText("Common pitfalls");
});

test("quiz h2 gives targeted feedback for the memory-pressure misconception", async ({
  page,
}) => {
  await page.goto("/courses/how-computers-work");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");

  const choices: [string, string][] = [
    ["Fetch, decode, execute, write back", "h1"],
    ["It keeps recently used data closer to the processor than RAM", "h3"],
    ["A program is a file on storage; a process is a running instance with memory and state", "h4"],
    ["CPU time", "h5"],
  ];
  for (const [name] of choices) {
    await page.getByRole("radio", { name, exact: true }).check();
  }
  await page
    .getByRole("radio", {
      name: "High memory use alone proves swapping, so no further evidence is needed",
      exact: true,
    })
    .check();

  await page.getByRole("button", { name: "提交测验" }).click();
  const h2 = page
    .locator("fieldset")
    .filter({ hasText: "Windows laptop feels slow" });
  await expect(h2.locator(".feedback")).toContainText(
    "95% used memory may be cache",
  );
  await expect(h2.locator(".feedback")).toContainText("page-fault and disk evidence");
});

test("CPU lab explains the stored-program simplification and is shared by course and lab centre", async ({
  page,
}) => {
  await page.goto("/labs#lab-cpu");
  const lab = page.locator("#lab-cpu");
  await expect(lab).toContainText("Teaching model, not a full CPU");
  await expect(lab).toContainText("not one shared address space");
  await expect(lab).toContainText("folded into execute");
  await lab.getByRole("button", { name: "单步执行" }).click();
  await expect(lab).toContainText("phase=decode");

  await page.goto("/courses/how-computers-work#lab-cpu");
  await expect(page.locator("#lab-cpu")).toContainText(
    "Teaching model, not a full CPU",
  );
});

test("Lesson 04 remains usable at 390px with the explanation task open", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/courses/how-computers-work");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  const explain = page.getByRole("region", { name: "Explain exercise" });
  await explain.scrollIntoViewIfNeeded();
  await explain
    .getByRole("button", { name: "Show reference explanation" })
    .click();
  await expect(explain).toContainText("Compare your answer with the reference");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
