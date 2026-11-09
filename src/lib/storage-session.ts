import type { Progress } from "../types";
import { initialProgress, readProgress, STORAGE_KEY } from "./storage";
type Store = Pick<Storage, "getItem" | "setItem">;
export class StorageSession {
  raw: string | null | undefined;
  status: "first-use" | "loaded" | "read-error" | "write-error" | "conflict" =
    "read-error";
  warning = "";
  constructor(private readonly storage: () => Store) {}
  load(): Progress {
    try {
      const r = readProgress(this.storage());
      this.raw = r.raw;
      this.status = r.status;
      this.warning = r.warning;
      return r.data;
    } catch {
      this.status = "read-error";
      this.warning =
        "当前浏览器无法保存进度：存储不可用，仍可阅读；请导出临时档案。";
      return initialProgress();
    }
  }
  private check(): boolean {
    try {
      const current = this.storage().getItem(STORAGE_KEY);
      if (this.raw === undefined) return false;
      if (current !== this.raw) {
        this.raw = current;
        this.status = "conflict";
        this.warning =
          "检测到其他标签页修改，本页已暂停保存。请导出临时档案，并刷新后核对记录。";
        return false;
      }
      return true;
    } catch {
      this.status = "read-error";
      this.warning = "当前浏览器无法读取存储，已暂停保存；请导出临时档案。";
      return false;
    }
  }
  save(data: Progress): boolean {
    if (this.status === "read-error" || this.status === "conflict")
      return false;
    return this.write(data);
  }
  replace(data: Progress): boolean {
    return this.write(data);
  }
  private write(data: Progress): boolean {
    if (!this.check()) return false;
    try {
      const text = JSON.stringify(data);
      this.storage().setItem(STORAGE_KEY, text);
      this.raw = text;
      this.status = "loaded";
      this.warning = "";
      return true;
    } catch {
      this.status = "write-error";
      this.warning =
        "当前浏览器无法保存进度，请导出临时档案；原始记录未被替换。";
      return false;
    }
  }
}
