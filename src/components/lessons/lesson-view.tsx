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
import { useReading } from "../../hooks/use-reading";
import { resolveSection } from "../../lib/reading";
import { ChapterNavigation } from "./chapter-navigation";
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
        <pre className="command-code">
          <code lang="en">{command}</code>
        </pre>
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
    courseIndex = availableLessons.findIndex((l) => l.id === lesson.id),
    previous = availableLessons[courseIndex - 1],
    next = availableLessons[courseIndex + 1];
  const { active, go } = useReading(lesson, record, ready, update);
  const chapterIndex = lesson.sections.findIndex((s) => s.id === active);
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
  function track(id: string) {
    update((p) => ({
      ...p,
      lessons: {
        ...p.lessons,
        [lesson.id]: {
          ...p.lessons[lesson.id],
          section: id,
          sectionProgress: 0,
        },
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
        <h1 lang="en">{lesson.title}</h1>
        <p lang="zh-CN">
          {lesson.zh} <span className="dot">·</span> 预计 {lesson.minutes} 分钟
        </p>
      </header>
      <ChapterNavigation lesson={lesson} active={active} onSelect={go} mobile />
      <nav className="chapter-controls" aria-label="章节切换">
        <button
          disabled={!ready || chapterIndex <= 0}
          onClick={() => go(lesson.sections[chapterIndex - 1].id)}
        >
          <ArrowLeft size={16} /> 上一章节
        </button>
        <span lang="en">{resolveSection(lesson, active)?.title}</span>
        <button
          disabled={!ready || chapterIndex >= lesson.sections.length - 1}
          onClick={() => go(lesson.sections[chapterIndex + 1].id)}
        >
          下一章节 <ArrowRight size={16} />
        </button>
      </nav>
      <div className="lesson-layout">
        <article>
          <section className="panel">
            <p className="eyebrow">本课目标</p>
            <h2>你将学到</h2>
            <ul className="objectives" lang="en">
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
              href={`#${resolveSection(lesson, record.section)?.id ?? lesson.sections[0].id}`}
              onClick={(e) => {
                e.preventDefault();
                go(record.section);
              }}
            >
              继续阅读： {resolveSection(lesson, record.section)?.title}{" "}
              <ArrowRight size={16} />
            </a>
          )}
          {lesson.sections.map((s, i) => (
            <section
              className="reading-section"
              key={s.id}
              id={s.id}
              tabIndex={-1}
              data-active={active === s.id}
            >
              <div id={`section-${i}`}>
                <p className="eyebrow">
                  {String(i + 1).padStart(2, "0")} / 概念
                </p>
                <h2 lang="en">{s.title}</h2>
                <p lang="en">
                  <AnnotatedText text={s.text} />
                </p>
                <button className="text-button" onClick={() => track(s.id)}>
                  {record.section === s.id ? "已保存章节书签" : "保存章节书签"}
                </button>
              </div>
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
          <Quiz key={lesson.id} lesson={lesson} />
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
              <h3>{record.completed ? "本课已完成" : "课程完成确认"}</h3>
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
        <ChapterNavigation lesson={lesson} active={active} onSelect={go} />
      </div>
    </>
  );
}
