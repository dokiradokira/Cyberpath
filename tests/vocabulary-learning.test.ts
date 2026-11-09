import { expect, it } from "vitest";
import { wordEntries } from "../src/content/vocabulary";
import { initialProgress, parseProgress } from "../src/lib/storage";
import {
  reviewSummary,
  recordWord,
  toggleWord,
} from "../src/lib/vocabulary-learning";

it("retains immutable word identities and contextual examples independently of order", () => {
  const p = initialProgress();
  p.favorites = ["packet"];
  p.reviews.packet = { known: true, attempts: 2, correct: 1 };
  const restored = parseProgress(JSON.stringify(p));
  for (const w of [...wordEntries].reverse()) {
    expect(w.id).toBe(w.word);
    expect(w.example).not.toBe(w.definition);
    expect(w.example).toMatch(/[.!?]$/);
    if (w.id === "packet") {
      expect(restored.favorites).toContain(w.id);
      expect(restored.reviews[w.id]).toEqual(p.reviews.packet);
    }
  }
});
it("counts unique reviewed words and finishes a retained queue without cyclic repetition", () => {
  expect(reviewSummary(["packet", "protocol"], ["packet", "packet"])).toEqual({
    count: 1,
    allReviewed: false,
  });
  expect(reviewSummary(["packet", "protocol"], ["packet", "protocol"])).toEqual(
    { count: 2, allReviewed: true },
  );
  expect(reviewSummary([], [])).toEqual({ count: 0, allReviewed: false });
  expect(reviewSummary(["protocol"], ["packet"])).toEqual({
    count: 1,
    allReviewed: false,
  });
});
it("updates only the selected word and preserves completion, mode, notes and scores", () => {
  const p = initialProgress();
  p.notes[p.currentLesson] = "keep";
  p.lessons[p.currentLesson].completed = true;
  const known = recordWord(p, "packet", true);
  expect(known.reviews.packet).toEqual({
    known: true,
    attempts: 1,
    correct: 1,
  });
  const practice = recordWord(known, "packet", false);
  expect(practice.reviews.packet).toEqual({
    known: false,
    attempts: 2,
    correct: 1,
  });
  expect(practice.lessons).toBe(p.lessons);
  expect(practice.notes).toBe(p.notes);
  expect(practice.mode).toBe(p.mode);
  expect(parseProgress(JSON.stringify(practice))).toEqual(practice);
  expect(toggleWord(toggleWord(p, "packet"), "packet").favorites).toEqual([]);
  expect(recordWord(p, "unknown", true)).toBe(p);
});
