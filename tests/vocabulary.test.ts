import { it, expect } from "vitest";
import { wordEntries } from "../src/content/vocabulary";
import { availableLessons } from "../src/content/lessons";
it("has unique, bilingual terms with examples and real course links", () => {
  expect(wordEntries.length).toBeGreaterThanOrEqual(34);
  expect(new Set(wordEntries.map((w) => w.word)).size).toBe(wordEntries.length);
  expect(new Set(wordEntries.map((w) => w.zh)).size).toBe(wordEntries.length);
  for (const w of wordEntries) {
    expect(w.zh).toMatch(/[\u4e00-\u9fff]/);
    expect(w.definition.length).toBeGreaterThan(10);
    expect(w.example.length).toBeGreaterThan(10);
    expect(availableLessons.some((l) => l.id === w.lessonId)).toBe(true);
  }
});
