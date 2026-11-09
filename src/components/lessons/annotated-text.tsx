"use client";
import { useId, useRef, useState } from "react";
import { wordEntries, type WordEntry } from "../../content/vocabulary";
import { useLearning } from "../learning-provider";
import { toggleWord } from "../../lib/vocabulary-learning";
const byWord = new Map(wordEntries.map((w) => [w.word, w]));
const matcher = new RegExp(
  `\\b(${wordEntries
    .map((w) => w.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .sort((a, b) => b.length - a.length)
    .join("|")})(s?)\\b`,
  "gi",
);
function Term({
  entry,
  text,
  initialHint,
}: {
  entry: WordEntry;
  text: string;
  initialHint: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { data, update, ready } = useLearning();
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
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
      {open && (
        <span
          className="term-definition"
          id={id}
          role="region"
          aria-label={`${entry.word} 词汇解释`}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              setOpen(false);
              trigger.current?.focus({ preventScroll: true });
            }
          }}
        >
          <span lang="en">{entry.definition}</span>
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
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                trigger.current?.focus({ preventScroll: true });
              }}
            >
              收起解释
            </button>
          </span>
        </span>
      )}
    </span>
  );
}
export function AnnotatedText({ text }: { text: string }) {
  const { data } = useLearning();
  const nodes: React.ReactNode[] = [];
  const seen = new Set<string>();
  let last = 0;
  for (const match of text.matchAll(matcher)) {
    nodes.push(text.slice(last, match.index));
    const entry = byWord.get(match[1].toLowerCase())!;
    nodes.push(
      <Term
        key={`${data.mode}:${match.index}`}
        entry={entry}
        text={match[0]}
        initialHint={!seen.has(entry.word)}
      />,
    );
    seen.add(entry.word);
    last = match.index! + match[0].length;
  }
  nodes.push(text.slice(last));
  return <>{nodes}</>;
}
