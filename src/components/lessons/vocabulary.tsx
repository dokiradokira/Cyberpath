"use client";
import { useId, useState } from "react";
import { Bookmark } from "lucide-react";
import type { Vocabulary as Word } from "../../types";
import { useLearning } from "../learning-provider";
import { wordEntries } from "../../content/vocabulary";
import { toggleWord } from "../../lib/vocabulary-learning";
export function Vocabulary({ item }: { item: Word }) {
  const { data } = useLearning();
  return <VocabularyDetails key={data.mode} item={item} />;
}
function VocabularyDetails({ item }: { item: Word }) {
  const { data, update, ready } = useLearning(),
    [open, setOpen] = useState(false),
    saved = data.favorites.includes(item.word);
  const id = useId();
  const entry = wordEntries.find((w) => w.id === item.word);
  return (
    <div className="vocab">
      <div>
        <button
          aria-expanded={open}
          aria-controls={open ? id : undefined}
          onClick={() => setOpen(!open)}
          className="word"
        >
          {item.word}{" "}
          {(data.mode === "learning" || open) && (
            <span lang="zh-CN">（{item.zh}）</span>
          )}
        </button>
        <button
          aria-label={`${saved ? "取消收藏" : "收藏"} ${item.word}`}
          aria-pressed={saved}
          disabled={!ready}
          onClick={() => update((p) => toggleWord(p, item.word))}
        >
          <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      {open && (
        <div id={id} className="vocab-detail">
          <p lang="en">{item.definition}</p>
          <p className="word-example" lang="en">
            {entry?.example}
          </p>
        </div>
      )}
    </div>
  );
}
