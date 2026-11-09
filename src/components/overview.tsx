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
                  ? "Coming Soon"
                  : r.completed
                    ? "Completed"
                    : r.visited
                      ? "In Progress"
                      : "Not Started"}
              </span>
            </div>
            <h2>{l.title}</h2>
            <p className="chinese" lang="zh-CN">
              {l.zh}
            </p>
            <p>{l.description}</p>
            <div className="card-bottom">
              <span>
                <Clock3 size={14} /> Estimated {l.minutes} min
              </span>
              {l.available ? (
                <Link href={`/courses/${l.id}`}>
                  {r.completed ? "Review" : r.visited ? "Continue" : "Start"}{" "}
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <span>In the roadmap</span>
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
            <span className="live-dot" /> YOUR NEXT CHAPTER STARTS HERE
          </p>
          <h1>
            Welcome back<span className="accent">.</span>
          </h1>
          <p>Build your foundations. Understand the network. Find your path.</p>
        </div>
        <span className="header-pill">
          <ShieldCheck size={15} /> BEGINNER FRIENDLY
        </span>
      </header>
      <div className="stats-grid">
        <div className="stat panel">
          <span>
            Learning progress <Network size={17} />
          </span>
          <strong>
            {percent}
            <small>%</small>
          </strong>
          <div
            className="progress-bar"
            role="progressbar"
            aria-label="Course completion"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <i style={{ width: `${percent}%` }} />
          </div>
          <small>{completed} of 3 available lessons</small>
        </div>
        <div className="stat panel">
          <span>
            Lessons completed <BookOpen size={17} />
          </span>
          <strong>
            {String(completed).padStart(2, "0")}
            <small> / 03</small>
          </strong>
          <small>Every concept is a step forward</small>
        </div>
        <div className="stat panel">
          <span>
            Latest quiz score <Trophy size={17} />
          </span>
          <strong>
            {lastQuiz ? data.lessons[lastQuiz.id].latest : "—"}
            <small>{lastQuiz ? " / 5" : ""}</small>
          </strong>
          <small>
            {lastQuiz
              ? `Lesson ${lastQuiz.number}`
              : "Your first challenge is waiting"}
          </small>
        </div>
      </div>
      <div className="dashboard-columns">
        <div>
          <section className="hero-card">
            <div className="hero-copy">
              <p className="eyebrow">
                {data.lessons[current.id].visited
                  ? "CONTINUE YOUR JOURNEY"
                  : "YOUR STARTING POINT"}
              </p>
              <span className="hero-meta">
                LESSON {String(current.number).padStart(2, "0")} <span>•</span>{" "}
                FOUNDATIONS
              </span>
              <h2>{current.title}</h2>
              <p>{current.description}</p>
              <div className="hero-actions">
                <Link
                  className="button primary"
                  href={`/courses/${current.id}`}
                >
                  Continue Learning <ArrowRight size={17} />
                </Link>
                <span>
                  <Clock3 size={14} /> ~{current.minutes} min
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
              <span className="orbit-caption">CONNECTED BY CURIOSITY</span>
            </div>
          </section>
          <section className="panel roadmap">
            <div className="section-heading">
              <div>
                <p className="eyebrow">THE BIG PICTURE</p>
                <h2>Your learning path</h2>
              </div>
              <Link href="/courses">
                All 8 lessons <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="path-list">
              {availableLessons.map((l) => (
                <Link href={`/courses/${l.id}`} key={l.id}>
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
                    <strong>{l.title}</strong>
                    <small>
                      {l.zh} · Estimated {l.minutes} min
                    </small>
                  </div>
                  <ArrowRight size={16} />
                </Link>
              ))}
              <div className="future-path">
                <span>04–08</span> Security, identity, and defensive practice{" "}
                <span className="badge">Coming Soon</span>
              </div>
            </div>
          </section>
        </div>
        <aside>
          <section className="panel lab-teaser">
            <span className="icon-box">
              <FlaskConical size={22} />
            </span>
            <p className="eyebrow">LESS THEORY. MORE DISCOVERY.</p>
            <h2>
              See the network
              <br />
              in motion.
            </h2>
            <p>
              Step through a handshake, trace DNS, or explore your first subnet.
            </p>
            <Link className="button" href="/labs">
              Open interactive labs <ArrowUpRight size={16} />
            </Link>
            <div className="lab-preview" aria-hidden="true">
              <span>CLIENT</span>
              <i />
              <span>SERVER</span>
              <b>SYN →</b>
            </div>
            <small>4 hands-on simulations · No setup required</small>
          </section>
          <section className="panel next-lesson">
            <p className="eyebrow">UP NEXT</p>
            <h3>{recommended?.title ?? "Revisit your favorite concepts"}</h3>
            <p>
              {recommended?.description ??
                "Your foundations are complete. Keep practicing in the labs."}
            </p>
            <Link href={recommended ? `/courses/${recommended.id}` : "/labs"}>
              Explore next <ArrowRight size={16} />
            </Link>
          </section>
        </aside>
      </div>
      <section className="panel">
        <div className="section-heading">
          <h2>Recent activity</h2>
          <Link href="/progress">
            Your progress <ArrowUpRight size={16} />
          </Link>
        </div>
        {recent.length ? (
          recent.map((l) => (
            <div className="activity" key={l.id}>
              <span className="icon-box">
                <BookOpen size={17} />
              </span>
              <div>
                <strong>{l.title}</strong>
                <small>
                  {data.lessons[l.id].completed ? "Completed" : "Visited"} ·{" "}
                  {new Date(data.lessons[l.id].updated).toLocaleDateString(
                    "en-GB",
                  )}
                </small>
              </div>
              <Link href={`/courses/${l.id}`}>
                Revisit <ArrowRight size={15} />
              </Link>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <BookOpen size={25} />
            <p>A fresh page in your learning journey.</p>
            <small>Start a lesson and your activity will appear here.</small>
          </div>
        )}
      </section>
    </>
  );
}
