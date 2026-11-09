"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Progress } from "../types";
import { initialProgress, readProgress, STORAGE_KEY } from "../lib/storage";
type Store = {
  data: Progress;
  ready: boolean;
  warning: string;
  update: (fn: (p: Progress) => Progress) => void;
};
const Context = createContext<Store | null>(null);
export function LearningProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(initialProgress),
    [ready, setReady] = useState(false),
    [warning, setWarning] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = readProgress(window.localStorage);
        setData(saved.data);
        setWarning(saved.warning);
      } catch {
        setWarning("当前浏览器不允许存储，仍可学习；离开前请导出备份。");
      }
      document.documentElement.dataset.hydrated = "true";
      setReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.theme = data.theme;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      queueMicrotask(() => setWarning("当前浏览器无法保存进度，请导出备份。"));
    }
  }, [data, ready]);
  return (
    <Context.Provider value={{ data, ready, warning, update: setData }}>
      {children}
    </Context.Provider>
  );
}
export function useLearning() {
  const store = useContext(Context);
  if (!store) throw new Error("Missing learning provider");
  return store;
}
