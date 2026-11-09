"use client";
import { useState } from "react";
import { useLearning } from "../learning-provider";
import { gradeQuiz } from "../../lib/quiz";
import type { Lesson } from "../../types";
export function Quiz({ lesson }: { lesson: Lesson }) {
  const { update } = useLearning(),
    [answers, setAnswers] = useState<Record<string, number>>({}),
    [submitted, setSubmitted] = useState(false),
    [score, setScore] = useState(0);
  function submit() {
    const result = gradeQuiz(lesson.quiz, answers);
    setScore(result.score);
    setSubmitted(true);
    update((p) => {
      const old = p.lessons[lesson.id];
      return {
        ...p,
        lessons: {
          ...p.lessons,
          [lesson.id]: {
            ...old,
            latest: result.score,
            best: Math.max(old.best ?? 0, result.score),
            incorrect: result.incorrect,
            updated: new Date().toISOString(),
          },
        },
      };
    });
  }
  return (
    <section className="panel" id="knowledge-check">
      <p className="eyebrow">检验理解</p>
      <h2>知识测验</h2>
      <p className="muted">
        共 5 道英文题目，按自己的节奏作答。最近与最高成绩分别保存 。
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
            disabled={Object.keys(answers).length !== lesson.quiz.length}
          >
            提交测验
          </button>
        )}
      </form>
    </section>
  );
}
