"use client";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Clock3,
  FlaskConical,
  Globe2,
  Network,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { courseSummaries } from "../content/course-summaries";
import { availableLessons, lessons } from "../content/lessons";
import { useLearning } from "./learning-provider";
export function CourseCards() {
  const { data } = useLearning();
  return (
    <div className="course-grid">
      {lessons.map((l) => {
        const r = data.lessons[l.id];
        return (
          <section
            className={`panel course-card ${!l.available ? "coming-soon" : ""}`}
            key={l.id}
          >
            <div className="card-top">
              <span className="lesson-number">
                {String(l.number).padStart(2, "0")}
              </span>
              <span className={`badge ${r?.completed ? "done" : ""}`}>
                {!l.available
                  ? "即将推出"
                  : r.completed
                    ? "已完成"
                    : r.visited
                      ? "学习中"
                      : "未开始"}
              </span>
            </div>
            <h2>{l.zh}</h2>
            <p className="chinese" lang="zh-CN">
              {l.title}
            </p>
            <p>{courseSummaries[l.number - 1]}</p>
            <div className="card-bottom">
              <span>
                <Clock3 size={14} /> 预计 {l.minutes} 分钟
              </span>
              {l.available ? (
                <Link prefetch={false} href={`/courses/${l.id}`}>
                  {r.completed ? "复习" : r.visited ? "继续学习" : "开始学习"}{" "}
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <span>已列入路线图</span>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
export function Overview() {
  const { data } = useLearning(),
    current = availableLessons.find((l) => l.id === data.currentLesson)!,
    completed = availableLessons.filter(
      (l) => data.lessons[l.id].completed,
    ).length,
    percent = Math.round((completed / 3) * 100);
  const recent = availableLessons
      .filter((l) => data.lessons[l.id].updated)
      .sort((a, b) =>
        data.lessons[b.id].updated.localeCompare(data.lessons[a.id].updated),
      ),
    lastQuiz = recent.find((l) => data.lessons[l.id].latest !== null),
    recommended = availableLessons.find((l) => !data.lessons[l.id].completed);
  return (
    <>
      <header className="page-heading dashboard-heading">
        <div>
          <p className="eyebrow">
            <span className="live-dot" /> 你的下一章，从这里开始
          </p>
          <h1>
            欢迎回来<span className="accent">.</span>
          </h1>
          <p>先理解网络，再学习安全。在中文引导中学习，用英文教材拓展视野。</p>
        </div>
        <span className="header-pill">
          <ShieldCheck size={15} /> 零基础友好
        </span>
      </header>
      <div className="stats-grid">
        <div className="stat panel">
          <span>
            学习进度 <Network size={17} />
          </span>
          <strong>
            {percent}
            <small>%</small>
          </strong>
          <div
            className="progress-bar"
            role="progressbar"
            aria-label="课程完成率"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <i style={{ width: `${percent}%` }} />
          </div>
          <small>{completed} / 3 节已开放课程</small>
        </div>
        <div className="stat panel">
          <span>
            已完成课程 <BookOpen size={17} />
          </span>
          <strong>
            {String(completed).padStart(2, "0")}
            <small> / 03</small>
          </strong>
          <small>每理解一个概念，都是一次进步</small>
        </div>
        <div className="stat panel">
          <span>
            最近测验成绩 <Trophy size={17} />
          </span>
          <strong>
            {lastQuiz ? data.lessons[lastQuiz.id].latest : "—"}
            <small>{lastQuiz ? " / 5" : ""}</small>
          </strong>
          <small>
            {lastQuiz
              ? `Lesson ${lastQuiz.number}`
              : "完成测验后，成绩将显示在这里"}
          </small>
        </div>
      </div>
      <div className="dashboard-columns">
        <div>
          <section className="hero-card">
            <div className="hero-copy">
              <p className="eyebrow">
                {data.lessons[current.id].visited
                  ? "继续你的学习旅程"
                  : "从这里开始"}
              </p>
              <span className="hero-meta">
                课程 {String(current.number).padStart(2, "0")} <span>•</span>{" "}
                网络基础
              </span>
              <h2>{current.zh}</h2>
              <p>{courseSummaries[current.number - 1]}</p>
              <div className="hero-actions">
                <Link
                  prefetch={false}
                  className="button primary"
                  href={`/courses/${current.id}`}
                >
                  继续学习 <ArrowRight size={17} />
                </Link>
                <span>
                  <Clock3 size={14} /> ~{current.minutes} 分钟
                </span>
              </div>
            </div>
            <div className="orbit-art" aria-hidden="true">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <span className="orbit-node node-a">
                <Globe2 />
              </span>
              <span className="orbit-node node-b">
                <Network />
              </span>
              <span className="orbit-center">
                <ShieldCheck size={48} />
              </span>
              <span className="orbit-caption">由好奇心连接</span>
            </div>
          </section>
          <section className="panel roadmap">
            <div className="section-heading">
              <div>
                <p className="eyebrow">看见完整路线</p>
                <h2>你的学习路线</h2>
              </div>
              <Link prefetch={false} href="/courses">
                全部 8 节课程 <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="path-list">
              {availableLessons.map((l) => (
                <Link prefetch={false} href={`/courses/${l.id}`} key={l.id}>
                  <span
                    className={`path-number ${data.lessons[l.id].completed ? "finished" : ""}`}
                  >
                    {data.lessons[l.id].completed ? (
                      <Check size={17} />
                    ) : (
                      String(l.number).padStart(2, "0")
                    )}
                  </span>
                  <div>
                    <strong>{l.zh}</strong>
                    <small>
                      {l.title} · 预计 {l.minutes} 分钟
                    </small>
                  </div>
                  <ArrowRight size={16} />
                </Link>
              ))}
              <div className="future-path">
                <span>04–08</span> 安全基础、身份认证与防御实践{" "}
                <span className="badge">即将推出</span>
              </div>
            </div>
          </section>
        </div>
        <aside>
          <section className="panel lab-teaser">
            <span className="icon-box">
              <FlaskConical size={22} />
            </span>
            <p className="eyebrow">动手探索，让原理看得见</p>
            <h2>
              让网络原理
              <br />
              动起来。
            </h2>
            <p>逐步演示 TCP 握手、追踪 DNS 解析，计算你的第一个子网。</p>
            <Link prefetch={false} className="button" href="/labs">
              进入互动实验 <ArrowUpRight size={16} />
            </Link>
            <div className="lab-preview" aria-hidden="true">
              <span>CLIENT</span>
              <i />
              <span>SERVER</span>
              <b>SYN →</b>
            </div>
            <small>4 个交互模拟 · 无需安装环境</small>
          </section>
          <section className="panel next-lesson">
            <p className="eyebrow">推荐下一步</p>
            <h3>{recommended?.zh ?? "复习你感兴趣的概念"}</h3>
            <p>
              {(recommended
                ? courseSummaries[recommended.number - 1]
                : undefined) ?? "基础课程已完成，继续到实验中巩固理解。"}
            </p>
            <Link
              prefetch={false}
              href={recommended ? `/courses/${recommended.id}` : "/labs"}
            >
              开始探索 <ArrowRight size={16} />
            </Link>
          </section>
        </aside>
      </div>
      <section className="panel">
        <div className="section-heading">
          <h2>最近学习记录</h2>
          <Link prefetch={false} href="/progress">
            查看学习进度 <ArrowUpRight size={16} />
          </Link>
        </div>
        {recent.length ? (
          recent.map((l) => (
            <div className="activity" key={l.id}>
              <span className="icon-box">
                <BookOpen size={17} />
              </span>
              <div>
                <strong>{l.zh}</strong>
                <small>
                  {data.lessons[l.id].completed ? "已完成" : "已学习"} ·{" "}
                  {new Date(data.lessons[l.id].updated).toLocaleDateString(
                    "en-GB",
                  )}
                </small>
              </div>
              <Link prefetch={false} href={`/courses/${l.id}`}>
                再次查看 <ArrowRight size={15} />
              </Link>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <BookOpen size={25} />
            <p>学习旅程，从全新的一页开始。</p>
            <small>开始学习后，这里将记录你的足迹。</small>
          </div>
        )}
      </section>
    </>
  );
}
