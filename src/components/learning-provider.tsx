"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import type { Progress, QuizAttempt } from "../types";
import { initialProgress, readProgress } from "../lib/storage";
import { HistoryRepository } from "../lib/history-repository";
import {
  profileOnly,
  encodeBackup,
  isCompatibilitySnapshot,
} from "../lib/history-backup";
type Store = {
  data: Progress;
  ready: boolean;
  warning: string;
  raw: string | null | undefined;
  revision: number;
  repository: HistoryRepository | null;
  replace: (p: Progress) => Promise<boolean>;
  exportAll: () => Promise<string>;
  recordAttempt: (a: QuizAttempt) => Promise<boolean>;
  update: (fn: (p: Progress) => Progress) => void;
};
const Context = createContext<Store | null>(null);
export function LearningProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(initialProgress),
    [ready, setReady] = useState(false),
    [warning, setWarning] = useState(""),
    [raw, setRaw] = useState<string | null | undefined>(),
    [revision, setRevision] = useState(0),
    [repository, setRepository] = useState<HistoryRepository | null>(null);
  const repo = useRef<HistoryRepository | null>(null),
    current = useRef(data),
    queue = useRef<Promise<unknown>>(Promise.resolve()),
    blocked = useRef(false),
    sequence = useRef(0);
  const legacyHistory = useRef<QuizAttempt[]>([]);
  const incompleteBackup = useRef(false);
  useEffect(() => {
    let active = true;
    const r = new HistoryRepository();
    repo.current = r;
    r.open()
      .then((p) => {
        if (active) {
          current.current = p;
          setData(p);
          setRepository(r);
          setRaw(r.raw);
          setWarning(r.mirrorWarning);
          setRevision(r.info().revision);
        }
      })
      .catch(() => {
        if (active) {
          const fallback = readProgress({
            getItem: (k) => window.localStorage.getItem(k),
          });
          current.current = profileOnly(fallback.data);
          legacyHistory.current = fallback.data.study?.history ?? [];
          incompleteBackup.current = isCompatibilitySnapshot(fallback.raw);
          setData(current.current);
          setRaw(fallback.raw);
          setWarning(
            (incompleteBackup.current
              ? "IndexedDB 历史不可用，兼容快照不是完整备份。请导入完整备份或检查存储后重试。"
              : fallback.warning) ||
              "IndexedDB 不可用，当前档案暂未保存，仍可阅读。请导出临时档案，检查浏览器存储后刷新重试。",
          );
          blocked.current = true;
        }
      })
      .finally(() => {
        if (active) {
          setReady(true);
          document.documentElement.dataset.hydrated = "true";
        }
      });
    return () => {
      active = false;
      r.close();
    };
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = data.theme;
  }, [data.theme]);
  const enqueue = useCallback(
    (fn: (r: HistoryRepository) => Promise<Progress>, seq: number) => {
      const job = queue.current
        .then(async () => {
          if (blocked.current || !repo.current)
            throw new Error(
              "存储已暂停，未保存。请先导出临时档案，再检查存储并刷新。",
            );
          const p = await fn(repo.current);
          if (sequence.current === seq) {
            current.current = p;
            setData(p);
          }
          setRevision(repo.current.info().revision);
          setWarning(repo.current.mirrorWarning);
          return true;
        })
        .catch((e: unknown) => {
          blocked.current = true;
          // Drop optimistic UI changes: IndexedDB still holds the previous
          // committed profile, so displaying unsaved values would contradict
          // the warning and could be mistaken for persisted progress.
          try {
            const saved = repo.current?.info();
            if (saved) {
              current.current = saved.profile;
              setData(saved.profile);
              setRevision(saved.revision);
            }
          } catch {
            /* no committed head yet, for example IndexedDB unavailable */
          }
          setWarning(
            `当前浏览器无法保存进度：${e instanceof Error ? e.message : "存储不可用或配额不足"}。原始记录已保护，操作未保存；请导出备份。`,
          );
          return false;
        });
      queue.current = job;
      return job;
    },
    [],
  );
  const update = useCallback(
    (fn: (p: Progress) => Progress) => {
      const seq = ++sequence.current;
      const next = fn(current.current);
      current.current = next;
      setData(next);
      void enqueue((r) => r.write(fn), seq);
    },
    [enqueue],
  );
  const recordAttempt = useCallback(
    (a: QuizAttempt) => {
      const seq = ++sequence.current;
      return enqueue((r) => r.append(a), seq);
    },
    [enqueue],
  );
  const replace = useCallback(async (p: Progress) => {
    await queue.current;
    if (!repo.current) return false;
    try {
      const next = await repo.current.replace(
        profileOnly(p),
        p.study?.history ?? [],
      );
      blocked.current = false;
      sequence.current++;
      current.current = next;
      setData(next);
      setRevision(repo.current.info().revision);
      setWarning(repo.current.mirrorWarning);
      return true;
    } catch (e) {
      setWarning(
        `替换失败，原档案已保留：${e instanceof Error ? e.message : "存储错误"}`,
      );
      return false;
    }
  }, []);
  const exportAll = useCallback(async () => {
    await queue.current;
    // Read the committed head so an unsaved optimistic edit cannot produce a
    // backup whose profile and history come from different revisions.
    if (repository) return repository.exportAll();
    if (incompleteBackup.current)
      throw new Error("兼容快照不能作为完整历史导出。");
    return encodeBackup(current.current, legacyHistory.current);
  }, [repository]);
  return (
    <Context.Provider
      value={{
        data,
        ready,
        warning,
        raw,
        revision,
        repository,
        update,
        replace,
        exportAll,
        recordAttempt,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useLearning() {
  const store = useContext(Context);
  if (!store) throw new Error("Missing learning provider");
  return store;
}
