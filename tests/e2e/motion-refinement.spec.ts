import { test, expect } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { setTimeout as networkDelay } from "node:timers/promises";

test("navigation audit separates request, commit and visual readiness", async ({
  page,
}, testInfo) => {
  test.setTimeout(120000);
  await page.addInitScript(() => {
    const open = indexedDB.open;
    Object.assign(window, { auditDbOpens: 0 });
    indexedDB.open = function (...args) {
      Reflect.set(
        window,
        "auditDbOpens",
        Number(Reflect.get(window, "auditDbOpens")) + 1,
      );
      return open.apply(this, args);
    };
  });
  let latency = 0;
  await page.route("**/*", async (route) => {
    if (route.request().headers().rsc === "1" && latency)
      await networkDelay(latency); // Controlled network simulation, not UI synchronization.
    await route.continue();
  });
  const samples: {
    prefetchedBeforeClick: boolean;
    requestAfterClickCount: number;
    additionalDbOpens: number;
    [key: string]: unknown;
  }[] = [];
  for (const injectedRscMs of [0, 150])
    for (let run = 0; run < 3; run++) {
      latency = injectedRscMs;
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute(
        "data-hydrated",
        "true",
      );
      // Same workload before/after: read the landing page until network quiet, then first visit Vocabulary.
      await page.waitForLoadState("networkidle");
      const link = page
        .getByRole("navigation", { name: "主导航" })
        .locator('a[href="/vocabulary"]');
      await link.evaluate((e) => {
        const audit = {
          click: 0,
          commit: 0,
          feedback: 0,
          readable: 0,
          dbBefore: Number(Reflect.get(window, "auditDbOpens")),
        };
        Reflect.set(window, "routeAudit", audit);
        e.addEventListener(
          "click",
          () => {
            audit.click = performance.now();
            const observer = new MutationObserver(() => {
              if (
                !audit.feedback &&
                document.querySelector('[data-nav-pending="true"]')
              )
                audit.feedback = performance.now();
              if (
                !audit.commit &&
                document.querySelector("main h1")?.textContent === "词汇学习"
              ) {
                audit.commit = performance.now();
                observer.disconnect();
                const readable = () => {
                  const heading = document.querySelector("main .page-heading");
                  if (
                    heading &&
                    Number(getComputedStyle(heading).opacity) >= 0.75
                  )
                    audit.readable = performance.now();
                  else requestAnimationFrame(readable);
                };
                readable();
              }
            });
            observer.observe(document.documentElement, {
              subtree: true,
              attributes: true,
              childList: true,
              characterData: true,
            });
          },
          { once: true, capture: true },
        );
      });
      await link.click();
      await expect(
        page.getByRole("heading", { name: "词汇学习", exact: true }),
      ).toBeVisible();
      await expect
        .poll(() =>
          page.evaluate(() => Reflect.get(window, "routeAudit").readable),
        )
        .toBeGreaterThan(0);
      samples.push(
        await page.evaluate(
          ({ injectedRscMs, run }) => {
            const a = Reflect.get(window, "routeAudit") as {
              click: number;
              commit: number;
              feedback: number;
              readable: number;
              dbBefore: number;
            };
            const resources = performance.getEntriesByType(
              "resource",
            ) as PerformanceResourceTiming[];
            const rsc = resources.filter(
              (r) =>
                new URL(r.name).pathname === "/vocabulary" &&
                new URL(r.name).searchParams.has("_rsc"),
            );
            const after = rsc.filter((r) => r.startTime >= a.click);
            const responseEnd = Math.max(
              a.click,
              ...after.map((r) => r.responseEnd),
            );
            return {
              injectedRscMs,
              run,
              clickToCommitMs: a.commit - a.click,
              feedbackMs: a.feedback ? a.feedback - a.click : null,
              visualTailMs: a.readable - a.commit,
              requestAfterClickCount: after.length,
              responseWaitMs: responseEnd - a.click,
              postResponseCommitMs: Math.max(0, a.commit - responseEnd),
              prefetchedBeforeClick: rsc.some(
                (r) => r.responseEnd > 0 && r.responseEnd < a.click,
              ),
              additionalDbOpens:
                Number(Reflect.get(window, "auditDbOpens")) - a.dbBefore,
            };
          },
          { injectedRscMs, run },
        ),
      );
    }
  const output = testInfo.outputPath("navigation-audit.json");
  await writeFile(
    output,
    JSON.stringify({ project: testInfo.project.name, samples }, null, 2),
  );
  await testInfo.attach("navigation-audit", {
    path: output,
    contentType: "application/json",
  });
  expect(samples.every((s) => s.prefetchedBeforeClick)).toBe(true);
  expect(samples.every((s) => s.requestAfterClickCount === 0)).toBe(true);
  expect(samples.every((s) => s.additionalDbOpens === 0)).toBe(true);
});

