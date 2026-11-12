"use client";
import { useState } from "react";
import type { Exercise } from "../../types";
import { AnnotatedText } from "./annotated-text";

function ExerciseCard({ exercise }: { exercise: Exercise }) {
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

/** Data-driven Understand / Apply / Reason exercises with per-option feedback. */
export function LessonPractice({ exercises }: { exercises: Exercise[] }) {
  return (
    <>
      {exercises.map((exercise) => (
        <ExerciseCard key={exercise.level} exercise={exercise} />
      ))}
    </>
  );
}
