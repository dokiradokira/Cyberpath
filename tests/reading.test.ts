import { expect, it } from "vitest";
import { availableLessons } from "../src/content/lessons";
import { parseProgress, initialProgress } from "../src/lib/storage";
import { lessonHref, resolveSection } from "../src/lib/reading";

it("keeps explicit unique section IDs independent from their displayed titles", () => {
  for (const lesson of availableLessons) {
    expect(new Set(lesson.sections.map((s) => s.id)).size).toBe(
      lesson.sections.length,
    );
    for (const section of lesson.sections)
      expect(section.id).toMatch(/^[a-z][a-z0-9-]+$/);
  }
});
it("resolves stable IDs, legacy titles and legacy numeric anchors", () => {
  const lesson = availableLessons[0];
  expect(resolveSection(lesson, lesson.sections[1].id)?.id).toBe(
    lesson.sections[1].id,
  );
  expect(resolveSection(lesson, lesson.sections[1].title)?.id).toBe(
    lesson.sections[1].id,
  );
  expect(resolveSection(lesson, "section-1")?.id).toBe(lesson.sections[1].id);
  expect(resolveSection(lesson, "unknown")).toBeUndefined();
});
it("migrates old title bookmarks while retaining notes, scores and completion", () => {
  const progress = initialProgress(),
    lesson = availableLessons[0];
  progress.lessons[lesson.id].section = lesson.sections[1].title;
  progress.notes[lesson.id] = "keep my note";
  progress.lessons[lesson.id].latest = 4;
  progress.lessons[lesson.id].best = 5;
  progress.lessons[lesson.id].incorrect = [lesson.quiz[0].id];
  const parsed = parseProgress(JSON.stringify(progress));
  expect(parsed.lessons[lesson.id].section).toBe(lesson.sections[1].id);
  expect(parsed.lessons[lesson.id].completed).toBe(false);
  expect(parsed.notes).toEqual(progress.notes);
  expect(parsed.lessons[lesson.id].latest).toBe(4);
  expect(parsed.lessons[lesson.id].best).toBe(5);
});
it("continues at a valid section and rejects corrupt reading positions", () => {
  const lesson = availableLessons[0];
  expect(lessonHref(lesson, lesson.sections[1].id)).toBe(
    `/courses/${lesson.id}#${lesson.sections[1].id}`,
  );
  expect(lessonHref(lesson, "unknown")).toBe(`/courses/${lesson.id}`);
  for (const value of [-1, 2, "0.5", null, []]) {
    const p = initialProgress();
    Object.assign(p.lessons[lesson.id], { sectionProgress: value });
    expect(() => parseProgress(JSON.stringify(p))).toThrow();
  }
});
it("initializes a future lesson without discarding older records", () => {
  const old = initialProgress();
  delete old.contentVersion;
  old.notes[availableLessons[0].id] = "existing note";
  availableLessons.push({
    ...availableLessons[0],
    id: "future-four",
    number: 4,
    introducedIn: 2,
  });
  try {
    const restored = parseProgress(JSON.stringify(old));
    expect(restored.lessons["future-four"].visited).toBe(false);
    expect(restored.lessons["future-four"].completed).toBe(false);
    expect(restored.notes).toEqual(old.notes);
    expect(restored.contentVersion).toBe(2);
  } finally {
    availableLessons.pop();
  }
});
it("still rejects missing original records and invalid content revisions", () => {
  const old = initialProgress();
  delete old.lessons[availableLessons[0].id];
  expect(() => parseProgress(JSON.stringify(old))).toThrow();
  for (const contentVersion of [[], {}, "1", null, -1, 1.5, 999]) {
    expect(() =>
      parseProgress(JSON.stringify({ ...initialProgress(), contentVersion })),
    ).toThrow();
  }
});
