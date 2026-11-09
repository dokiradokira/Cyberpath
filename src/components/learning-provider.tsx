"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import type { Progress } from "../types";
import { initialProgress } from "../lib/storage";
import { StorageSession } from "../lib/storage-session";
type Store = {
  data: Progress;
  ready: boolean;
  warning: string;
  raw: string | null | undefined;
  replace: (data: Progress) => boolean;
  update: (fn: (p: Progress) => Progress) => void;
};
const Context = createContext<Store | null>(null);
export function LearningProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(initialProgress),
    [ready, setReady] = useState(false),
    [warning, setWarning] = useState("");
  const session = useRef<StorageSession | null>(null);
  const [raw, setRaw] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = new StorageSession(() => window.localStorage);
      session.current = saved;
      setData(saved.load());
      setWarning(saved.warning);
      setRaw(saved.raw);
      document.documentElement.dataset.hydrated = "true";
      setReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.theme = data.theme;
    session.current?.save(data);
    const saved = session.current;
    queueMicrotask(() => {
      if (saved) {
        setWarning(saved.warning);
        setRaw(saved.raw);
      }
    });
  }, [data, ready]);
  return (
    <Context.Provider
      value={{
        data,
        ready,
        warning,
        raw,
        update: setData,
        replace: (next) => {
          const saved = session.current;
          if (!saved) return false;
          const ok = saved.replace(next);
          setWarning(saved.warning);
          setRaw(saved.raw);
          if (ok) setData(next);
          return ok;
        },
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
