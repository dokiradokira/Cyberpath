"use client";
import { useRef, useState } from "react";
import { useLearning } from "../learning-provider";
import { makeAttempt, saveAttempt } from "../../lib/study";
import type { Lesson } from "../../types";
export function Quiz({ lesson }: { lesson: Lesson }) {
  const { data, update, ready } = useLearning(),
    [answers, setAnswers] = useState<Record<string, number>>({}),
    [submitted, setSubmitted] = useState(false),
    [score, setScore] = useState(0);
  const submittedRef = useRef(false);
  const [error, setError] = useState("");
  function submit() {
    if (!ready || submittedRef.current) return;
    if ((data.study?.history.length ?? 0) >= 100) {
      setError("历史记录已满，请先导出档案。不会自动删除历史。");
      return;
    }
    const result = makeAttempt(
      lesson,
      answers,
      "quiz",
      `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      new Date().toISOString(),
    );
    submittedRef.current = true;
    setScore(result.score);
    setSubmitted(true);
    update((p) => saveAttempt(p, result));
  }
  return (
    <section className="panel" id="knowledge-check">
      <p className="eyebrow">检验理解</p>
      <h2>知识测验</h2>
      {error && <p role="alert">{error}</p>}
      <p className="muted">
        共 {lesson.quiz.length}{" "}
        道英文题目，最近、最高成绩与真实作答历史分别保存。
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        {lesson.quiz.map((q, index) => (
          <fieldset key={q.id} disabled={submitted}>
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
              <p className="feedback">
                {answers[q.id] === q.answer ? "回答正确" : "回答错误"} ·{" "}
                {q.explanation}
              </p>
            )}
          </fieldset>
        ))}
        {submitted ? (
          <div role="status" className="quiz-summary">
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
              !ready || Object.keys(answers).length !== lesson.quiz.length
            }
          >
            提交测验
          </button>
        )}
      </form>
    </section>
  );
}