test("exit final-frame stays transparent until React removes the panel", async ({
  page,
}) => {
  await page.goto("/courses/dns-tcp-web");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  const term = page
    .locator("#english-goals")
    .locator("..")
    .getByRole("button", { name: "解释 expire", exact: true });
  await term.click();
  const detail = page.getByRole("region", { name: "expire 词汇解释" });
  const finalFrame = await detail
    .getByRole("button", { name: "收起解释" })
    .evaluate((e) => {
      const panel = e.closest(".term-definition")!;
      (e as HTMLElement).click();
      const animation = panel.getAnimations()[0];
      animation.finish(); // Inspect the exact animation-finish / React-commit boundary, no sleep or hidden frame.
      return {
        opacity: Number(getComputedStyle(panel).opacity),
        fill: animation.effect!.getTiming().fill,
      };
    });
  expect(finalFrame.opacity).toBe(0);
  expect(finalFrame.fill).toBe("forwards");
  await expect(page.locator(".term-overlay")).toHaveCount(0);
  await expect(term).toBeFocused();
  await term.press("Enter");
  await detail
    .getByRole("button", { name: "收起解释" })
    .evaluate((e) => (e as HTMLElement).click());
  // Reopen without waiting for the 220ms exit; an old retained frame must not hide it.
  await term.evaluate((e) => (e as HTMLElement).click());
  await expect(detail).toBeVisible();
  await detail.evaluate((e) =>
    Promise.allSettled(
      e.getAnimations().map((animation) => animation.finished),
    ),
  );
  expect(
    await detail.evaluate((e) => Number(getComputedStyle(e).opacity)),
  ).toBe(1);
  await expect(term).toHaveAttribute("aria-expanded", "true");
  await detail.getByRole("button", { name: "收起解释" }).press("Escape");
  await expect(page.locator(".term-overlay")).toHaveCount(0);
  for (const word of ["cache", "resolve", "expire", "cache", "expire"]) {
    const next = page
      .locator("#english-goals")
      .locator("..")
      .getByRole("button", { name: `解释 ${word}`, exact: true });
    await next.click();
    const popup = page.getByRole("region", { name: `${word} 词汇解释` });
    await expect(popup).toBeVisible();
    await page.evaluate(() =>
      window.scrollBy({ top: 100, behavior: "instant" }),
    );
    const y = await page.evaluate(() => scrollY);
    await popup.getByRole("button", { name: "收起解释" }).press("Escape");
    await expect(next).toBeFocused();
    expect(await page.evaluate(() => scrollY)).toBeCloseTo(y, 0);
  }
  await expect(page.locator(".term-overlay")).toHaveCount(0);
});

test("uncached navigation reports pending immediately without showing the wrong page", async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/*", async (route) => {
    if (
      new URL(route.request().url()).pathname === "/vocabulary" &&
      route.request().headers().rsc === "1"
    )
      await gate;
    await route.continue();
  });
  try {
    await page.goto("/courses");
    await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
    const nav = page.getByRole("navigation", { name: "主导航" });
    await nav
      .locator('a[href="/vocabulary"]')
      .evaluate((e) => (e as HTMLElement).click());
    await expect(
      nav.locator('a[href="/vocabulary"] [data-nav-pending="true"]'),
    ).toHaveCount(1);
    await expect(
      page.getByRole("heading", { name: "课程目录", exact: true }),
    ).toBeVisible();
    await expect(nav.locator('a[href="/courses"]')).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(nav.locator('a[href="/vocabulary"]')).not.toHaveAttribute(
      "aria-current",
    );
  } finally {
    release();
  }
  await expect(
    page.getByRole("heading", { name: "词汇学习", exact: true }),
  ).toBeVisible();
  await expect(page.locator('[data-nav-pending="true"]')).toHaveCount(0);
});
