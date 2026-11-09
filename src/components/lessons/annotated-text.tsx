"use client";
import { useState } from "react";
import { wordEntries, type WordEntry } from "../../content/vocabulary";
import { useLearning } from "../learning-provider";
const byWord = new Map(wordEntries.map((w) => [w.word, w]));
const matcher = new RegExp(
  `\\b(${wordEntries
    .map((w) => w.word)
    .sort((a, b) => b.length - a.length)
    .join("|")})(s?)\\b`,
  "gi",
);
function Term({ entry, text }: { entry: WordEntry; text: string }) {
  const [open, setOpen] = useState(false);
  const { data } = useLearning();
  return (
    <span className="inline-term">
      <button
        type="button"
        aria-expanded={open}
        aria-label={`解释 ${text}`}
        onClick={() => setOpen(!open)}
      >
        {text}
      </button>
      {(data.mode === "learning" || open) && (
        <span className="term-translation" lang="zh-CN">
          （{entry.zh}）
        </span>
      )}
      {open && (
        <span className="term-definition" lang="en">
          {entry.definition}
        </span>
      )}
    </span>
  );
}
export function AnnotatedText({ text }: { text: string }) {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(matcher)) {
    nodes.push(text.slice(last, match.index));
    const entry = byWord.get(match[1].toLowerCase())!;
    nodes.push(<Term key={match.index} entry={entry} text={match[0]} />);
    last = match.index! + match[0].length;
  }
  nodes.push(text.slice(last));
  return <>{nodes}</>;
}
