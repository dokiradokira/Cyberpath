import { expect, it } from "vitest";
import { initialProgress } from "../src/lib/storage";
import { availableLessons } from "../src/content/lessons";
import { makeAttempt } from "../src/lib/study";
import {
  decodeBackup,
  encodeBackup,
  aggregateAttempt,
  emptyAnalytics,
} from "../src/lib/history-backup";
const l = availableLessons[0],
  answers = Object.fromEntries(l.quiz.map((q) => [q.id, q.answer]));
it.each([0, 1, 100, 101, 1001])(
  "fully validates and roundtrips %i records without the legacy cap",
  (n) => {
    const history = Array.from({ length: n }, (_, i) =>
      makeAttempt(l, answers, "quiz", String(i), "2026-11-10T01:00:00Z"),
    );
    const p = initialProgress();
    p.favorites = ["packet"];
    p.notes[l.id] = "keep";
    const result = decodeBackup(encodeBackup(p, history));
    expect(result.history).toEqual(history);
    expect(result.profile).toEqual(p);
  },
);
it("accepts valid legacy archives and rejects corrupt/future/duplicate archives atomically", () => {
  expect(decodeBackup(JSON.stringify(initialProgress())).history).toEqual([]);
  const a = makeAttempt(l, answers, "quiz", "a", "2026-11-10T01:00:00Z");
  for (const text of [
    "{bad",
    JSON.stringify({ format: "cyberpath", version: 99 }),
    encodeBackup(initialProgress(), [a, a]),
  ])
    expect(() => decodeBackup(text)).toThrow();
});
it("decodes a legacy archive whose history exceeds the former 100-record cap", () => {
  const history = Array.from({ length: 101 }, (_, i) =>
    makeAttempt(l, answers, "quiz", `legacy-${i}`, "2026-11-10T01:00:00Z"),
  );
  const p = { ...initialProgress(), study: { version: 1 as const, history } };
  expect(decodeBackup(JSON.stringify(p)).history).toHaveLength(101);
});
it("incrementally preserves topic samples and historical mistakes", () => {
  const a = makeAttempt(
    l,
    { ...answers, [l.quiz[0].id]: 1 },
    "quiz",
    "a",
    "2026-11-10T01:00:00Z",
  );
  const stats = aggregateAttempt(
    aggregateAttempt(emptyAnalytics(), a),
    makeAttempt(l, answers, "quiz", "b", "2026-11-10T02:00:00Z"),
  );
  expect(
    stats.topics.find((t) => t.topicId === a.questions[0].topicId),
  ).toMatchObject({ total: 2, errors: 1, rate: 50 });
  expect(stats.wrong).toHaveLength(1);
});
