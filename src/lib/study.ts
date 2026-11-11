import { availableLessons } from "../content/lessons";
import type { AnswerSnapshot, Lesson, Progress, QuizAttempt } from "../types";
import { gradeQuiz } from "./quiz";

// Stable question IDs explicitly mapped to existing stable chapter IDs.
export const topicSections: Record<string, string> = {
  n1: "what-is-a-network",
  n2: "ip-addresses-and-routers",
  n3: "ports-identify-services",
  n4: "lan-and-wan",
  n5: "practical-experiment",
  w1: "dns-records",
  w2: "tcp-handshake",
  w3: "browser-request",
  w4: "https-tls",
  w5: "dns-lookup",
  i1: "private-addresses",
  i2: "subnet-cidr",
  i3: "host-addresses",
  i4: "nat-pat",
  i5: "nat-firewall",
};
export function makeAttempt(
  lesson: Lesson,
  answers: Record<string, number>,
  kind: QuizAttempt["kind"],
  id: string,
  at: string,
  subset?: AnswerSnapshot[],
): QuizAttempt {
  const qs = subset ?? lesson.quiz;
  const result = gradeQuiz(qs, answers);
  return {
    id,
    at,
    kind,
    lessonId: lesson.id,
    score: result.score,
    total: qs.length,
    questions: qs.map((q, index) => ({
      ...q,
      options: [...q.options],
      topicId: subset?.[index]?.topicId ?? topicSections[q.id],
      sectionId: subset?.[index]?.sectionId ?? topicSections[q.id],
      selected: answers[q.id],
      correct: answers[q.id] === q.answer,
    })),
  };
}
// The durable repository owns capacity; this model keeps every record it is
// given and only guards against duplicate IDs.
export function saveAttempt(p: Progress, a: QuizAttempt): Progress {
  const history = p.study?.history ?? [];
  if (history.some((x) => x.id === a.id)) return p;
  const old = p.lessons[a.lessonId];
  return {
    ...p,
    study: { version: 1, history: [...history, a] },
    lessons:
      a.kind === "review"
        ? p.lessons
        : {
            ...p.lessons,
            [a.lessonId]: {
              ...old,
              latest: a.score,
              best: Math.max(old.best ?? 0, a.score),
              incorrect: a.questions.filter((q) => !q.correct).map((q) => q.id),
              lastQuizAt: a.at,
              updated: a.at,
            },
          },
  };
}
export function scoreTrend(p: Progress, lessonId = "all") {
  return (p.study?.history ?? [])
    .filter(
      (a) =>
        a.kind === "quiz" && (lessonId === "all" || a.lessonId === lessonId),
    )
    .slice()
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
    .map((a) => ({ ...a, percent: Math.round((a.score / a.total) * 100) }));
}
export function weakTopics(p: Progress, lessonId = "all") {
  const groups = new Map<
    string,
    {
      lessonId: string;
      topicId: string;
      sectionId: string;
      total: number;
      errors: number;
      rate: number;
    }
  >();
  for (const a of p.study?.history ?? [])
    if (lessonId === "all" || a.lessonId === lessonId)
      for (const q of a.questions) {
        const key = `${a.lessonId}/${q.topicId}`;
        const g = groups.get(key) ?? {
          lessonId: a.lessonId,
          topicId: q.topicId,
          sectionId: q.sectionId,
          total: 0,
          errors: 0,
          rate: 0,
        };
        g.total++;
        g.errors += q.correct ? 0 : 1;
        g.rate = Math.round((g.errors / g.total) * 100);
        groups.set(key, g);
      }
  return [...groups.values()].sort(
    (a, b) => b.rate - a.rate || b.total - a.total,
  );
}
export function wrongQuestions(p: Progress, lessonId = "all", topic = "all") {
  const result = new Map<
    string,
    { lessonId: string; question: AnswerSnapshot }
  >();
  for (const l of availableLessons)
    for (const q of l.quiz)
      if (p.lessons[l.id].incorrect.includes(q.id))
        result.set(`${l.id}/${q.id}`, {
          lessonId: l.id,
          question: {
            ...q,
            topicId: topicSections[q.id],
            sectionId: topicSections[q.id],
            selected: -1,
            correct: false,
          },
        });
  for (const a of p.study?.history ?? [])
    for (const q of a.questions)
      if (!q.correct)
        result.set(`${a.lessonId}/${q.id}`, {
          lessonId: a.lessonId,
          question: q,
        });
  return [...result.values()].filter(
    (r) =>
      (lessonId === "all" || r.lessonId === lessonId) &&
      (topic === "all" || r.question.topicId === topic),
  );
}
export function completion(p: Progress) {
  const total = availableLessons.length,
    done = availableLessons.filter((l) => p.lessons[l.id].completed).length;
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}

const obj = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null && !Array.isArray(x);
const str = (x: unknown, max = 2000): x is string =>
  typeof x === "string" && x.length > 0 && x.length <= max;
const time = (x: unknown): x is string =>
  str(x, 50) && Number.isFinite(Date.parse(x));
export function parseStudy(x: unknown): NonNullable<Progress["study"]> {
  const fail = () => {
    throw new Error("测验历史格式或版本不兼容，原始记录已保留。");
  };
  if (!obj(x) || x.version !== 1 || !Array.isArray(x.history)) return fail();
  const history: QuizAttempt[] = [],
    ids = new Set<string>();
  for (const a of x.history) {
    if (
      !obj(a) ||
      !str(a.id, 100) ||
      !str(a.lessonId, 100) ||
      !availableLessons.some((l) => l.id === a.lessonId) ||
      !time(a.at) ||
      (a.kind !== "quiz" && a.kind !== "review") ||
      !Array.isArray(a.questions) ||
      a.questions.length < 1 ||
      a.questions.length > 50 ||
      a.total !== a.questions.length ||
      !Number.isInteger(a.score) ||
      ids.has(a.id)
    )
      return fail();
    const questions: AnswerSnapshot[] = [];
    for (const q of a.questions) {
      if (
        !obj(q) ||
        !str(q.id, 100) ||
        !str(q.topicId, 100) ||
        !str(q.sectionId, 100) ||
        !str(q.prompt) ||
        !str(q.explanation) ||
        !Array.isArray(q.options) ||
        q.options.length < 2 ||
        q.options.length > 10 ||
        !q.options.every((v) => str(v)) ||
        typeof q.answer !== "number" ||
        !Number.isInteger(q.answer) ||
        q.answer < 0 ||
        q.answer >= q.options.length ||
        typeof q.selected !== "number" ||
        !Number.isInteger(q.selected) ||
        q.selected < 0 ||
        q.selected >= q.options.length ||
        typeof q.correct !== "boolean" ||
        q.correct !== (q.answer === q.selected) ||
        questions.some((v) => v.id === q.id)
      )
        return fail();
      questions.push({
        id: q.id,
        topicId: q.topicId,
        sectionId: q.sectionId,
        prompt: q.prompt,
        explanation: q.explanation,
        options: [...q.options] as string[],
        answer: q.answer,
        selected: q.selected,
        correct: q.correct,
      });
    }
    if (questions.filter((q) => q.correct).length !== a.score) return fail();
    ids.add(a.id);
    history.push({
      id: a.id,
      lessonId: a.lessonId,
      kind: a.kind,
      at: a.at,
      score: a.score as number,
      total: questions.length,
      questions,
    });
  }
  return { version: 1, history };
}
