import { test, expect } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { availableLessons } from "../../src/content/lessons";
import { readPersistedProfile } from "../support/persisted-profile";

// Local demo artifacts, ignored by Git; real interactions, not a fabricated animation reel.
test.use({ video: "on" });

test("navigation retains its shell, moves its indicator and reverses chapter expansion without stale state", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/courses");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  expect(
    await page
      .locator(".page-heading")
      .evaluate((e) => e.getAnimations().length),
  ).toBe(0);
  const nav = page.getByRole("navigation", { name: "主导航" });
  await nav.evaluate((e) => e.setAttribute("data-continuity", "kept"));
  const initial = await nav.evaluate(
    (e) => getComputedStyle(e, "::before").transform,
  );
  await nav.getByRole("link", { name: "互动实验", exact: true }).click();
  await expect(nav).toHaveAttribute("data-continuity", "kept");
  await expect(
    nav.getByRole("link", { name: "互动实验", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect
    .poll(() => nav.evaluate((e) => getComputedStyle(e, "::before").transform))
    .not.toBe(initial);
  await nav.getByRole("link", { name: "课程目录", exact: true }).click();
  const card = page.locator(".course-card").first();
  const start = card.getByRole("link");
  await start.focus();
  await expect
    .poll(() => card.evaluate((e) => getComputedStyle(e).transform))
    .not.toBe("none");
  await start.press("Enter");
  const summary = page.locator(".mobile-chapters summary"),
    details = page.locator(".mobile-chapters");
  const opened = await summary.evaluate((e) => {
    (e as HTMLElement).click();
    const d = e.closest("details")!;
    return {
      expanded: e.getAttribute("aria-expanded"),
      frames: d
        .getAnimations()
        .map((a) => (a.effect as KeyframeEffect).getKeyframes()),
    };
  });
  expect(opened.expanded).toBe("true");
  expect(opened.frames.flat().some((f) => f.height !== undefined)).toBe(true);
  await summary.evaluate((e) => (e as HTMLElement).click());
  await expect(summary).toHaveAttribute("aria-expanded", "false");
  await expect(details).not.toHaveAttribute("open");
  await summary.press("Enter");
  await page
    .getByRole("navigation", { name: "手机章节目录" })
    .getByRole("link")
    .nth(1)
    .click();
  await expect(page).toHaveURL(/#devices-and-communication$/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("vocabulary entrance, inert exit and interrupted reopening preserve focus and reading geometry", async ({
  page,
}, testInfo) => {
  await page.goto("/courses/dns-tcp-web");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  const term = page
    .locator("#english-goals")
    .locator("..")
    .getByRole("button", { name: "解释 expire", exact: true });
  await term.scrollIntoViewIfNeeded();
  const sample = await term.evaluate(async (e) => {
    const brief = document.querySelector(".learning-brief")!;
    const height = brief.getBoundingClientRect().height;
    const supported =
      PerformanceObserver.supportedEntryTypes.includes("layout-shift");
    let shift = 0;
    const observer = supported
      ? new PerformanceObserver((list) => {
          for (const item of list.getEntries())
            shift += (item as PerformanceEntry & { value: number }).value;
        })
      : null;
    observer?.observe({ type: "layout-shift" });
    const start = performance.now();
    (e as HTMLElement).click();
    await new Promise(requestAnimationFrame);
    const panel = document.querySelector(".term-definition")!;
    const animations = panel.getAnimations();
    const nextFrameMs = performance.now() - start;
    const runningDuringEntrance = document
      .getAnimations()
      .filter((a) => a.playState === "running").length;
    const expandedDuringMotion = e.getAttribute("aria-expanded");
    await Promise.allSettled(animations.map((a) => a.finished));
    observer?.disconnect();
    return {
      nextFrameMs,
      expandedDuringMotion,
      animations: animations.length,
      durations: animations.map((a) => a.effect?.getTiming().duration),
      expectedDuration: (() => {
        const raw = getComputedStyle(e)
          .getPropertyValue("--motion-state")
          .trim();
        return parseFloat(raw) * (raw.endsWith("ms") ? 1 : 1000);
      })(),
      heightDelta: brief.getBoundingClientRect().height - height,
      layoutShiftScore: supported ? shift : null,
      viewport: innerWidth,
      runningDuringEntrance,
      runningAfterEntrance: document
        .getAnimations()
        .filter((a) => a.playState === "running").length,
    };
  });
  expect(sample.expandedDuringMotion).toBe("true");
  expect(sample.animations).toBeGreaterThan(0);
  expect(
    sample.durations.every((duration) => duration === sample.expectedDuration),
  ).toBe(true);
  expect(sample.heightDelta).toBe(0);
  if (sample.layoutShiftScore !== null)
    expect(sample.layoutShiftScore).toBeLessThanOrEqual(0.01);
  const samplePath = testInfo.outputPath("motion-performance.json");
  await writeFile(samplePath, JSON.stringify(sample, null, 2));
  await testInfo.attach("motion-performance-sample", {
    path: samplePath,
    contentType: "application/json",
  });
  const detail = page.getByRole("region", { name: "expire 词汇解释" });
  await detail
    .getByRole("button", { name: "收藏 expire", exact: true })
    .click();
  const exitFrames = await detail
    .getByRole("button", { name: "收起解释" })
    .evaluate((e) => {
      e.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
      return document
        .querySelector(".term-definition")!
        .getAnimations()
        .flatMap((a) =>
          (a.effect as KeyframeEffect).getKeyframes().map((f) => f.opacity),
        );
    });
  expect(exitFrames[exitFrames.length - 1]).toBe("0");
  await expect(detail).toHaveCount(0);
  await expect(term).toBeFocused();
  // Reopen while the visual exit may still be running; no old finish callback may remove the new panel.
  await term.press("Enter");
  await expect(detail).toBeVisible();
  await expect(
    detail.getByRole("button", { name: "取消收藏 expire", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(async () => (await readPersistedProfile(page))?.favorites)
    .toContain("expire");
  await detail.getByRole("button", { name: "收起解释" }).click();
  await expect(page.locator(".term-overlay")).toHaveCount(0);
});

test("DNS replay distinguishes upstream lookup from positive/negative cache hits and expiry", async ({
  page,
}, testInfo) => {
  await page.goto("/labs");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  const lab = page.getByRole("region", { name: "DNS cache investigation" });
  const query = async (value: string) => {
    await lab.getByLabel("预测下一次答案").selectOption(value);
    return lab
      .getByRole("button", { name: "执行 DNS 查询" })
      .evaluate(async (e) => {
        (e as HTMLElement).click();
        await new Promise(requestAnimationFrame);
        const marker = e.closest("section")!.querySelector(".dns-trace")!;
        return marker
          .getAnimations()
          .flatMap((a) =>
            (a.effect as KeyframeEffect).getKeyframes().map((f) => f.transform),
          );
      });
  };
  const miss = await query("192.0.2.10");
  expect(miss).toHaveLength(9);
  expect(miss.some((f) => String(f).includes("300px"))).toBe(true);
  await expect(lab.getByRole("status")).toContainText("authority");
  await lab
    .locator(".dns-trace")
    .evaluate((e) =>
      Promise.allSettled(e.getAnimations().map((a) => a.finished)),
    );
  await lab.getByRole("button", { name: "权威地址改为 .20" }).click();
  const hit = await query("192.0.2.10");
  expect(hit).toHaveLength(3);
  expect(hit.some((f) => String(f).includes("300px"))).toBe(false);
  await lab.getByRole("button", { name: "时间前进 30 秒" }).click();
  await lab.getByRole("button", { name: "时间前进 30 秒" }).click();
  await expect(lab.locator(".cache-badge")).toHaveAttribute(
    "data-state",
    "expired",
  );
  await query("192.0.2.20");
  await expect(lab.getByRole("status")).toContainText("预测正确：192.0.2.20");
  await lab.getByRole("button", { name: "重置实验" }).click();
  await lab.getByRole("button", { name: "删除此名称" }).click();
  await query("NXDOMAIN");
  await expect(lab.locator(".cache-badge")).toHaveAttribute(
    "data-state",
    "negative",
  );
  expect(await query("NXDOMAIN")).toHaveLength(3);
  await expect(lab.getByRole("status")).toContainText("NXDOMAIN · cache");
  await lab
    .getByRole("img")
    .screenshot({ path: testInfo.outputPath("dns-replay.png") });
  await expect
    .poll(() =>
      lab.evaluate(
        (e) =>
          e
            .getAnimations({ subtree: true })
            .filter((a) => a.playState === "running").length,
      ),
    )
    .toBe(0);
});

test("quiz pending feedback locks answers, rejects duplicate submission and keeps real history", async ({
  page,
}) => {
  const lesson = availableLessons[0];
  await page.goto(`/courses/${lesson.id}`);
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  const quiz = page.locator("#knowledge-check");
  const radio = quiz.locator("input").first();
  await radio.scrollIntoViewIfNeeded();
  const beforePress = await radio.boundingBox();
  await page.mouse.move(
    beforePress!.x + beforePress!.width / 2,
    beforePress!.y + beforePress!.height / 2,
  );
  await page.mouse.down();
  const duringPress = await radio.boundingBox();
  await page.mouse.up();
  expect(duringPress).toEqual(beforePress);
  for (let i = 0; i < lesson.quiz.length; i++)
    await quiz
      .locator("fieldset")
      .nth(i)
      .locator("input")
      .nth(
        i === 0
          ? (lesson.quiz[i].answer + 1) % lesson.quiz[i].options.length
          : lesson.quiz[i].answer,
      )
      .check();
  await expect(quiz.locator(".feedback")).toHaveCount(0);
  await readPersistedProfile(page);
  // Hold a real read transaction; release explicitly, never fake persistence or use a fixed sleep.
  await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const r = indexedDB.open("cyberpath.learning.v1", 1);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    let released = false;
    Object.assign(window, {
      releaseMotionGate: () => {
        released = true;
      },
    });
    const tx = db.transaction("meta", "readonly"),
      store = tx.objectStore("meta");
    const read = () => {
      const request = store.get("motion-test-keepalive");
      request.onsuccess = () => {
        if (!released) read();
      };
    };
    tx.oncomplete = () => db.close();
    read();
  });
  try {
    await quiz.getByRole("button", { name: "提交测验", exact: true }).click();
    await expect(
      quiz.getByRole("button", { name: "正在保存…", exact: true }),
    ).toBeDisabled();
    await expect(quiz.locator("form")).toHaveAttribute("aria-busy", "true");
    for (const input of await quiz.locator("input").all())
      await expect(input).toBeDisabled();
    await quiz
      .locator("form")
      .evaluate((e) => (e as HTMLFormElement).requestSubmit());
  } finally {
    await page.evaluate(() =>
      (
        window as unknown as { releaseMotionGate: () => void }
      ).releaseMotionGate(),
    );
  }
  await expect(quiz.getByRole("status")).toContainText("本次得分： 4 / 5");
  await expect(quiz.locator(".quiz-summary")).toBeFocused();
  await expect(quiz.locator(".feedback").first()).toContainText("回答错误");
  expect((await readPersistedProfile(page))?.lessons[lesson.id].latest).toBe(4);
  const count = await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve) => {
      const r = indexedDB.open("cyberpath.learning.v1", 1);
      r.onsuccess = () => resolve(r.result);
    });
    try {
      return await new Promise<number>((resolve) => {
        const r = db.transaction("history").objectStore("history").count();
        r.onsuccess = () => resolve(r.result);
      });
    } finally {
      db.close();
    }
  });
  expect(count).toBe(1);
  await quiz.getByRole("button", { name: "重新测验", exact: true }).click();
  await expect(quiz.locator("input").first()).toBeFocused();
  await expect(
    quiz.getByRole("button", { name: "提交测验", exact: true }),
  ).toBeDisabled();
});

