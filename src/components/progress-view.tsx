"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { Download, Upload, RotateCcw } from "lucide-react";
import { availableLessons, vocabulary } from "../content/lessons";
import { initialProgress, parseProgress } from "../lib/storage";
import { useLearning } from "./learning-provider";
import { Vocabulary } from "./lessons/vocabulary";
export function ProgressView() {
  const { data, update } = useLearning(),
    [message, setMessage] = useState(""),
    [importing, setImporting] = useState(false),
    file = useRef<HTMLInputElement>(null);
  function exportData() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "cyberpath-progress.json";
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Backup exported.");
  }
  return (
    <>
      <header className="page-heading">
        <p className="eyebrow">EVERY STEP COUNTS</p>
        <h1>Your progress, your pace.</h1>
        <p>
          A record of what you have learned, and what you are still curious
          about.
        </p>
      </header>
      <section className="panel">
        <h2>Learning record</h2>
        <p className="muted">
          {availableLessons.filter((l) => data.lessons[l.id].completed).length}{" "}
          / 3 available lessons completed. Quiz scores are out of 5.
        </p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Lesson</th>
                <th>Status</th>
                <th>Latest</th>
                <th>Best</th>
              </tr>
            </thead>
            <tbody>
              {availableLessons.map((l) => (
                <tr key={l.id}>
                  <td>
                    <Link href={`/courses/${l.id}`}>
                      {l.number}. {l.title}
                    </Link>
                  </td>
                  <td>
                    {data.lessons[l.id].completed
                      ? "Completed"
                      : data.lessons[l.id].visited
                        ? "In Progress"
                        : "Not Started"}
                  </td>
                  <td>{data.lessons[l.id].latest ?? "—"}</td>
                  <td>{data.lessons[l.id].best ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel">
        <h2>Questions to revisit</h2>
        {availableLessons.flatMap((l) =>
          l.quiz.filter((q) => data.lessons[l.id].incorrect.includes(q.id)),
        ).length === 0 ? (
          <p className="muted">
            No incorrect answers recorded. Submitted quiz mistakes will appear
            here with explanations.
          </p>
        ) : (
          availableLessons.flatMap((l) =>
            l.quiz
              .filter((q) => data.lessons[l.id].incorrect.includes(q.id))
              .map((q) => (
                <div className="review-question" key={q.id}>
                  <small>LESSON {l.number}</small>
                  <h3>{q.prompt}</h3>
                  <p>
                    <strong>Correct answer:</strong> {q.options[q.answer]}
                  </p>
                  <p>{q.explanation}</p>
                  <Link href={`/courses/${l.id}#knowledge-check`}>
                    Retake lesson quiz →
                  </Link>
                </div>
              )),
          )
        )}
      </section>
      <section className="panel">
        <h2>
          Saved vocabulary{" "}
          <span className="badge">{data.favorites.length}</span>
        </h2>
        {data.favorites.length ? (
          <div className="vocabulary-grid">
            {vocabulary
              .filter((v) => data.favorites.includes(v.word))
              .map((v) => (
                <Vocabulary key={v.word} item={v} />
              ))}
          </div>
        ) : (
          <p className="muted">
            Bookmark a word in a lesson to build your personal word list.
          </p>
        )}
      </section>
      <section className="panel">
        <h2>Field notes</h2>
        {availableLessons.filter((l) => data.notes[l.id]).length ? (
          availableLessons
            .filter((l) => data.notes[l.id])
            .map((l) => (
              <div className="saved-note" key={l.id}>
                <Link href={`/courses/${l.id}`}>{l.title}</Link>
                <p>{data.notes[l.id]}</p>
              </div>
            ))
        ) : (
          <p className="muted">
            Write a note at the end of a lesson. It will appear here.
          </p>
        )}
      </section>
      <section className="panel">
        <h2>Your data stays with you</h2>
        <p>
          Progress is saved in this browser only. Private browsing, clearing
          site data, or changing devices may remove or separate your records.
          Export a backup to move your learning history between devices.
        </p>
        <div className="data-actions">
          <button onClick={exportData}>
            <Download size={16} /> Export JSON
          </button>
          <button disabled={importing} onClick={() => file.current?.click()}>
            <Upload size={16} /> Import JSON
          </button>
          <button
            className="danger"
            onClick={() => {
              if (
                window.confirm(
                  "Reset all lesson progress, quiz scores, vocabulary, notes, and preferences on this device?",
                )
              ) {
                update(() => initialProgress());
                setMessage("Learning data reset.");
              }
            }}
          >
            <RotateCcw size={16} /> Reset data
          </button>
        </div>
        <input
          ref={file}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={async (e) => {
            const input = e.currentTarget,
              selected = input.files?.[0];
            if (!selected) return;
            setImporting(true);
            try {
              if (selected.size > 1000000)
                throw new Error("File is too large (maximum 1 MB).");
              const parsed = parseProgress(await selected.text());
              if (
                window.confirm(
                  "Replace ALL current learning records and preferences with this backup?",
                )
              ) {
                update(() => parsed);
                setMessage("Backup imported successfully.");
              } else
                setMessage("Import cancelled. Your data has been preserved.");
            } catch (error) {
              setMessage(`Import failed: ${(error as Error).message}`);
            } finally {
              setImporting(false);
              input.value = "";
            }
          }}
        />
        <p role="status">{message}</p>
        <details>
          <summary>Already studied elsewhere? Add an existing record</summary>
          <p>
            This explicitly records Lesson 1 and Lesson 2 as completed and a 5/5
            score for Lesson 2. No other lesson is changed.
          </p>
          <button
            onClick={() => {
              if (
                window.confirm(
                  "Record Lesson 1 and 2 as completed, and Lesson 2 as 5/5?",
                )
              ) {
                update((p) => {
                  const copy = { ...p, lessons: { ...p.lessons } };
                  for (const l of availableLessons.slice(0, 2)) {
                    copy.lessons[l.id] = {
                      ...p.lessons[l.id],
                      completed: true,
                      visited: true,
                      updated: new Date().toISOString(),
                    };
                  }
                  copy.lessons[availableLessons[1].id] = {
                    ...copy.lessons[availableLessons[1].id],
                    latest: 5,
                    best: 5,
                    incorrect: [],
                  };
                  return copy;
                });
                setMessage("Existing learning record added.");
              }
            }}
          >
            Add Lesson 1–2 record
          </button>
        </details>
      </section>
    </>
  );
}
