import { expect, it } from "vitest";
import { availableLessons, lessons } from "../src/content/lessons";
import { foundationsLessons } from "../src/content/lessons/foundations";
import { labInfo } from "../src/lib/labs";
import { courseSummaries } from "../src/content/course-summaries";
import { initialProgress, parseProgress, upgradeProgress } from "../src/lib/storage";

const expected = [
  { id: "how-computers-work", number: 4, lab: "cpu" },
  { id: "operating-systems-basics", number: 5, lab: "os" },
  { id: "linux-command-line", number: 6, lab: "terminal" },
] as const;

it("adds exactly three available foundations lessons after the published course", () => {
  expect(foundationsLessons).toHaveLength(3);
  expect(availableLessons).toHaveLength(6);
  for (const [index, meta] of expected.entries()) {
    const lesson = availableLessons.find((l) => l.id === meta.id)!;
    expect(lesson.number).toBe(meta.number);
    expect(lesson.available).toBe(true);
    expect(lesson.introducedIn).toBe(2);
    expect(lesson.category).toBeTruthy();
    expect(lesson.title.length).toBeGreaterThan(5);
    expect(lesson.zh).toMatch(/[\u4e00-\u9fff]/);
    expect(lesson.labs).toEqual([meta.lab]);
    expect(labInfo[meta.lab as keyof typeof labInfo]?.title).toBeTruthy();
    expect(lesson.sections.length).toBeGreaterThanOrEqual(7);
    expect(lesson.quiz).toHaveLength(5);
    expect(lesson.exercises).toHaveLength(3);
    expect(lesson.vocabulary.length).toBeGreaterThanOrEqual(5);
    expect(lesson.commands.length).toBeGreaterThanOrEqual(3);
    // The new lessons must be reachable in display order, not appended at random.
    expect(lessons.findIndex((l) => l.id === meta.id)).toBe(3 + index);
  }
});

it("keeps previews behind the new lessons with stable metadata", () => {
  const previews = lessons.filter((l) => !l.available);
  expect(previews.map((l) => l.number)).toEqual([7, 8, 9, 10, 11]);
  expect(previews[0].id).toBe("security-fundamentals");
  expect(previews.at(-1)!.id).toBe("security-practice");
});

it("writes teaching depth with goals, cases, exercises and targeted feedback", () => {
  for (const lesson of foundationsLessons) {
    const words = lesson.sections
      .map((s) => s.text)
      .join(" ")
      .split(/\s+/).length;
    expect(words).toBeGreaterThan(850);
    expect(new Set(lesson.sections.map((s) => s.id)).size).toBe(
      lesson.sections.length,
    );
    for (const section of lesson.sections) {
      expect(section.id).toMatch(/^[a-z][a-z0-9-]+$/);
      expect(section.text.split(/\n\s*\n/).length).toBeGreaterThan(1);
    }
    expect(lesson.brief!.prerequisites.length).toBeGreaterThanOrEqual(3);
    expect(lesson.brief!.technicalGoals.length).toBeGreaterThanOrEqual(4);
    expect(lesson.brief!.englishGoals.length).toBeGreaterThanOrEqual(3);
    expect(lesson.brief!.completion).toMatch(/[\u4e00-\u9fff]/);
    expect(lesson.exercises!.map((e) => e.level)).toEqual([
      "Understand",
      "Apply",
      "Reason",
    ]);
    for (const exercise of lesson.exercises!) {
      expect(exercise.options).toHaveLength(4);
      expect(new Set(exercise.options).size).toBe(4);
      expect(exercise.feedback).toHaveLength(exercise.options.length);
      expect(exercise.answer).toBeGreaterThanOrEqual(0);
      expect(exercise.answer).toBeLessThan(exercise.options.length);
      for (const feedback of exercise.feedback)
        expect(feedback.length).toBeGreaterThan(25);
    }
    for (const question of lesson.quiz) {
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options).size).toBe(4);
      expect(question.explanation.length).toBeGreaterThan(40);
    }
    for (const term of lesson.vocabulary) {
      expect(term.zh).toMatch(/[\u4e00-\u9fff]/);
      expect(term.definition.length).toBeGreaterThan(20);
      expect(term.example!.length).toBeGreaterThan(20);
      expect(term.example!.toLowerCase()).toContain(
        term.word.split(" ")[0].toLowerCase(),
      );
    }
    expect(new Set(lesson.vocabulary.map((v) => v.zh)).size).toBe(
      lesson.vocabulary.length,
    );
  }
});

it("references the previous lesson in each prerequisite chain", () => {
  const [computers, os, linux] = foundationsLessons;
  expect(computers.brief!.prerequisites.join(" ")).toContain("Lesson 1");
  expect(os.brief!.prerequisites.join(" ")).toContain("Lesson 4");
  expect(linux.brief!.prerequisites.join(" ")).toContain("Lesson 5");
});

it("keeps a summary for every lesson in display order", () => {
  expect(courseSummaries).toHaveLength(lessons.length);
  for (const lesson of lessons) {
    expect(courseSummaries[lesson.number - 1]).toBeTruthy();
  }
});

it("upgrades an older saved profile without losing records", () => {
  const profile = initialProgress();
  expect(profile.contentVersion).toBe(2);
  profile.lessons["network-foundations"].completed = true;
  profile.lessons["network-foundations"].latest = 4;
  profile.lessons["network-foundations"].best = 4;
  profile.lessons["network-foundations"].incorrect = ["n1"];
  profile.notes["network-foundations"] = "keep me";
  profile.contentVersion = 1;
  for (const id of expected.map((e) => e.id)) delete profile.lessons[id];
  // An older archive is still valid before normalization.
  const upgraded = upgradeProgress(profile);
  expect(upgraded.contentVersion).toBe(2);
  expect(upgraded.lessons["how-computers-work"].visited).toBe(false);
  expect(upgraded.lessons["network-foundations"].completed).toBe(true);
  expect(upgraded.notes["network-foundations"]).toBe("keep me");
  expect(parseProgress(JSON.stringify(profile))).toEqual(upgraded);
  expect(() =>
    parseProgress(
      JSON.stringify({
        ...profile,
        contentVersion: 3,
      }),
    ),
  ).toThrow();
});
