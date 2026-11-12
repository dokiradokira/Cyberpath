"use client";
import { AnimatedDetails } from "../animated-details";
import type { Lesson } from "../../types";

export function ChapterNavigation({
  lesson,
  active,
  onSelect,
  mobile = false,
}: {
  lesson: Lesson;
  active: string;
  onSelect: (id: string) => void;
  mobile?: boolean;
}) {
  const links = (
    <nav aria-label={mobile ? "手机章节目录" : "章节目录"}>
      {lesson.sections.map((s, i) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          aria-current={active === s.id ? "location" : undefined}
          onClick={(e) => {
            e.preventDefault();
            onSelect(s.id);
          }}
        >
          <span>{String(i + 1).padStart(2, "0")}</span>
          <span lang="en">{s.title}</span>
        </a>
      ))}
    </nav>
  );
  return mobile ? (
    <AnimatedDetails className="mobile-chapters" summary="本课章节">
      {links}
    </AnimatedDetails>
  ) : (
    <aside className="lesson-toc">
      <h2>本课章节</h2>
      {links}
      <a href="#practical-experiment">动手实践</a>
      <a href="#knowledge-check">知识测验</a>
    </aside>
  );
}
