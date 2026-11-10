"use client";
import { useState } from "react";
import Link from "next/link";
import { availableLessons } from "../content/lessons";
import type { AnswerSnapshot } from "../types";
import {
  completion,
  makeAttempt,
  saveAttempt,
  scoreTrend,
  weakTopics,
  wrongQuestions,
} from "../lib/study";
import { useLearning } from "./learning-provider";

function RetryQuestion({
  lessonId,
  question: q,
}: {
  lessonId: string;
  question: AnswerSnapshot;
}) {
  const { data, update, ready } = useLearning();
  const [selected, setSelected] = useState<number | null>(null),
    [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const lesson = availableLessons.find((l) => l.id === lessonId)!;
  return (
    <article
      className="review-question"
      aria-label={`${lessonId} ${q.id} 错题`}
    >
      <h3 lang="en">{q.prompt}</h3>
      <Link href={`/courses/${lessonId}#${q.sectionId}`} prefetch={false}>
        阅读对应知识点
      </Link>
      <details>
        <summary>查看知识解释</summary>
        <p lang="en">{q.explanation}</p>
      </details>
      <fieldset disabled={submitted || !ready}>
        <legend>选择答案重新练习</legend>
        {q.options.map((o, i) => (
          <label className="quiz-option" key={i}>
            <input
              type="radio"
              name={`review-${lessonId}-${q.id}`}
              checked={selected === i}
              onChange={() => setSelected(i)}
            />
            {o}
          </label>
        ))}
      </fieldset>
      {submitted ? (
        <div role="status">
          <p>
            {selected === q.answer ? "复习回答正确" : "仍需练习"} · 正确答案：
            {q.options[q.answer]}
          </p>
          <p lang="en">{q.explanation}</p>
          <button
            onClick={() => {
              setSelected(null);
              setSubmitted(false);
            }}
          >
            再次练习
          </button>
        </div>
      ) : (
        <button
          disabled={selected === null || !ready}
          onClick={() => {
            if (selected === null) return;
            if ((data.study?.history.length ?? 0) >= 100) {
              setError("历史已满，请先导出，记录不会自动删除。");
              return;
            }
            const a = makeAttempt(
              lesson,
              { [q.id]: selected },
              "review",
              `${Date.now()}-${Math.random().toString(36).slice(2)}`,
              new Date().toISOString(),
              [q],
            );
            setSubmitted(true);
            update((p) => saveAttempt(p, a));
          }}
        >
          提交错题练习
        </button>
      )}
      {error && <p role="alert">{error}</p>}
    </article>
  );
}
export function StudyDashboard() {
  const { data } = useLearning();
  const [course, setCourse] = useState("all"),
    [topic, setTopic] = useState("all"),
    [point, setPoint] = useState("");
  const trend = scoreTrend(data, course),
    topics = weakTopics(data, course),
    wrong = wrongQuestions(data, course, topic),
    progress = completion(data);
  const plotted = trend.slice(-20),
    chosen = trend.find((a) => a.id === point) ?? trend[trend.length - 1];
  const x = (i: number) =>
      45 + (plotted.length === 1 ? 117 : (i / (plotted.length - 1)) * 235),
    y = (percent: number) => 145 - percent * 1.1;
  const name = (id: string) =>
    availableLessons.find((l) => l.id === id)?.zh ?? id;
  const topicName = (lessonId: string, id: string) =>
    availableLessons
      .find((l) => l.id === lessonId)
      ?.sections.find((s) => s.id === id)?.title ?? id;
  const visits = Object.values(data.lessons)
    .flatMap((r) => (r.lastVisitedAt ? [r.lastVisitedAt] : []))
    .concat((data.study?.history ?? []).map((a) => a.at))
    .sort((a, b) => Date.parse(b) - Date.parse(a));
  return (
    <section className="study-dashboard" aria-label="学习数据与错题本">
      <section className="panel">
        <h2>课程完成进度</h2>
        <p>
          {progress.done} / {progress.total} 节开放课程已完成 ·{" "}
          {progress.percent}%
        </p>
        <progress
          aria-label="开放课程完成比例"
          max={progress.total}
          value={progress.done}
        />
        <p className="muted">
          Coming Soon 不计入分母。最近学习活动：
          {visits[0]
            ? new Date(visits[0]).toLocaleString("zh-CN")
            : "暂无可确认时间"}
        </p>
      </section>
      <section className="panel">
        <h2>学习数据筛选</h2>
        <label>
          统计课程
          <select
            aria-label="统计课程"
            value={course}
            onChange={(e) => {
              setCourse(e.target.value);
              setTopic("all");
              setPoint("");
            }}
          >
            <option value="all">全部课程</option>
            {availableLessons.map((l) => (
              <option key={l.id} value={l.id}>
                {l.zh}
              </option>
            ))}
          </select>
        </label>
        <p className="muted">
          筛选同时应用于成绩、知识点和错题。旧成绩无真实作答时间及明细，不补入趋势图。
        </p>
      </section>
      <section className="panel">
        <h2>Quiz Score Trend</h2>
        <p>
          正式测验正确率 · 纵轴 0–100%，横轴按真实提交时间排序。图示最近 20
          次，明细保留全部记录。
        </p>
        {!trend.length ? (
          <p>暂无真实测验历史，完成一次测验后即可查看趋势</p>
        ) : (
          <>
            <svg
              className="score-chart"
              viewBox="0 0 300 180"
              role="group"
              aria-label="测验正确率趋势图"
            >
              <path d="M40 30 V145 H290" fill="none" stroke="currentColor" />
              {[0, 50, 100].map((v) => (
                <text key={v} x="2" y={y(v) + 4}>
                  {v}%
                </text>
              ))}
              <polyline
                points={plotted
                  .map((a, i) => `${x(i)},${y(a.percent)}`)
                  .join(" ")}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2"
              />
              {plotted.map((a, i) => (
                <g
                  key={a.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${name(a.lessonId)} 第${trend.length - plotted.length + i + 1}次 ${a.score}/${a.total} ${a.percent}% ${new Date(a.at).toLocaleString("zh-CN")}`}
                  onClick={() => setPoint(a.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setPoint(a.id);
                    }
                  }}
                >
                  <circle
                    cx={x(i)}
                    cy={y(a.percent)}
                    r="12"
                    fill="transparent"
                  />
                  <circle
                    cx={x(i)}
                    cy={y(a.percent)}
                    r="4"
                    fill="var(--primary)"
                  />
                </g>
              ))}
              <text x="45" y="172">
                第{trend.length - plotted.length + 1}次
              </text>
              <text x="235" y="172">
                第{trend.length}次
              </text>
            </svg>
            {chosen && (
              <p aria-live="polite">
                {new Date(chosen.at).toLocaleString("zh-CN")} ·{" "}
                {name(chosen.lessonId)} · {chosen.score}/{chosen.total} ·{" "}
                {chosen.percent}%
              </p>
            )}
            <ol aria-label="测验成绩明细">
              {trend.map((a) => (
                <li key={a.id}>
                  <button
                    className="text-button"
                    onClick={() => setPoint(a.id)}
                  >
                    {new Date(a.at).toLocaleString("zh-CN")} ·{" "}
                    {name(a.lessonId)} · {a.score}/{a.total} · {a.percent}%
                  </button>
                  <details>
                    <summary>逐题作答结果</summary>
                    {a.questions.map((q) => (
                      <p key={q.id} lang="en">
                        {q.id} · {q.prompt} · Your answer:{" "}
                        {q.options[q.selected]} ·{" "}
                        {q.correct ? "Correct" : "Incorrect"} · {q.explanation}
                      </p>
                    ))}
                  </details>
                </li>
              ))}
            </ol>
          </>
        )}
      </section>
      <section className="panel">
        <h2>Weak Topics</h2>
        <p>
          错误率 = 错误次数 ÷
          作答次数，包含测验和错题练习。同一题重练也计入样本；少于 3
          次标为样本不足，不据此断定薄弱程度。
        </p>
        {!topics.length ? (
          <p>暂无知识点作答数据</p>
        ) : (
          <ul className="topic-bars">
            {topics.map((t) => (
              <li key={`${t.lessonId}/${t.topicId}`}>
                <Link
                  href={`/courses/${t.lessonId}#${t.sectionId}`}
                  prefetch={false}
                >
                  {name(t.lessonId)} · {topicName(t.lessonId, t.topicId)}
                </Link>
                <div
                  role="img"
                  aria-label={`错误率 ${t.rate}%，${t.errors}/${t.total} 次`}
                  className="topic-bar"
                >
                  <span style={{ width: `${t.rate}%` }} />
                </div>
                <p>
                  {t.rate}% · 错误 {t.errors} / 作答 {t.total} 次 ·{" "}
                  {t.total < 3 ? "样本不足" : "建议结合最近复习判断"}
                </p>
                {t.errors > 0 && (
                  <button
                    onClick={() => {
                      setTopic(t.topicId);
                      document.getElementById("wrong-book")?.scrollIntoView();
                    }}
                  >
                    复习该知识点
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="panel" id="wrong-book">
        <h2>历史错题本</h2>
        <label>
          错题知识点
          <select
            aria-label="错题知识点"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          >
            <option value="all">全部知识点</option>
            {[
              ...new Set(
                wrongQuestions(data, course).map((r) => r.question.topicId),
              ),
            ].map((t) => (
              <option key={t} value={t}>
                {topicName(
                  wrongQuestions(data, course).find(
                    (r) => r.question.topicId === t,
                  )!.lessonId,
                  t,
                )}
              </option>
            ))}
          </select>
        </label>
        <p className="muted">
          保存曾经答错的题目；一次答对不删除历史。旧档案错题可练习，但不伪造其错误时间和样本数。建议先阅读解释，再练习；错误率高且样本不少于
          3 次的知识点优先关注。
        </p>
        {wrong.length ? (
          wrong.map((r) => (
            <RetryQuestion key={`${r.lessonId}/${r.question.id}`} {...r} />
          ))
        ) : (
          <p>当前筛选没有历史错题</p>
        )}
      </section>
    </section>
  );
}
