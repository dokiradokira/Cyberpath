"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { type WordEntry } from "../../content/vocabulary";
import { useLearning } from "../learning-provider";
import { createPortal } from "react-dom";
import { findTerms } from "../../lib/terms";
import { toggleWord } from "../../lib/vocabulary-learning";
function Term({
  entry,
  text,
  initialHint,
  context,
}: {
  entry: WordEntry;
  text: string;
  initialHint: boolean;
  context: string;
}) {
  const [open, setOpen] = useState(false);
  const { data, update, ready } = useLearning();
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLSpanElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const close = () => {
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  };
  useEffect(() => {
    if (!open) return;
    closeButton.current?.focus({ preventScroll: true });
    const dismissOutside = (event: Event) => {
      if (
        event.target instanceof Node &&
        !panel.current?.contains(event.target) &&
        !trigger.current?.contains(event.target)
      )
        setOpen(false);
    };
    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("focusin", dismissOutside);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("focusin", dismissOutside);
    };
  }, [open]);
  const saved = data.favorites.includes(entry.id);
  return (
    <span className="inline-term">
      <button
        type="button"
        ref={trigger}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-label={`解释 ${text}`}
        onKeyDown={(e) => {
          if (e.key === "Escape" && open) {
            e.preventDefault();
            setOpen(false);
          }
        }}
        onClick={() => setOpen(!open)}
      >
        {text}
      </button>
      {((data.mode === "learning" && initialHint) || open) && (
        <span className="term-translation" lang="zh-CN">
          （{entry.zh}）
        </span>
      )}
      {open &&
        createPortal(
          <span
            className="term-overlay"
            role="dialog"
            aria-modal="false"
            aria-label="词汇详情"
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.stopPropagation();
                close();
              }
            }}
          >
            <span
              ref={panel}
              className="term-definition"
              id={id}
              role="region"
              aria-label={`${entry.word} 词汇解释`}
            >
              <strong lang="en">{entry.word}</strong>
              <span lang="zh-CN">{entry.zh}</span>
              <span lang="en">{entry.definition}</span>
              <span className="term-context">
                <span lang="zh-CN">原文语境</span>
                <br />
                <span lang="en">{context}</span>
              </span>
              <span className="term-example" lang="en">
                {entry.example}
              </span>
              <span className="term-actions">
                <button
                  type="button"
                  disabled={!ready}
                  aria-label={`${saved ? "取消收藏" : "收藏"} ${entry.word}`}
                  aria-pressed={saved}
                  onClick={() => update((p) => toggleWord(p, entry.id))}
                >
                  {saved ? "已收藏" : "收藏单词"}
                </button>
                <button type="button" ref={closeButton} onClick={close}>
                  收起解释
                </button>
              </span>
            </span>
          </span>,
          document.body,
        )}
    </span>
  );
}
export function AnnotatedText({ text }: { text: string }) {
  const { data } = useLearning();
  const matches = useMemo(() => findTerms(text), [text]);
  const nodes: React.ReactNode[] = [];
  const seen = new Set<string>();
  let last = 0;
  for (const match of matches) {
    nodes.push(text.slice(last, match.start));
    const entry = match.entry;
    nodes.push(
      <Term
        key={`${data.mode}:${match.start}`}
        entry={entry}
        text={match.text}
        context={match.context}
        initialHint={!seen.has(entry.word)}
      />,
    );
    seen.add(entry.word);
    last = match.end;
  }
  nodes.push(text.slice(last));
  return <>{nodes}</>;
}
