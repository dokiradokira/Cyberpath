import type { Progress, QuizAttempt, AnswerSnapshot } from "../types";
import { parseProgress } from "./storage";
import { parseStudy } from "./study";
export const MAX_BACKUP_BYTES = 64 * 1024 * 1024;
export function isCompatibilitySnapshot(text: string | null | undefined) {
  try {
    const x = JSON.parse(text ?? "null");
    return typeof x === "object" && x !== null && "historyStorage" in x;
  } catch {
    return false;
  }
}
export type Analytics = {
  topics: {
    lessonId: string;
    topicId: string;
    sectionId: string;
    total: number;
    errors: number;
    rate: number;
  }[];
  wrong: { lessonId: string; question: AnswerSnapshot }[];
};
export const emptyAnalytics = (): Analytics => ({ topics: [], wrong: [] });
export function aggregateAttempt(
  previous: Analytics,
  a: QuizAttempt,
): Analytics {
  const topics = new Map(
    previous.topics.map((t) => [`${t.lessonId}/${t.topicId}`, { ...t }]),
  );
  const wrong = new Map(
    previous.wrong.map((w) => [`${w.lessonId}/${w.question.id}`, w]),
  );
  for (const q of a.questions) {
    const key = `${a.lessonId}/${q.topicId}`,
      t = topics.get(key) ?? {
        lessonId: a.lessonId,
        topicId: q.topicId,
        sectionId: q.sectionId,
        total: 0,
        errors: 0,
        rate: 0,
      };
    t.total++;
    t.errors += q.correct ? 0 : 1;
    t.rate = Math.round((t.errors / t.total) * 100);
    topics.set(key, t);
    if (!q.correct)
      wrong.set(`${a.lessonId}/${q.id}`, { lessonId: a.lessonId, question: q });
  }
  return { topics: [...topics.values()], wrong: [...wrong.values()] };
}
export function profileOnly(p: Progress): Progress {
  const copy = { ...p };
  delete copy.study;
  return copy;
}
export function encodeBackup(profile: Progress, history: QuizAttempt[]) {
  return JSON.stringify({
    format: "cyberpath",
    version: 2,
    profile: profileOnly(profile),
    history,
  });
}
export function decodeBackup(text: string): {
  profile: Progress;
  history: QuizAttempt[];
} {
  if (new TextEncoder().encode(text).length > MAX_BACKUP_BYTES)
    throw new Error("备份超过 64 MB，请使用分档工具处理，当前数据未改变。");
  const x: unknown = JSON.parse(text);
  if (typeof x !== "object" || x === null || Array.isArray(x))
    throw new Error("备份结构不合法。");
  if (!("format" in x)) {
    const p = parseProgress(text);
    return { profile: profileOnly(p), history: p.study?.history ?? [] };
  }
  if (
    x.format !== "cyberpath" ||
    !("version" in x) ||
    x.version !== 2 ||
    !("profile" in x) ||
    !("history" in x) ||
    !Array.isArray(x.history)
  )
    throw new Error("不兼容的备份版本。");
  const profile = parseProgress(JSON.stringify(x.profile));
  if (profile.study !== undefined)
    throw new Error("新备份档案不得嵌入第二份历史。");
  const history = parseStudy({ version: 1, history: x.history }).history;
  const ids = new Set<string>();
  for (const a of history) {
    if (ids.has(a.id)) throw new Error("历史 ID 重复。");
    ids.add(a.id);
  }
  return { profile, history };
}
