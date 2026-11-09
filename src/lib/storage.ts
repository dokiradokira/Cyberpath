import { availableLessons, vocabulary } from "../content/lessons";
import type { Progress, RecordEntry } from "../types";
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
  lessons: Object.fromEntries(
    availableLessons.map((l) => [l.id, emptyRecord()]),
  ),
  currentLesson: availableLessons[0].id,
  favorites: [],
  notes: {},
  theme: "dark",
  mode: "learning",
});
const obj = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null && !Array.isArray(x);
export function parseProgress(text: string): Progress {
  if (text.length > 1000000)
    throw new Error("File is too large (maximum 1 MB).");
  const x: unknown = JSON.parse(text);
  if (!obj(x) || x.version !== 1)
    throw new Error("Unsupported data version. Expected CyberPath schema 1.");
  const ids = availableLessons.map((l) => l.id),
    words = vocabulary.map((v) => v.word);
  if (
    !obj(x.lessons) ||
    !obj(x.notes) ||
    !ids.includes(String(x.currentLesson)) ||
    !["dark", "light"].includes(String(x.theme)) ||
    !["learning", "challenge"].includes(String(x.mode)) ||
    !Array.isArray(x.favorites) ||
    !x.favorites.every((w) => typeof w === "string" && words.includes(w))
  )
    throw new Error("Invalid learning data structure.");
  const clean = initialProgress();
  for (const lesson of availableLessons) {
    const r = x.lessons[lesson.id];
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
      !(
        r.section === "" || lesson.sections.some((s) => s.title === r.section)
      ) ||
      typeof r.updated !== "string" ||
      (r.updated !== "" && !Number.isFinite(Date.parse(r.updated)))
    )
      throw new Error("Invalid lesson record.");
    if (
      (r.latest === null) !== (r.best === null) ||
      (typeof r.latest === "number" &&
        typeof r.best === "number" &&
        r.best < r.latest) ||
      (typeof r.latest === "number" &&
        r.incorrect.length !== lesson.quiz.length - r.latest) ||
      (r.latest === null && r.incorrect.length !== 0)
    )
      throw new Error("Inconsistent quiz record.");
    clean.lessons[lesson.id] = {
      completed: r.completed,
      visited: r.visited,
      latest: r.latest as number | null,
      best: r.best as number | null,
      incorrect: [...r.incorrect] as string[],
      section: r.section,
      updated: r.updated,
    };
    const note = x.notes[lesson.id];
    if (note !== undefined && (typeof note !== "string" || note.length > 10000))
      throw new Error("Invalid note (maximum 10,000 characters).");
    if (typeof note === "string") clean.notes[lesson.id] = note;
  }
  clean.currentLesson = x.currentLesson as string;
  clean.theme = x.theme as Progress["theme"];
  clean.mode = x.mode as Progress["mode"];
  clean.favorites = [...new Set(x.favorites)] as string[];
  return clean;
}
export function readProgress(storage: Pick<Storage, "getItem">): {
  data: Progress;
  warning: string;
} {
  try {
    const text = storage.getItem(STORAGE_KEY);
    return {
      data: text ? parseProgress(text) : initialProgress(),
      warning: "",
    };
  } catch {
    return {
      data: initialProgress(),
      warning:
        "Saved data could not be read. Using a fresh session; import a backup if available.",
    };
  }
}
