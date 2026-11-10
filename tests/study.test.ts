import { expect, it } from "vitest";
import { availableLessons } from "../src/content/lessons";
import {
  initialProgress,
  parseProgress,
  readProgress,
} from "../src/lib/storage";
import {
  makeAttempt,
  saveAttempt,
  scoreTrend,
  weakTopics,
  wrongQuestions,
  completion,
} from "../src/lib/study";
import { topicSections } from "../src/lib/study";
const l = availableLessons[0];
const answers = Object.fromEntries(l.quiz.map((q) => [q.id, q.answer]));
it("maps every existing question to an actual chapter or practical section", () => {
  for (const lesson of availableLessons)
    for (const q of lesson.quiz)
      expect(
        lesson.sections.some((s) => s.id === topicSections[q.id]) ||
          topicSections[q.id] === "practical-experiment",
      ).toBe(true);
});
it("migrates legacy summaries without manufacturing attempts, retaining vocabulary and notes", () => {
  const p = initialProgress();
  p.favorites = ["packet"];
  p.reviews.packet = { known: true, attempts: 1, correct: 1 };
  p.notes[l.id] = "keep";
  expect(parseProgress(JSON.stringify(p))).toEqual(p);
  expect(scoreTrend(parseProgress(JSON.stringify(p)))).toEqual(scoreTrend(p));
  expect(scoreTrend(p)).toEqual([]);
});
it("records first and repeated real quizzes, with latest distinct from best and stable snapshots", () => {
  const first = makeAttempt(l, answers, "quiz", "a", "2026-11-10T01:00:00Z");
  let p = saveAttempt(initialProgress(), first);
  const second = makeAttempt(
    l,
    {
      ...answers,
      [l.quiz[0].id]: (l.quiz[0].answer + 1) % l.quiz[0].options.length,
    },
    "quiz",
    "b",
    "2026-11-10T02:00:00Z",
  );
  p = saveAttempt(p, second);
  expect(p.lessons[l.id]).toMatchObject({
    latest: 4,
    best: 5,
    completed: false,
  });
  expect(scoreTrend(p).map((a) => a.percent)).toEqual([100, 80]);
  expect(saveAttempt(p, second)).toBe(p);
  expect(parseProgress(JSON.stringify(p))).toEqual(p);
});
it("keeps historic errors after a correct review, computes rates and course filters", () => {
  const bad = makeAttempt(
    l,
    {
      ...answers,
      [l.quiz[0].id]: (l.quiz[0].answer + 1) % l.quiz[0].options.length,
    },
    "quiz",
    "a",
    "2026-11-10T01:00:00Z",
  );
  let p = saveAttempt(initialProgress(), bad);
  const q = wrongQuestions(p)[0].question;
  p = saveAttempt(
    p,
    makeAttempt(
      l,
      { [q.id]: q.answer },
      "review",
      "r",
      "2026-11-10T02:00:00Z",
      [q],
    ),
  );
  expect(wrongQuestions(p)).toHaveLength(1);
  expect(weakTopics(p).find((t) => t.topicId === q.topicId)).toMatchObject({
    total: 2,
    errors: 1,
    rate: 50,
  });
  expect(scoreTrend(p)).toHaveLength(1);
  expect(scoreTrend(p, availableLessons[1].id)).toEqual([]);
  expect(p.lessons[l.id].latest).toBe(4);
  expect(weakTopics(parseProgress(JSON.stringify(p)))).toEqual(weakTopics(p));
});
it("rejects invalid snapshot fields, future history version and timestamp types", () => {
  const a = makeAttempt(l, answers, "quiz", "a", "2026-11-10T01:00:00Z");
  for (const fields of [
    { selected: [] },
    { correct: "true" },
    { options: {} },
    { answer: null },
    { topicId: 1 },
  ]) {
    const p = {
      ...initialProgress(),
      study: {
        version: 1,
        history: [
          {
            ...a,
            questions: [
              { ...a.questions[0], ...fields },
              ...a.questions.slice(1),
            ],
          },
        ],
      },
    };
    expect(() => parseProgress(JSON.stringify(p))).toThrow();
  }
  const p = initialProgress();
  Object.assign(p.lessons[l.id], { lastQuizAt: [] });
  expect(() => parseProgress(JSON.stringify(p))).toThrow();
});
it("does not silently discard history at capacity", () => {
  const p = initialProgress();
  p.study = {
    version: 1,
    history: Array.from({ length: 100 }, (_, i) =>
      makeAttempt(l, answers, "quiz", String(i), "2026-11-10T01:00:00Z"),
    ),
  };
  expect(() =>
    saveAttempt(
      p,
      makeAttempt(l, answers, "quiz", "new", "2026-11-10T01:00:00Z"),
    ),
  ).toThrow();
  expect(p.study.history).toHaveLength(100);
});
it("handles empty and single points and differing question totals", () => {
  const a = makeAttempt(l, answers, "quiz", "a", "2026-11-10T01:00:00Z");
  a.questions = a.questions.slice(0, 2);
  a.total = 2;
  a.score = 1;
  a.questions[0].selected =
    (a.questions[0].answer + 1) % a.questions[0].options.length;
  a.questions[0].correct = false;
  expect(scoreTrend(saveAttempt(initialProgress(), a))[0].percent).toBe(50);
  expect(completion(initialProgress())).toEqual({
    done: 0,
    total: 3,
    percent: 0,
  });
});
it("rejects malformed history atomically and protects the raw original", () => {
  const good = saveAttempt(
    initialProgress(),
    makeAttempt(l, answers, "quiz", "a", "2026-11-10T01:00:00Z"),
  );
  for (const study of [
    null,
    [],
    { version: 99, history: [] },
    { version: 1, history: [{ ...good.study!.history[0], score: 0 }] },
  ]) {
    const raw = JSON.stringify({ ...good, study });
    expect(() => parseProgress(raw)).toThrow();
    expect(readProgress({ getItem: () => raw }).raw).toBe(raw);
    expect(readProgress({ getItem: () => raw }).status).toBe("read-error");
  }
});
