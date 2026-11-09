import { it, expect } from "vitest";
import { reviewPosition, reviewIndex } from "../src/lib/review-queue";
it("can advance from a removed locked question to a single remaining word", () => {
  expect(reviewPosition(["protocol"], 0, "packet", true)).toMatchObject({
    current: "packet",
    canNext: true,
    canPrevious: true,
    finish: false,
  });
  expect(reviewIndex(["protocol"], 0, "packet", 1)).toBe(0);
});
it("allows explicit completion after the last answer and distinguishes initial empty state", () => {
  expect(reviewPosition([], 0, "packet", true).finish).toBe(true);
  expect(reviewPosition([], 0, null, true).complete).toBe(true);
  expect(reviewPosition([], 0, null, false).complete).toBe(false);
});
it("single retained item does not have meaningless navigation", () => {
  expect(reviewPosition(["packet"], 0, null, false)).toMatchObject({
    canNext: false,
    canPrevious: false,
  });
});
it("supports previous/next when the current item disappears from favorites or mastery filters", () => {
  expect(reviewIndex(["a", "c"], 1, "b", 1)).toBe(1);
  expect(reviewIndex(["a", "c"], 1, "b", -1)).toBe(0);
  expect(reviewIndex(["a", "b"], 1, null, 1)).toBe(0);
  expect(reviewIndex([], 0, "b", 1)).toBe(0);
});
