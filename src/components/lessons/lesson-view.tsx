"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Copy } from "lucide-react";
import type { Lesson } from "../../types";
import { availableLessons } from "../../content/lessons";
import { useLearning } from "../learning-provider";
import { Vocabulary } from "./vocabulary";
import { AnnotatedText } from "./annotated-text";
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
          aria-label={`复制 ${command}`}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(command);
              setStatus("已复制");
            } catch {
              setStatus("当前环境不支持自动复制，请选中命令手动复制。");
            }
          }}
        >
          <Copy size={15} /> 复制
        </button>
      </div>
      <p>{explanation}</p>
      <span role="status">{status}</span>
    </div>
  );
}
export function LessonView({ lesson }: { lesson: Lesson }) {
  const { data, update, ready } = useLearning();
  const record = data.lessons[lesson.id],
    previous = availableLessons[lesson.number - 2],
    next = availableLessons[lesson.number];
  useEffect(() => {
    if (!ready) return;
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
  }, [lesson.id, update, ready]);
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
      <Link prefetch={false} className="back-link" href="/courses">
        <ArrowLeft size={15} /> 课程目录
      </Link>
      <header className="page-heading">
        <p className="eyebrow">
          网络基础 / 课程 {String(lesson.number).padStart(2, "0")}
        </p>
        <h1>{lesson.title}</h1>
        <p lang="zh-CN">
          {lesson.zh} <span className="dot">·</span> 预计 {lesson.minutes} 分钟
        </p>
      </header>
      <div className="lesson-layout">
        <article>
          <section className="panel">
            <p className="eyebrow">本课目标</p>
            <h2>你将学到</h2>
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
              继续阅读： {record.section} <ArrowRight size={16} />
            </a>
          )}
          {lesson.sections.map((s, i) => (
            <section
              className="reading-section"
              key={s.title}
              id={`section-${i}`}
            >
              <p className="eyebrow">{String(i + 1).padStart(2, "0")} / 概念</p>
              <h2>{s.title}</h2>
              <p lang="en">
                <AnnotatedText text={s.text} />
              </p>
              <button className="text-button" onClick={() => track(s.title)}>
                {record.section === s.title
                  ? "✓ 已保存章节书签"
                  : "保存章节书签"}
              </button>
            </section>
          ))}
          <section className="panel">
            <h2>本课重点词汇</h2>
            <p className="muted">
              点击词汇查看英文释义，收藏后可在词汇学习页 集中复习。
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
            <p className="eyebrow">WINDOWS / 实践指导</p>
            <h2>动手实践</h2>
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
            <h2>学习笔记</h2>
            <label htmlFor="lesson-notes">
              记下你的理解，或想进一步探索的问题
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
              输入时自动保存到本机 · {(data.notes[lesson.id] ?? "").length}
              /10,000
            </small>
          </section>
          <div className="completion panel">
            <div>
              <h3>
                {record.completed
                  ? "本课已完成，继续探索吧。"
                  : "准备好下一步了吗？"}
              </h3>
              <p className="muted">
                由你决定何时完成本课，完成状态与测验成绩分别记录。
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
              {record.completed ? "已完成" : "标记课程完成"}
            </button>
          </div>
          <nav className="lesson-navigation" aria-label="课程导航">
            {previous ? (
              <Link prefetch={false} href={`/courses/${previous.id}`}>
                <ArrowLeft size={16} /> 上一课： {previous.number}
              </Link>
            ) : (
              <Link prefetch={false} href="/courses">
                返回课程目录
              </Link>
            )}
            {next ? (
              <Link prefetch={false} href={`/courses/${next.id}`}>
                下一课： {next.number} <ArrowRight size={16} />
              </Link>
            ) : (
              <Link prefetch={false} href="/progress">
                查看学习进度 <ArrowRight size={16} />
              </Link>
            )}
          </nav>
        </article>
        <aside className="lesson-toc">
          <p className="eyebrow">本课目录</p>
          {lesson.sections.map((s, i) => (
            <a
              key={s.title}
              href={`#section-${i}`}
              onClick={() => track(s.title)}
            >
              {String(i + 1).padStart(2, "0")} {s.title}
            </a>
          ))}
          <a href="#practical-experiment">动手实践</a>
          <a href="#knowledge-check">知识测验</a>
          <div className="notice">
            一步一步，打好基础。
            <br />
            <span lang="zh-CN">理解原理，比记住答案更重要。</span>
          </div>
        </aside>
      </div>
    </>
  );
}
