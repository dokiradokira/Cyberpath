"use client";
import { useState } from "react";
import { Bookmark } from "lucide-react";
import type { Vocabulary as Word } from "../../types";
import { useLearning } from "../learning-provider";
export function Vocabulary({ item }: { item: Word }) {
  const { data, update } = useLearning(),
    [open, setOpen] = useState(false),
    saved = data.favorites.includes(item.word);
  return (
    <div className="vocab">
      <div>
        <button
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="word"
        >
          {item.word}{" "}
          {(data.mode === "learning" || open) && (
            <span lang="zh-CN">（{item.zh}）</span>
          )}
        </button>
        <button
          aria-label={`${saved ? "Unsave" : "Save"} ${item.word}`}
          aria-pressed={saved}
          onClick={() =>
            update((p) => ({
              ...p,
              favorites: saved
                ? p.favorites.filter((w) => w !== item.word)
                : [...p.favorites, item.word],
            }))
          }
        >
          <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      {open && <p>{item.definition}</p>}
    </div>
  );
}
