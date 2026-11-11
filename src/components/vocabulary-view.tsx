"use client";
import { reviewPosition, reviewIndex } from "../lib/review-queue";
import { useId, useState } from "react";
import Link from "next/link";
import { Bookmark, ArrowLeft, ArrowRight } from "lucide-react";
import { wordEntries, type WordEntry } from "../content/vocabulary";
import { availableLessons } from "../content/lessons";
import { useLearning } from "./learning-provider";
import {
  reviewSummary,
  recordWord,
  toggleWord,
} from "../lib/vocabulary-learning";
function WordTitle({ entry }: { entry: WordEntry }) {
  const { data } = useLearning();
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <h2 lang="en">
      {data.mode === "learning" ? (
        entry.word
      ) : (
        <button
          className="word-title"
          aria-label={`解释 ${entry.word}`}
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((v) => !v)}
        >
          {entry.word}
        </button>
      )}
      <small id={id} lang="zh-CN" hidden={data.mode === "challenge" && !open}>
        {entry.zh}
      </small>
    </h2>
  );
}
export function VocabularyView() {
  const [answered, setAnswered] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [feedback, setFeedback] = useState("");
  const { data, update, ready } = useLearning();
  const [query, setQuery] = useState(""),
    [lesson, setLesson] = useState("all"),
    [filter, setFilter] = useState("all"),
    [mode, setMode] = useState("list"),
    [index, setIndex] = useState(0),
    [revealed, setRevealed] = useState(false),
    [choice, setChoice] = useState<string | null>(null),
    [lockedWord, setLockedWord] = useState<WordEntry | null>(null);
  const words = wordEntries.filter(
    (w) =>
      (lesson === "all" || w.lessonId === lesson) &&
      (filter === "all" ||
        (filter === "saved" && data.favorites.includes(w.word)) ||
        (filter === "known" && data.reviews[w.word]?.known) ||
        (filter === "practice" && !data.reviews[w.word]?.known)) &&
      `${w.word} ${w.zh} ${w.definition}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const position = reviewPosition(
    words.map((w) => w.word),
    index,
    lockedWord?.word ?? null,
    reviewed,
  );
  const current = wordEntries.find((w) => w.word === position.current)!;
  const summary = reviewSummary(
    words.map((w) => w.id),
    answered,
  );
  const finish = position.finish || (summary.allReviewed && choice !== null);
  const options = current
    ? [
        current,
        ...wordEntries
          .filter((w) => w.word !== current.word)
          .slice((index * 3) % 20, ((index * 3) % 20) + 3),
      ].sort((a, b) => a.zh.localeCompare(b.zh, "zh-CN"))
    : [];
  function reset() {
    setAnswered([]);
    setFinished(false);
    setReviewed(false);
    setIndex(0);
    setRevealed(false);
    setChoice(null);
    setLockedWord(null);
  }
  function move(delta: number) {
    setIndex((i) =>
      reviewIndex(
        words.map((w) => w.word),
        i,
        lockedWord?.word ?? null,
        delta,
      ),
    );
    setRevealed(false);
    setChoice(null);
    setLockedWord(null);
  }
  function record(word: string, correct: boolean) {
    if (choice !== null) return;
    setReviewed(true);
    setAnswered((p) => [...new Set([...p, word])]);
    update((p) => recordWord(p, word, correct));
  }
  function save(word: string) {
    setFeedback(
      `${word}：${data.favorites.includes(word) ? "已取消收藏" : "已收藏，可在我的收藏中查看"}`,
    );
    update((p) => toggleWord(p, word));
  }
  return (
    <>
      <header className="page-heading">
        <h1>词汇学习</h1>
        <p>网络安全术语 · 搜索、收藏与复习</p>
      </header>
      <div className="stats-grid">
        <div className="panel">
          <h2>{wordEntries.length} 个词汇</h2>
          <p className="muted">覆盖前三课的核心术语</p>
        </div>
        <div className="panel">
          <h2>{data.favorites.length} 个收藏</h2>
          <p className="muted">和课程中的收藏自动关联</p>
        </div>
        <div className="panel">
          <h2>
            {Object.values(data.reviews).filter((r) => r.known).length} 个已掌握
          </h2>
          <p className="muted">复习记录保存在当前浏览器</p>
        </div>
      </div>
      <section className="panel">
        <div className="vocab-filters">
          <label>
            搜索词汇
            <input
              value={query}
              placeholder="输入英文或中文，如 packet / 数据包"
              onChange={(e) => {
                setQuery(e.target.value);
                reset();
              }}
            />
          </label>
          <label>
            所属课程
            <select
              aria-label="所属课程"
              value={lesson}
              onChange={(e) => {
                setLesson(e.target.value);
                reset();
              }}
            >
              <option value="all">全部课程</option>
              {availableLessons.map((l) => (
                <option key={l.id} value={l.id}>
                  第 {l.number} 课 · {l.zh}
                </option>
              ))}
            </select>
          </label>
          <label>
            学习状态
            <select
              aria-label="学习状态"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                reset();
              }}
            >
              <option value="all">全部词汇</option>
              <option value="saved">我的收藏</option>
              <option value="practice">待巩固</option>
              <option value="known">已掌握</option>
            </select>
          </label>
        </div>
        <div className="device-buttons" role="group" aria-label="词汇学习方式">
          {[
            ["list", "词汇列表"],
            ["cards", "闪卡复习"],
            ["quiz", "释义测验"],
          ].map(([value, label]) => (
            <button
              key={value}
              aria-pressed={mode === value}
              onClick={() => {
                setMode(value);
                reset();
              }}
            >
              {label}
            </button>
          ))}
        </div>
        {feedback && (
          <div className="action-feedback" role="log" aria-live="polite">
            {feedback}
          </div>
        )}
        <p className="muted">当前筛选：{words.length} 个词汇</p>
        {mode !== "list" && (
          <p aria-live="polite" className="review-progress">
            本轮已复习 {summary.count} 个 · 当前队列 {words.length} 个
          </p>
        )}
        {(position.complete || finished) && mode !== "list" ? (
          <div role="status">
            <h2>本轮复习已完成</h2>
            <p>
              已复习 {summary.count}{" "}
              个词汇。掌握状态是本次自评或测验结果，可随时调整。
            </p>
            <button onClick={reset}>再复习一轮</button>
            <button
              onClick={() => {
                setMode("list");
                reset();
              }}
            >
              返回词汇列表
            </button>
          </div>
        ) : words.length === 0 && !lockedWord ? (
          <p role="status">没有匹配的词汇，试试其他关键词或筛选条件。</p>
        ) : mode === "list" ? (
          <div className="word-list">
            {words.map((w) => (
              <article className="word-entry" key={w.id}>
                <div className="section-heading">
                  <WordTitle key={data.mode} entry={w} />
                  <button
                    aria-label={`${data.favorites.includes(w.word) ? "取消收藏" : "收藏"} ${w.word}`}
                    aria-pressed={data.favorites.includes(w.word)}
                    disabled={!ready}
                    onClick={() => save(w.word)}
                  >
                    <Bookmark
                      size={16}
                      fill={
                        data.favorites.includes(w.word)
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>
                </div>
                <p lang="en">{w.definition}</p>
                <p className="word-example" lang="en">
                  {w.example}
                </p>
                <div className="word-meta">
                  <Link prefetch={false} href={`/courses/${w.lessonId}`}>
                    返回所属课程 →
                  </Link>
                  <button
                    className="text-button"
                    disabled={!ready}
                    aria-label={`${data.reviews[w.id]?.known ? "设为待巩固" : "标记已掌握"} ${w.word}`}
                    onClick={() =>
                      update((p) =>
                        recordWord(p, w.id, !p.reviews[w.id]?.known),
                      )
                    }
                  >
                    {data.reviews[w.word]?.known ? "已掌握" : "待巩固"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div
            className="flashcard"
            role="region"
            aria-label="词汇复习卡片"
            tabIndex={0}
            aria-describedby="review-keys"
            onKeyDown={(e) => {
              if (e.target !== e.currentTarget || !ready) return;
              if (e.key === " " && mode === "cards") {
                e.preventDefault();
                setRevealed((v) => !v);
              }
              if (e.key === "ArrowLeft" && position.canPrevious) {
                e.preventDefault();
                move(-1);
              }
              if (e.key === "ArrowRight" && (position.canNext || finish)) {
                e.preventDefault();
                if (finish) setFinished(true);
                else move(1);
              }
            }}
          >
            <p id="review-keys" className="muted">
              聚焦卡片后，空格翻卡，方向键切换；也可使用下方按钮。掌握状态可重新调整。
            </p>
            <p className="eyebrow">
              {words.some((w) => w.id === current.id)
                ? `${words.findIndex((w) => w.id === current.id) + 1} / ${words.length}`
                : "当前词已移出筛选队列"}
            </p>
            <h2 lang="en">{current.word}</h2>
            {mode === "cards" ? (
              <>
                <p>先试着回忆中文含义，再翻开答案。</p>
                {revealed ? (
                  <>
                    <h3>{current.zh}</h3>
                    <p lang="en">{current.definition}</p>
                    <p className="word-example" lang="en">
                      {current.example}
                    </p>
                    <div className="device-buttons">
                      <button
                        disabled={!ready}
                        onClick={() => {
                          record(current.word, true);
                          if (
                            reviewSummary(
                              words.map((w) => w.id),
                              [...answered, current.id],
                            ).allReviewed
                          )
                            setFinished(true);
                          else move(filter === "practice" ? 0 : 1);
                        }}
                      >
                        认识，下一词
                      </button>
                      <button
                        disabled={!ready}
                        onClick={() => {
                          record(current.word, false);
                          if (
                            reviewSummary(
                              words.map((w) => w.id),
                              [...answered, current.id],
                            ).allReviewed
                          )
                            setFinished(true);
                          else move(filter === "known" ? 0 : 1);
                        }}
                      >
                        再练一次，下一词
                      </button>
                    </div>
                  </>
                ) : (
                  <button className="primary" onClick={() => setRevealed(true)}>
                    显示释义
                  </button>
                )}
              </>
            ) : (
              <>
                <p>选择这个词的中文含义。</p>
                <div className="meaning-options">
                  {options.map((o) => (
                    <button
                      key={o.word}
                      disabled={!ready || choice !== null}
                      onClick={() => {
                        setLockedWord(current);
                        setChoice(o.word);
                        record(current.word, o.word === current.word);
                      }}
                    >
                      {o.zh}
                    </button>
                  ))}
                </div>
                {choice !== null && (
                  <p role="status" className="notice">
                    {choice === current.word ? "回答正确！" : "还需巩固。"}{" "}
                    {current.word}：{current.zh}。
                    <span lang="en">{current.definition}</span>
                  </p>
                )}
              </>
            )}
            <div className="step-controls">
              <button disabled={!position.canPrevious} onClick={() => move(-1)}>
                <ArrowLeft size={16} /> 上一个词
              </button>
              <button disabled={!ready} onClick={() => save(current.word)}>
                {data.favorites.includes(current.word)
                  ? "取消收藏"
                  : "收藏此词"}
              </button>
              <button
                disabled={!position.canNext && !finish}
                onClick={() => {
                  if (finish) setFinished(true);
                  else move(1);
                }}
              >
                {finish ? "完成复习" : "下一个词"} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
