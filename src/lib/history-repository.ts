import type { Progress, QuizAttempt } from "../types";
import { initialProgress, parseProgress, STORAGE_KEY, upgradeProgress } from "./storage";
import { saveAttempt, wrongQuestions, parseStudy } from "./study";
import {
  aggregateAttempt,
  emptyAnalytics,
  profileOnly,
  encodeBackup,
  decodeBackup,
  isCompatibilitySnapshot,
  type Analytics,
} from "./history-backup";
export const HISTORY_DB = "cyberpath.learning.v1";
type Head = {
  key: "head";
  generation: string;
  revision: number;
  profile: Progress;
  analytics: Analytics;
  count: number;
};
type Row = {
  key: string;
  generation: string;
  lessonId: string;
  kind: string;
  at: string;
  attempt: QuizAttempt;
};
const request = <T>(r: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
const complete = (tx: IDBTransaction) =>
  new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error ?? new Error("事务取消，原数据保留。"));
    tx.onerror = () => {};
  });
const unique = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;
export class HistoryRepository {
  private db!: IDBDatabase;
  private head!: Head;
  private expectedRaw: string | null = null;
  raw: string | null | undefined;
  mirrorWarning = "";
  async open(): Promise<Progress> {
    this.db = await new Promise<IDBDatabase>((resolve, reject) => {
      const r = indexedDB.open(HISTORY_DB, 1);
      r.onupgradeneeded = () => {
        const db = r.result;
        db.createObjectStore("meta", { keyPath: "key" });
        const rows = db.createObjectStore("history", { keyPath: "key" });
        rows.createIndex("time", ["generation", "kind", "at", "key"]);
        rows.createIndex("course", [
          "generation",
          "lessonId",
          "kind",
          "at",
          "key",
        ]);
        db.createObjectStore("backups", { keyPath: "id" });
      };
      r.onsuccess = () => {
        r.result.onversionchange = () => r.result.close();
        resolve(r.result);
      };
      r.onerror = () => reject(r.error);
      r.onblocked = () =>
        reject(new Error("数据库升级被其他标签页阻止，请关闭旧页面后重试。"));
    });
    const tx = this.db.transaction("meta", "readonly");
    const existing = await request<Head | undefined>(
      tx.objectStore("meta").get("head"),
    );
    this.expectedRaw = localStorage.getItem(STORAGE_KEY);
    this.raw = this.expectedRaw;
    if (existing) {
      this.head = existing;
      // A content revision may add lessons after this profile was saved. Normalize
      // before anything reads data.lessons, otherwise the reader sees undefined
      // records for the new lessons.
      const upgraded = profileOnly(upgradeProgress(existing.profile));
      if (JSON.stringify(upgraded) !== JSON.stringify(existing.profile)) {
        try {
          await this.commitUpgrade(upgraded);
        } catch {
          // Keep the normalized profile in memory; the next write persists it.
          this.head = { ...existing, profile: upgraded };
        }
      }
      const backupTx = this.db.transaction("backups", "readonly");
      const backup = await request<{ raw: string } | undefined>(
        backupTx.objectStore("backups").get("legacy-source"),
      );
      if (backup) this.raw = backup.raw;
      return this.view();
    }
    if (isCompatibilitySnapshot(this.expectedRaw))
      throw new Error(
        "IndexedDB 历史缺失，兼容快照不是完整档案。请导入完整备份。",
      );
    const p =
      this.expectedRaw === null
        ? initialProgress()
        : parseProgress(this.expectedRaw);
    await this.install(
      profileOnly(p),
      p.study?.history ?? [],
      this.expectedRaw,
      true,
    );
    return this.view();
  }
  /** Persist a content-revision upgrade without touching stored quiz history. */
  private async commitUpgrade(profile: Progress) {
    const current = this.head;
    const tx = this.db.transaction(["meta", "backups"], "readwrite");
    const done = complete(tx);
    tx.objectStore("backups").put({
      id: `upgrade/${current.generation}/${current.revision}`,
      head: current,
      createdAt: new Date().toISOString(),
    });
    const next: Head = {
      ...current,
      profile,
      revision: current.revision + 1,
    };
    tx.objectStore("meta").put(next);
    await done;
    this.head = next;
    await this.mirror();
  }
  private view(): Progress {
    return { ...this.head.profile };
  }
  private checkRaw() {
    if (localStorage.getItem(STORAGE_KEY) !== this.expectedRaw)
      throw new Error(
        "检测到其他标签页修改，本页已暂停保存。请导出并刷新核对。",
      );
  }
  private async mirror() {
    // Compatibility snapshot only. IndexedDB is authoritative; full legacy bytes
    // were committed to backups before this key can be replaced.
    try {
      const recent = await this.recent(20);
      const value = JSON.stringify({
        ...this.head.profile,
        study: { version: 1, history: recent.slice().reverse() },
        historyStorage: {
          version: 1,
          generation: this.head.generation,
          revision: this.head.revision,
        },
      });
      this.checkRaw();
      localStorage.setItem(STORAGE_KEY, value);
      this.expectedRaw = value;
      this.mirrorWarning = "";
    } catch {
      this.mirrorWarning =
        "历史已保存在 IndexedDB，但当前浏览器无法保存进度兼容快照；请导出备份。";
    }
  }
  private async install(
    profile: Progress,
    history: QuizAttempt[],
    raw: string | null,
    initial = false,
  ) {
    this.checkRaw();
    const tx = this.db.transaction(["meta", "history", "backups"], "readwrite");
    const done = complete(tx);
    let problem: Error | undefined;
    const meta = tx.objectStore("meta"),
      get = meta.get("head");
    get.onsuccess = () => {
      try {
        const current = get.result as Head | undefined;
        if (initial && current) {
          this.head = current;
          return;
        }
        if (!initial && current?.revision !== this.head?.revision) {
          problem = new Error("其他标签页已更新档案，导入取消；请刷新核对。");
          tx.abort();
          return;
        }
        const generation = unique();
        let analytics = emptyAnalytics();
        const store = tx.objectStore("history");
        for (const a of history) {
          analytics = aggregateAttempt(analytics, a);
          store.add({
            key: `${generation}/${a.id}`,
            generation,
            lessonId: a.lessonId,
            kind: a.kind,
            at: a.at,
            attempt: a,
          } satisfies Row);
        }
        for (const w of wrongQuestions(profile))
          if (
            !analytics.wrong.some(
              (v) =>
                v.lessonId === w.lessonId && v.question.id === w.question.id,
            )
          )
            analytics.wrong.push(w);
        if (raw !== null)
          tx.objectStore("backups").add({
            id: generation,
            raw,
            createdAt: new Date().toISOString(),
          });
        if (!current && raw !== null)
          tx.objectStore("backups").put({ id: "legacy-source", raw });
        if (current)
          tx.objectStore("backups").add({
            id: `head/${generation}`,
            head: current,
          });
        const next: Head = {
          key: "head",
          generation,
          revision: (current?.revision ?? 0) + 1,
          profile: profileOnly(profile),
          analytics,
          count: history.length,
        };
        meta.put(next);
        // Verify the row count before publishing the new head transaction.
        const count = store.count(
          IDBKeyRange.bound(`${generation}/`, `${generation}/\uffff`),
        );
        count.onsuccess = () => {
          if (count.result !== history.length) {
            problem = new Error("迁移验证失败，旧记录已保留。");
            tx.abort();
          }
        };
      } catch (e) {
        problem = e instanceof Error ? e : new Error("迁移失败");
        try {
          tx.abort();
        } catch {
          /* already aborted */
        }
      }
    };
    try {
      await done;
    } catch (e) {
      throw problem ?? e;
    }
    const read = this.db.transaction("meta", "readonly");
    this.head = await request<Head>(read.objectStore("meta").get("head"));
    await this.mirror();
  }
  async replace(profile: Progress, history: QuizAttempt[]) {
    const valid = decodeBackup(encodeBackup(profile, history));
    await this.install(valid.profile, valid.history, this.raw ?? null);
    return this.view();
  }
  async write(fn: (p: Progress) => Progress, attempt?: QuizAttempt) {
    this.checkRaw();
    const tx = this.db.transaction(["meta", "history"], "readwrite"),
      done = complete(tx);
    let problem: Error | undefined;
    const meta = tx.objectStore("meta"),
      r = meta.get("head");
    let next: Head | undefined;
    r.onsuccess = () => {
      const current = r.result as Head;
      if (current.revision !== this.head.revision) {
        problem = new Error(
          "检测到其他标签页修改，本页已暂停保存。请导出并刷新核对。",
        );
        tx.abort();
        return;
      }
      const apply = () => {
        try {
          const profile = parseProgress(
            JSON.stringify(profileOnly(fn(current.profile))),
          );
          next = { ...current, profile, revision: current.revision + 1 };
          if (attempt) {
            next.analytics = aggregateAttempt(current.analytics, attempt);
            next.count++;
            tx.objectStore("history").add({
              key: `${current.generation}/${attempt.id}`,
              generation: current.generation,
              lessonId: attempt.lessonId,
              kind: attempt.kind,
              at: attempt.at,
              attempt,
            } satisfies Row);
          }
          meta.put(next);
        } catch (e) {
          problem = e instanceof Error ? e : new Error("写入失败");
          try {
            tx.abort();
          } catch {
            /* already aborted */
          }
        }
      };
      if (attempt) {
        const existing = tx
          .objectStore("history")
          .get(`${current.generation}/${attempt.id}`);
        existing.onsuccess = () => {
          if (existing.result) {
            if (
              JSON.stringify((existing.result as Row).attempt) !==
              JSON.stringify(attempt)
            ) {
              problem = new Error("同一历史 ID 的内容不同，已拒绝覆盖。");
              tx.abort();
              return;
            }
            next = current;
            return;
          }
          apply();
        };
      } else apply();
    };
    try {
      await done;
    } catch (e) {
      throw problem ?? e;
    }
    this.head = next!;
    await this.mirror();
    return this.view();
  }
  async append(a: QuizAttempt) {
    parseStudy({ version: 1, history: [a] });
    return this.write((p) => profileOnly(saveAttempt(p, a)), a);
  }
  async recent(limit = 20) {
    const [quiz, review] = await Promise.all([
      this.page("all", "quiz", 0, limit),
      this.page("all", "review", 0, limit),
    ]);
    return [...quiz, ...review]
      .sort(
        (a, b) => Date.parse(b.at) - Date.parse(a.at) || b.id.localeCompare(a.id),
      )
      .slice(0, limit);
  }
  async page(
    course = "all",
    kind = "quiz",
    offset = 0,
    limit = 20,
  ): Promise<QuizAttempt[]> {
    const tx = this.db.transaction("history", "readonly"),
      source = tx
        .objectStore("history")
        .index(course === "all" ? "time" : "course"),
      prefix =
        course === "all"
          ? [this.head.generation, kind]
          : [this.head.generation, course, kind],
      range = IDBKeyRange.bound(
        [...prefix, "", ""],
        [...prefix, "\uffff", "\uffff"],
      );
    return new Promise((resolve, reject) => {
      const result: QuizAttempt[] = [];
      let skipped = false;
      const r = source.openCursor(range, "prev");
      r.onerror = () => reject(r.error);
      r.onsuccess = () => {
        const c = r.result;
        if (!c || result.length >= limit) {
          resolve(result);
          return;
        }
        if (offset && !skipped) {
          skipped = true;
          c.advance(offset);
          return;
        }
        result.push((c.value as Row).attempt);
        c.continue();
      };
    });
  }
  async exportAll(profile = this.head.profile) {
    // One read transaction gives a consistent snapshot even when another tab writes.
    const tx = this.db.transaction(["meta", "history"], "readonly"),
      done = complete(tx);
    const history = await new Promise<QuizAttempt[]>((resolve, reject) => {
      const result: QuizAttempt[] = [];
      const r = tx
        .objectStore("history")
        .openCursor(
          IDBKeyRange.bound(
            `${this.head.generation}/`,
            `${this.head.generation}/\uffff`,
          ),
        );
      r.onerror = () => reject(r.error);
      r.onsuccess = () => {
        const c = r.result;
        if (!c) {
          resolve(result);
          return;
        }
        result.push((c.value as Row).attempt);
        c.continue();
      };
    });
    await done;
    history.sort(
      (a, b) => Date.parse(a.at) - Date.parse(b.at) || a.id.localeCompare(b.id),
    );
    return encodeBackup(profile, history);
  }
  info() {
    return {
      analytics: this.head.analytics,
      count: this.head.count,
      revision: this.head.revision,
      profile: this.head.profile,
    };
  }
  close() {
    this.db?.close();
  }
}
