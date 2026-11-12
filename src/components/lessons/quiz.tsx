"use client";
import { useEffect, useRef, useState } from "react";
import { useLearning } from "../learning-provider";
import { reducedMotion } from "../../lib/motion";
import { makeAttempt } from "../../lib/study";
import type { Lesson } from "../../types";
export function Quiz({ lesson }: { lesson: Lesson }) {
  const { recordAttempt, ready } = useLearning(),
    [answers, setAnswers] = useState<Record<string, number>>({}),
    [submitted, setSubmitted] = useState(false),
    [score, setScore] = useState(0),
    [pending, setPending] = useState(false);
  const submittedRef = useRef(false);
  const [error, setError] = useState("");
  const form = useRef<HTMLFormElement>(null),
    summary = useRef<HTMLDivElement>(null),
    wasSubmitted = useRef(false);
  useEffect(() => {
    const target = submitted
      ? summary.current
      : wasSubmitted.current
        ? form.current?.querySelector("input")
        : null;
    if (target) {
      target.focus({ preventScroll: true });
      target.scrollIntoView({
        block: "nearest",
        behavior: reducedMotion() ? "instant" : "smooth",
      });
    }
    wasSubmitted.current = submitted;
  }, [submitted]);
  async function submit() {
    if (!ready || submittedRef.current) return;
    setError("");
    const result = makeAttempt(
      lesson,
      answers,
      "quiz",
      `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      new Date().toISOString(),
    );
    submittedRef.current = true;
    setPending(true);
    try {
      const saved = await recordAttempt(result);
      if (!saved) {
        submittedRef.current = false;
        setError("历史未保存，测验未提交。请检查存储提示后重试。");
        return;
      }
      setScore(result.score);
      setSubmitted(true);
    } catch {
      submittedRef.current = false;
      setError("历史未保存，测验未提交。请检查存储提示后重试。");
    } finally {
      setPending(false);
    }
  }
  return (
    <section className="panel" id="knowledge-check">
      <p className="eyebrow">检验理解</p>
      <h2>知识测验</h2>
      {error && (
        <p className="motion-reveal" role="alert">
          {error}
        </p>
      )}
      <p className="muted">
        共 {lesson.quiz.length}{" "}
        道英文题目，最近、最高成绩与真实作答历史分别保存。
      </p>
      <form
        ref={form}
        aria-busy={pending}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        {lesson.quiz.map((q, index) => (
          <fieldset key={q.id} disabled={!ready || submitted || pending}>
            <legend>
              {index + 1}. {q.prompt}
            </legend>
            {q.options.map((option, i) => (
              <label
                key={option}
                className={`quiz-option ${submitted && i === q.answer ? "correct" : ""} ${submitted && answers[q.id] === i && i !== q.answer ? "incorrect" : ""}`}
              >
                <input
                  type="radio"
                  name={q.id}
                  value={i}
                  checked={answers[q.id] === i}
                  onChange={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                />
                {option}
              </label>
            ))}
            {submitted && (
              <p className="feedback motion-reveal">
                {answers[q.id] === q.answer ? "回答正确" : "回答错误"} ·{" "}
                {q.explanation}
              </p>
            )}
          </fieldset>
        ))}
        {submitted ? (
          <div
            ref={summary}
            tabIndex={-1}
            role="status"
            className="quiz-summary motion-reveal"
          >
            <h3>
              本次得分： {score} / {lesson.quiz.length}
            </h3>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                submittedRef.current = false;
                setAnswers({});
              }}
            >
              重新测验
            </button>
          </div>
        ) : (
          <button
            className="primary"
            type="submit"
            disabled={
              !ready ||
              pending ||
              Object.keys(answers).length !== lesson.quiz.length
            }
          >
            {pending ? "正在保存…" : "提交测验"}
          </button>
        )}
      </form>
    </section>
  );
}