test("reduced motion keeps every operation immediate without visual animation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/courses/dns-tcp-web");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  await page.setViewportSize({ width: 390, height: 844 });
  const summary = page.locator(".mobile-chapters summary");
  await summary.click();
  await expect(summary).toHaveAttribute("aria-expanded", "true");
  expect(
    await page
      .locator(".mobile-chapters")
      .evaluate((e) => e.getAnimations().length),
  ).toBe(0);
  await summary.click();
  await expect(page.locator(".mobile-chapters")).not.toHaveAttribute("open");
  const term = page
    .locator("#english-goals")
    .locator("..")
    .getByRole("button", { name: "解释 expire", exact: true });
  await term.click();
  const detail = page.getByRole("region", { name: "expire 词汇解释" });
  expect(await detail.evaluate((e) => e.getAnimations().length)).toBe(0);
  await detail.getByRole("button", { name: "收起解释" }).press("Escape");
  await expect(page.locator(".term-overlay")).toHaveCount(0);
  await expect(term).toBeFocused();
  const lab = page.getByRole("region", { name: "DNS cache investigation" });
  await lab.getByLabel("预测下一次答案").selectOption("192.0.2.10");
  await lab.getByRole("button", { name: "执行 DNS 查询" }).click();
  await expect(lab.getByRole("status")).toContainText("authority");
  expect(
    await lab.evaluate((e) => e.getAnimations({ subtree: true }).length),
  ).toBe(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
