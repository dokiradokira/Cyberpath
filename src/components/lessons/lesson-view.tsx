"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Copy } from "lucide-react";
import type { Lesson } from "../../types";
import { availableLessons } from "../../content/lessons";
import { useLearning } from "../learning-provider";
import { Vocabulary } from "./vocabulary";
import { Quiz } from "./quiz";
import { Lab, type LabId } from "../labs/labs";
function Command({
  command,
  explanation,
}: {
  command: string;
  explanation: string;
}) {
  const [status, setStatus] = useState("");
  return (
    <div className="command">
      <div>
        <code>{command}</code>
        <button
          aria-label={`Copy ${command}`}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(command);
              setStatus("Copied");
            } catch {
              setStatus("Select and copy the command manually.");
            }
          }}
        >
          <Copy size={15} /> Copy
        </button>
      </div>
      <p>{explanation}</p>
      <span role="status">{status}</span>
    </div>
  );
}
export function LessonView({ lesson }: { lesson: Lesson }) {
  const { data, update } = useLearning();
  const record = data.lessons[lesson.id],
    previous = availableLessons[lesson.number - 2],
    next = availableLessons[lesson.number];
  useEffect(() => {
    update((p) => ({
      ...p,
      currentLesson: lesson.id,
      lessons: {
        ...p.lessons,
        [lesson.id]: {
          ...p.lessons[lesson.id],
          visited: true,
          updated: new Date().toISOString(),
        },
      },
    }));
  }, [lesson.id, update]);
  function track(title: string) {
    update((p) => ({
      ...p,
      lessons: {
        ...p.lessons,
        [lesson.id]: { ...p.lessons[lesson.id], section: title },
      },
    }));
  }
  return (
    <>
      <Link className="back-link" href="/courses">
        <ArrowLeft size={15} /> Course library
      </Link>
      <header className="page-heading">
        <p className="eyebrow">
          FOUNDATIONS / LESSON {String(lesson.number).padStart(2, "0")}
        </p>
        <h1>{lesson.title}</h1>
        <p lang="zh-CN">
          {lesson.zh} <span className="dot">·</span> Estimated {lesson.minutes}{" "}
          min
        </p>
      </header>
      <div className="lesson-layout">
        <article>
          <section className="panel">
            <p className="eyebrow">YOUR DESTINATION</p>
            <h2>What you will learn</h2>
            <ul className="objectives">
              {lesson.objectives.map((o) => (
                <li key={o}>
                  <Check size={17} />
                  {o}
                </li>
              ))}
            </ul>
          </section>
          {record.section && (
            <a
              className="resume-section"
              href={`#section-${lesson.sections.findIndex((s) => s.title === record.section)}`}
            >
              Resume section: {record.section} <ArrowRight size={16} />
            </a>
          )}
          {lesson.sections.map((s, i) => (
            <section
              className="reading-section"
              key={s.title}
              id={`section-${i}`}
            >
              <p className="eyebrow">
                {String(i + 1).padStart(2, "0")} / CONCEPT
              </p>
              <h2>{s.title}</h2>
              <p>{s.text}</p>
              <button className="text-button" onClick={() => track(s.title)}>
                {record.section === s.title
                  ? "✓ Bookmark saved"
                  : "Bookmark this section"}
              </button>
            </section>
          ))}
          <section className="panel">
            <h2>Words worth knowing</h2>
            <p className="muted">
              Tap a term for a simple English definition. Bookmark words to
              review later.
            </p>
            <div className="vocabulary-grid">
              {lesson.vocabulary.map((v) => (
                <Vocabulary key={v.word} item={v} />
              ))}
            </div>
          </section>
          {lesson.labs.map((id) => (
            <Lab key={id} id={id as LabId} />
          ))}
          <section className="panel" id="practical-experiment">
            <p className="eyebrow">WINDOWS / GUIDED PRACTICE</p>
            <h2>Practical Experiment</h2>
            <p>
              Open Windows Terminal or PowerShell yourself. Run these read-only
              diagnostics, compare the output with the explanation, and record
              what you observe. Commands are displayed as text; this site never
              executes them.
            </p>
            {lesson.commands.map((c) => (
              <Command key={c.command} {...c} />
            ))}
          </section>
          <Quiz lesson={lesson} />
          <section className="panel">
            <h2>Your field notes</h2>
            <label htmlFor="lesson-notes">
              What clicked? What would you like to investigate?
            </label>
            <textarea
              id="lesson-notes"
              maxLength={10000}
              rows={5}
              value={data.notes[lesson.id] ?? ""}
              onChange={(e) =>
                update((p) => ({
                  ...p,
                  notes: { ...p.notes, [lesson.id]: e.target.value },
                }))
              }
            />
            <small className="muted">
              Saved locally as you type · {(data.notes[lesson.id] ?? "").length}
              /10,000
            </small>
          </section>
          <div className="completion panel">
            <div>
              <h3>
                {record.completed
                  ? "Lesson completed. Keep exploring."
                  : "Ready for the next step?"}
              </h3>
              <p className="muted">
                Completion is your choice and is independent of your quiz score.
              </p>
            </div>
            <button
              className="primary"
              disabled={record.completed}
              onClick={() =>
                update((p) => ({
                  ...p,
                  lessons: {
                    ...p.lessons,
                    [lesson.id]: {
                      ...record,
                      completed: true,
                      updated: new Date().toISOString(),
                    },
                  },
                }))
              }
            >
              <Check size={17} />
              {record.completed ? "Completed" : "Mark lesson complete"}
            </button>
          </div>
          <nav className="lesson-navigation" aria-label="Lesson navigation">
            {previous ? (
              <Link href={`/courses/${previous.id}`}>
                <ArrowLeft size={16} /> Previous: Lesson {previous.number}
              </Link>
            ) : (
              <Link href="/courses">Back to library</Link>
            )}
            {next ? (
              <Link href={`/courses/${next.id}`}>
                Next: Lesson {next.number} <ArrowRight size={16} />
              </Link>
            ) : (
              <Link href="/progress">
                View your progress <ArrowRight size={16} />
              </Link>
            )}
          </nav>
        </article>
        <aside className="lesson-toc">
          <p className="eyebrow">IN THIS LESSON</p>
          {lesson.sections.map((s, i) => (
            <a
              key={s.title}
              href={`#section-${i}`}
              onClick={() => track(s.title)}
            >
              {String(i + 1).padStart(2, "0")} {s.title}
            </a>
          ))}
          <a href="#practical-experiment">Practical Experiment</a>
          <a href="#knowledge-check">Knowledge Check</a>
          <div className="notice">
            Small steps, strong foundations.
            <br />
            <span lang="zh-CN">理解原理，比记住答案更重要。</span>
          </div>
        </aside>
      </div>
    </>
  );
}
