"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { Download, Upload, RotateCcw } from "lucide-react";
import { availableLessons } from "../content/lessons";
import { wordEntries as vocabulary } from "../content/vocabulary";
import { initialProgress, parseProgress } from "../lib/storage";
import { useLearning } from "./learning-provider";
import { Vocabulary } from "./lessons/vocabulary";
export function ProgressView() {
  const { data, update, raw, replace } = useLearning(),
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
    setMessage("备份已导出。");
  }
  return (
    <>
      <header className="page-heading">
        <h1>学习进度</h1>
        <p>课程、测验与笔记</p>
      </header>
      <section className="panel">
        <h2>学习档案</h2>
        <p className="muted">
          {availableLessons.filter((l) => data.lessons[l.id].completed).length}{" "}
          / 3 节开放课程已完成，测验满分为 5 分。
        </p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>课程</th>
                <th>状态</th>
                <th>最近成绩</th>
                <th>最高成绩</th>
              </tr>
            </thead>
            <tbody>
              {availableLessons.map((l) => (
                <tr key={l.id}>
                  <td>
                    <Link prefetch={false} href={`/courses/${l.id}`}>
                      {l.number}. {l.zh}
                    </Link>
                  </td>
                  <td>
                    {data.lessons[l.id].completed
                      ? "已完成"
                      : data.lessons[l.id].visited
                        ? "学习中"
                        : "未开始"}
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
        <h2>错题复习</h2>
        {availableLessons.flatMap((l) =>
          l.quiz.filter((q) => data.lessons[l.id].incorrect.includes(q.id)),
        ).length === 0 ? (
          <p className="muted">
            暂无错题。提交测验后，答错的题目和解释会显示 在这里。
          </p>
        ) : (
          availableLessons.flatMap((l) =>
            l.quiz
              .filter((q) => data.lessons[l.id].incorrect.includes(q.id))
              .map((q) => (
                <div className="review-question" key={q.id}>
                  <small>课程 {l.number}</small>
                  <h3>{q.prompt}</h3>
                  <p>
                    <strong>正确答案：</strong> {q.options[q.answer]}
                  </p>
                  <p>{q.explanation}</p>
                  <Link
                    prefetch={false}
                    href={`/courses/${l.id}#knowledge-check`}
                  >
                    重做本课测验 →
                  </Link>
                </div>
              )),
          )
        )}
      </section>
      <section className="panel">
        <h2>
          收藏词汇 <span className="badge">{data.favorites.length}</span>
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
            在课程中收藏词汇，建立自己的网络安全英语词库。
          </p>
        )}
      </section>
      <section className="panel">
        <h2>学习笔记</h2>
        {availableLessons.filter((l) => data.notes[l.id]).length ? (
          availableLessons
            .filter((l) => data.notes[l.id])
            .map((l) => (
              <div className="saved-note" key={l.id}>
                <Link prefetch={false} href={`/courses/${l.id}`}>
                  {l.zh}
                </Link>
                <p>{data.notes[l.id]}</p>
              </div>
            ))
        ) : (
          <p className="muted">在课程末尾写下笔记，就能在这里集中查看。</p>
        )}
      </section>
      <section className="panel">
        <h2>数据管理</h2>
        <p>
          进度仅保存在当前浏览器。无痕模式、清除网站数据或换设备会影响记录。请定期导出备份，在设备之间用
          JSON 导入迁移。
        </p>
        <div className="data-actions">
          <button
            disabled={typeof raw !== "string"}
            onClick={() => {
              if (typeof raw !== "string") return;
              const url = URL.createObjectURL(
                new Blob([raw], { type: "application/octet-stream" }),
              );
              const a = document.createElement("a");
              a.href = url;
              a.download = "cyberpath-raw-backup.txt";
              a.click();
              URL.revokeObjectURL(url);
              setMessage("原始数据已导出，请妥善保存。");
            }}
          >
            导出原始数据
          </button>
          <button onClick={exportData}>
            <Download size={16} /> 导出 JSON
          </button>
          <button disabled={importing} onClick={() => file.current?.click()}>
            <Upload size={16} /> 导入 JSON
          </button>
          <button
            className="danger"
            onClick={() => {
              if (
                window.confirm(
                  "确定重置本机所有进度、成绩、词汇、笔记和偏好吗？",
                )
              ) {
                setMessage(
                  replace(initialProgress())
                    ? "学习数据已重置。"
                    : "重置未完成，原始数据已保留，请检查存储提示。",
                );
              }
            }}
          >
            <RotateCcw size={16} /> 重置学习数据
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
                throw new Error("文件过大（最大 1 MB）。");
              const parsed = parseProgress(await selected.text());
              if (
                window.confirm("确定用此备份覆盖当前全部学习记录与偏好吗？")
              ) {
                setMessage(
                  replace(parsed)
                    ? "备份导入成功。"
                    : "导入未完成，原始数据已保留，请检查存储提示。",
                );
              } else setMessage("已取消导入，当前记录已保留。");
            } catch (error) {
              setMessage(`导入失败： ${(error as Error).message}`);
            } finally {
              setImporting(false);
              input.value = "";
            }
          }}
        />
        <p role="status">{message}</p>
        <details>
          <summary>已经学过？补录已有学习记录</summary>
          <p>
            此操作会将第 1、2 课明确标记为完成，并将第 2 课录入为 5/5
            。其他课程不受影响。
          </p>
          <button
            onClick={() => {
              if (
                window.confirm(
                  "确定补录第 1、2 课完成，并将第 2 课成绩设为 5/5 吗？",
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
                setMessage("已有学习记录已补录。");
              }
            }}
          >
            补录第 1–2 课记录
          </button>
        </details>
      </section>
    </>
  );
}
