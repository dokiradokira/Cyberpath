import { it, expect } from "vitest";
import {
  initialProgress,
  parseProgress,
  readProgress,
} from "../src/lib/storage";
it("starts without fabricated achievements and round-trips", () => {
  const p = initialProgress();
  expect(
    Object.values(p.lessons).every(
      (l) => !l.completed && l.best === null && !l.visited,
    ),
  ).toBe(true);
  expect(parseProgress(JSON.stringify(p))).toEqual(p);
});
it("recovers from malformed or inaccessible localStorage", () => {
  expect(readProgress({ getItem: () => "{" }).warning).not.toBe("");
  expect(
    readProgress({
      getItem: () => {
        throw new Error("blocked");
      },
    }).data,
  ).toEqual(initialProgress());
  expect(readProgress({ getItem: () => null }).warning).toBe("");
});
it.each(["{}", "null", '{"version":2}', "[]"])(
  "rejects incompatible input %s",
  (s) => expect(() => parseProgress(s)).toThrow(),
);
it("rejects malformed scores, unknown favorites, sections and oversized notes", () => {
  const p = initialProgress();
  p.lessons[p.currentLesson].best = 8;
  expect(() => parseProgress(JSON.stringify(p))).toThrow();
  const f = initialProgress();
  f.favorites = ["<script>"];
  expect(() => parseProgress(JSON.stringify(f))).toThrow();
  const n = initialProgress();
  n.notes[n.currentLesson] = "x".repeat(10001);
  expect(() => parseProgress(JSON.stringify(n))).toThrow();
  const s = initialProgress();
  s.lessons[s.currentLesson].section = "unknown";
  expect(() => parseProgress(JSON.stringify(s))).toThrow();
});
it("rejects inconsistent quiz totals and strips unrecognized properties", () => {
  const p = initialProgress();
  p.lessons[p.currentLesson].latest = 5;
  expect(() => parseProgress(JSON.stringify(p))).toThrow();
  const input = {
    ...initialProgress(),
    unexpected: "text",
    notes: { __proto__: { polluted: true } },
  };
  expect(parseProgress(JSON.stringify(input))).not.toHaveProperty("unexpected");
  expect({}).not.toHaveProperty("polluted");
});
it("keeps note text inert and preserves preferences", () => {
  const p = initialProgress();
  p.notes[p.currentLesson] = "<script>alert(1)</script>";
  p.theme = "light";
  p.mode = "challenge";
  expect(parseProgress(JSON.stringify(p))).toEqual(p);
});

it("migrates legacy records without vocabulary reviews", () => {
  const p = initialProgress();
  const { reviews, ...legacy } = p;
  void reviews;
  expect(parseProgress(JSON.stringify(legacy)).reviews).toEqual({});
});
it("validates and round-trips word review records", () => {
  const p = initialProgress();
  p.reviews.packet = { known: true, attempts: 3, correct: 2 };
  p.favorites = ["router"];
  expect(parseProgress(JSON.stringify(p))).toEqual(p);
  p.reviews.packet.correct = 4;
  expect(() => parseProgress(JSON.stringify(p))).toThrow();
});
it("rejects hostile review shapes", () => {
  const p = initialProgress();
  expect(() => parseProgress(JSON.stringify({ ...p, reviews: [] }))).toThrow();
  expect(() =>
    parseProgress(
      JSON.stringify({
        ...p,
        reviews: { packet: { known: "yes", attempts: 1, correct: 1 } },
      }),
    ),
  ).toThrow();
});
