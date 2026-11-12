"use client";
import type { LessonBrief } from "../../types";
import { AnnotatedText } from "./annotated-text";

const groups = [
  { key: "prerequisites", id: "prerequisites", title: "Before you start" },
  { key: "technicalGoals", id: "technical-goals", title: "Technical Goals" },
  { key: "englishGoals", id: "english-goals", title: "English Goals" },
] as const;

/** Shared reading brief used by lessons that teach goals before the prose. */
export function LessonGoals({ brief }: { brief: LessonBrief }) {
  return (
    <div className="learning-brief">
      {groups.map((group) => (
        <section
          className="learning-block"
          key={group.id}
          aria-labelledby={group.id}
        >
          <h2 id={group.id} lang="en">
            {group.title}
          </h2>
          <ul>
            {brief[group.key].map((item) => (
              <li key={item} lang="en">
                <AnnotatedText text={item} />
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p>{brief.completion}</p>
    </div>
  );
}
