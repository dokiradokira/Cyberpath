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
      <p className="eyebrow">PUT IT INTO PRACTICE</p>
      <h2>Knowledge Check</h2>
      <p className="muted">
        Five questions. Take your time. Your latest and best scores are saved
        separately.
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
                {answers[q.id] === q.answer ? "Correct" : "Incorrect"} ·{" "}
                {q.explanation}
              </p>
            )}
          </fieldset>
        ))}
        {submitted ? (
          <div role="status" className="quiz-summary">
            <h3>
              Your score: {score} / {lesson.quiz.length}
            </h3>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setAnswers({});
              }}
            >
              Retake quiz
            </button>
          </div>
        ) : (
          <button
            className="primary"
            type="submit"
            disabled={Object.keys(answers).length !== lesson.quiz.length}
          >
            Submit quiz
          </button>
        )}
      </form>
    </section>
  );
}
