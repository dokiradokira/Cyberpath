import { wordEntries } from "../content/vocabulary";
import { availableLessons } from "../content/lessons";
import type { Progress, RecordEntry } from "../types";
import { resolveSection } from "./reading";
import { parseStudy } from "./study";
export const STORAGE_KEY = "cyberpath.v1";
export const emptyRecord = (): RecordEntry => ({
  completed: false,
  latest: null,
  best: null,
  incorrect: [],
  visited: false,
  section: "",
  updated: "",
});
export const initialProgress = (): Progress => ({
  version: 1,
  contentVersion: Math.max(
    1,
    ...availableLessons.map((l) => l.introducedIn ?? 1),
  ),
  lessons: Object.fromEntries(
    availableLessons.map((l) => [l.id, emptyRecord()]),
  ),
  currentLesson: availableLessons[0].id,
  favorites: [],
  reviews: {},
  notes: {},
  theme: "dark",
  mode: "learning",
});
const obj = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null && !Array.isArray(x);
export function parseProgress(text: string): Progress {
  if (text.length > 1000000) throw new Error("文件过大（最大 1 MB）。");
  const x: unknown = JSON.parse(text);
  if (!obj(x) || x.version !== 1)
    throw new Error("不兼容的数据版本，需要 CyberPath schema 1。");
  const ids = availableLessons.map((l) => l.id),
    words = wordEntries.map((v) => v.word);
  if (
    !obj(x.lessons) ||
    !obj(x.notes) ||
    typeof x.currentLesson !== "string" ||
    !ids.includes(x.currentLesson) ||
    (x.theme !== "dark" && x.theme !== "light") ||
    (x.mode !== "learning" && x.mode !== "challenge") ||
    !Array.isArray(x.favorites) ||
    !x.favorites.every((w) => typeof w === "string" && words.includes(w))
  )
    throw new Error("学习数据结构不合法。");
  const clean = initialProgress();
  const contentVersion = x.contentVersion === undefined ? 1 : x.contentVersion;
  if (
    typeof contentVersion !== "number" ||
    !Number.isSafeInteger(contentVersion) ||
    contentVersion < 1 ||
    contentVersion > (clean.contentVersion ?? 1)
  )
    throw new Error("不兼容的课程数据版本，原始记录已保留。");
  for (const lesson of availableLessons) {
    const r = x.lessons[lesson.id];
    // Only a genuinely newer lesson may be absent in a valid older backup.
    // Missing existing records remain an import error (F01 protection).
    if (r === undefined && (lesson.introducedIn ?? 1) > contentVersion)
      continue;
    const score = (s: unknown) =>
      s === null ||
      (typeof s === "number" &&
        Number.isInteger(s) &&
        s >= 0 &&
        s <= lesson.quiz.length);
    if (
      !obj(r) ||
      typeof r.completed !== "boolean" ||
      typeof r.visited !== "boolean" ||
      !score(r.latest) ||
      !score(r.best) ||
      !Array.isArray(r.incorrect) ||
      !r.incorrect.every(
        (id) => typeof id === "string" && lesson.quiz.some((q) => q.id === id),
      ) ||
      new Set(r.incorrect).size !== r.incorrect.length ||
      typeof r.section !== "string" ||
      !(r.section === "" || resolveSection(lesson, r.section)) ||
      (r.sectionProgress !== undefined &&
        (typeof r.sectionProgress !== "number" ||
          !Number.isFinite(r.sectionProgress) ||
          r.sectionProgress < 0 ||
          r.sectionProgress > 1)) ||
      typeof r.updated !== "string" ||
      (r.updated !== "" && !Number.isFinite(Date.parse(r.updated)))
    )
      throw new Error("课程记录不合法。");
    if (
      (r.latest === null) !== (r.best === null) ||
      (typeof r.latest === "number" &&
        typeof r.best === "number" &&
        r.best < r.latest) ||
      (typeof r.latest === "number" &&
        r.incorrect.length !== lesson.quiz.length - r.latest) ||
      (r.latest === null && r.incorrect.length !== 0)
    )
      throw new Error("测验成绩与错题记录不一致。");
    clean.lessons[lesson.id] = {
      completed: r.completed,
      visited: r.visited,
      latest: r.latest as number | null,
      best: r.best as number | null,
      incorrect: [...r.incorrect] as string[],
      section: resolveSection(lesson, r.section)?.id ?? "",
      ...(r.sectionProgress === undefined
        ? {}
        : { sectionProgress: r.sectionProgress as number }),
      updated: r.updated,
    };
    for (const field of [
      "lastVisitedAt",
      "lastQuizAt",
      "completedAt",
    ] as const) {
      const value = r[field];
      if (value !== undefined) {
        if (typeof value !== "string" || !Number.isFinite(Date.parse(value)))
          throw new Error("学习事件时间不合法。");
        clean.lessons[lesson.id][field] = value;
      }
    }
    const note = x.notes[lesson.id];
    if (note !== undefined && (typeof note !== "string" || note.length > 10000))
      throw new Error("笔记不合法（最多 10,000 字符）。");
    if (typeof note === "string") clean.notes[lesson.id] = note;
  }
  clean.currentLesson = x.currentLesson;
  clean.theme = x.theme;
  clean.mode = x.mode;
  clean.favorites = [...new Set(x.favorites)] as string[];
  if (x.reviews !== undefined) {
    if (!obj(x.reviews)) throw new Error("词汇复习数据格式错误。");
    for (const word of words) {
      const r = x.reviews[word];
      if (r === undefined) continue;
      if (
        !obj(r) ||
        typeof r.known !== "boolean" ||
        !Number.isSafeInteger(r.attempts) ||
        !Number.isSafeInteger(r.correct) ||
        Number(r.correct) < 0 ||
        Number(r.attempts) < Number(r.correct) ||
        Number(r.attempts) < 1
      )
        throw new Error("词汇复习数据格式错误。");
      clean.reviews[word] = {
        known: r.known,
        attempts: r.attempts as number,
        correct: r.correct as number,
      };
    }
  }
  if (x.study !== undefined) clean.study = parseStudy(x.study);
  return clean;
}
/**
 * Normalize a stored profile to the current content revision. Lessons that are
 * new in this revision gain empty records; existing records are validated, not
 * replaced.
 */
export function upgradeProgress(profile: Progress): Progress {
  return parseProgress(JSON.stringify(profile));
}
export type ReadResult = {
  data: Progress;
  warning: string;
  raw: string | null | undefined;
  status: "first-use" | "loaded" | "read-error";
};
export function readProgress(storage: Pick<Storage, "getItem">): ReadResult {
  let raw: string | null | undefined;
  try {
    raw = storage.getItem(STORAGE_KEY);
    return {
      data: raw === null ? initialProgress() : parseProgress(raw),
      warning: "",
      raw,
      status: raw === null ? "first-use" : "loaded",
    };
  } catch {
    return {
      data: initialProgress(),
      raw,
      status: "read-error",
      warning:
        "本机数据无法读取，原始记录已保护，暂用临时档案。请在学习进度页导出原始数据，确认前不会覆盖。",
    };
  }
}
