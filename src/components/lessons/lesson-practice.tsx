"use client";
import { useState } from "react";
import type { Exercise } from "../../types";
import { AnnotatedText } from "./annotated-text";

function ChoiceExercise({
  exercise,
}: {
  exercise: Extract<Exercise, { options: string[] }>;
}) {
  const [choice, setChoice] = useState<number | null>(null);
  return (
    <section className="panel" aria-label={`${exercise.level} exercise`}>
      <p className="eyebrow">分层练习</p>
      <h3 lang="en">{exercise.level}</h3>
      <p lang="en">
        <AnnotatedText text={exercise.prompt} />
      </p>
      <div className="meaning-options">
        {exercise.options.map((option, index) => (
          <button
            key={option}
            aria-pressed={choice === index}
            onClick={() => setChoice(index)}
            lang="en"
          >
            {option}
          </button>
        ))}
      </div>
      {choice !== null && (
        <p role="status" lang="en">
          {choice === exercise.answer ? "Correct" : "Try again"} ·{" "}
          <AnnotatedText text={exercise.feedback[choice]} />
        </p>
      )}
    </section>
  );
}

function ExplainExercise({
  exercise,
}: {
  exercise: Extract<Exercise, { hints: string[] }>;
}) {
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  return (
    <section className="panel" aria-label="Explain exercise">
      <p className="eyebrow">分层练习</p>
      <h3 lang="en">{exercise.level}</h3>
      <p lang="en">
        <AnnotatedText text={exercise.prompt} />
      </p>
      <label lang="en" style={{ display: "block", marginTop: 12 }}>
        Your explanation
        <textarea
          aria-label="Your explanation"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          rows={5}
          style={{
            display: "block",
            width: "100%",
            marginTop: 6,
            padding: 10,
            borderRadius: 8,
            border: "1px solid var(--line)",
            background: "var(--bg)",
            color: "var(--text)",
            font: "inherit",
            fontSize: 16,
            resize: "vertical",
          }}
        />
      </label>
      <p className="muted" lang="en">
        Write the mechanism and the evidence you would use, not just a label.
      </p>

      <h4 lang="en">Hints</h4>
      <ul lang="en">
        {exercise.hints.map((hint) => (
          <li key={hint}>
            <AnnotatedText text={hint} />
          </li>
        ))}
      </ul>

      <button
        type="button"
        aria-expanded={revealed}
        onClick={() => setRevealed((value) => !value)}
      >
        {revealed ? "Hide reference explanation" : "Show reference explanation"}
      </button>

      {revealed && (
        <div lang="en">
          <h4>Reference explanation</h4>
          <p>
            <AnnotatedText text={exercise.reference} />
          </p>
          <h4>Common pitfalls</h4>
          <ul>
            {exercise.pitfalls.map((pitfall) => (
              <li key={pitfall}>
                <AnnotatedText text={pitfall} />
              </li>
            ))}
          </ul>
          <p className="caption">
            Compare your answer with the reference, then note the mechanism you
            missed. The text is self-checked; it is not graded or saved.
          </p>
        </div>
      )}
    </section>
  );
}

/** Data-driven Understand / Apply / Reason / Explain practice. */
export function LessonPractice({ exercises }: { exercises: Exercise[] }) {
  return (
    <>
      {exercises.map((exercise) =>
        exercise.level === "Explain" ? (
          <ExplainExercise
            key={exercise.id ?? exercise.level}
            exercise={exercise}
          />
        ) : (
          <ChoiceExercise
            key={exercise.id ?? exercise.level}
            exercise={exercise}
          />
        ),
      )}
    </>
  );
}
