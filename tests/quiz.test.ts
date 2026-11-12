import { it, expect } from "vitest";
import { availableLessons, lessons } from "../src/content/lessons";
import { gradeQuiz } from "../src/lib/quiz";
it("provides six complete lessons and five metadata previews", () => {
  expect(availableLessons).toHaveLength(6);
  expect(lessons.filter((l) => !l.available)).toHaveLength(5);
  for (const l of availableLessons) {
    expect(l.sections.length).toBeGreaterThanOrEqual(6);
    expect(l.quiz).toHaveLength(5);
    expect(new Set(l.quiz.map((q) => q.id)).size).toBe(5);
    for (const q of l.quiz) {
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(q.options.length);
      expect(new Set(q.options).size).toBe(q.options.length);
    }
  }
});
it("scores every quiz and identifies mistakes", () => {
  for (const l of availableLessons) {
    const answers = Object.fromEntries(l.quiz.map((q) => [q.id, q.answer]));
    expect(gradeQuiz(l.quiz, answers)).toEqual({ score: 5, incorrect: [] });
    answers[l.quiz[0].id] = (l.quiz[0].answer + 1) % 4;
    expect(gradeQuiz(l.quiz, answers)).toEqual({
      score: 4,
      incorrect: [l.quiz[0].id],
    });
  }
});
it("rejects incomplete and out-of-range answers", () => {
  const q = availableLessons[0].quiz;
  expect(() => gradeQuiz(q, {})).toThrow();
  expect(() =>
    gradeQuiz(q, Object.fromEntries(q.map((x) => [x.id, 99]))),
  ).toThrow();
});
