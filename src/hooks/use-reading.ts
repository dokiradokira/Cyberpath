"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Lesson, Progress, RecordEntry } from "../types";
import { reveal } from "../lib/motion";
import { resolveSection } from "../lib/reading";

const TOP = 96;
export function useReading(
  lesson: Lesson,
  record: RecordEntry,
  ready: boolean,
  update: (fn: (p: Progress) => Progress) => void,
) {
  const [active, setActive] = useState(lesson.sections[0]?.id ?? "");
  const saved = useRef(record);
  const programmatic = useRef(false);
  useEffect(() => {
    saved.current = record;
  }, [record]);
  const remember = useCallback(
    (id: string, progress: number) => {
      setActive(id);
      update((p) => {
        const old = p.lessons[lesson.id];
        if (
          p.currentLesson === lesson.id &&
          old.section === id &&
          Math.abs((old.sectionProgress ?? 0) - progress) < 0.01
        )
          return p;
        return {
          ...p,
          currentLesson: lesson.id,
          lessons: {
            ...p.lessons,
            [lesson.id]: { ...old, section: id, sectionProgress: progress },
          },
        };
      });
    },
    [lesson.id, update],
  );

  const go = useCallback(
    (id: string) => {
      if (!ready) return;
      const section = resolveSection(lesson, id);
      if (!section) return;
      const element = document.getElementById(section.id);
      if (!element) return;
      // Instant positioning avoids recording intermediate sections during smooth scrolling.
      programmatic.current = true;
      window.scrollTo({
        top: Math.max(
          0,
          window.scrollY + element.getBoundingClientRect().top - TOP,
        ),
        behavior: "instant",
      });
      window.history.replaceState(null, "", `#${section.id}`);
      remember(section.id, 0);
      element.focus({ preventScroll: true });
      reveal(element.querySelector("h2"));
      requestAnimationFrame(() => {
        programmatic.current = false;
      });
    },
    [lesson, ready, remember],
  );

  useEffect(() => {
    if (!ready) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let restored = false;
    function observe() {
      if (!restored || programmatic.current) return;
      const sections = lesson.sections
        .map((s) => ({ section: s, element: document.getElementById(s.id) }))
        .filter((x) => x.element);
      if (!sections.length) return;
      // Do not replace the last reading bookmark while the learner works in a lab/quiz below the article.
      const last = sections[sections.length - 1].element!;
      if (last.getBoundingClientRect().bottom < TOP) return;
      const current =
        [...sections]
          .reverse()
          .find((x) => x.element!.getBoundingClientRect().top <= TOP + 8) ??
        sections[0];
      const rect = current.element!.getBoundingClientRect();
      remember(
        current.section.id,
        Math.max(0, Math.min(1, (TOP - rect.top) / Math.max(1, rect.height))),
      );
    }
    function scroll() {
      if (timer !== undefined) return;
      timer = setTimeout(() => {
        timer = undefined;
        observe();
      }, 250);
    }
    function hash() {
      let value: string;
      try {
        value = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        return;
      }
      const target = resolveSection(lesson, value);
      if (target) go(target.id);
    }
    const frame = requestAnimationFrame(() => {
      let hashValue = "";
      try {
        hashValue = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        /* Invalid links must not prevent reading. */
      }
      const explicit = resolveSection(lesson, hashValue);
      const target =
        explicit ??
        (!hashValue
          ? resolveSection(lesson, saved.current.section)
          : undefined);
      if (target) {
        const element = document.getElementById(target.id);
        if (element) {
          const sameBookmark =
            resolveSection(lesson, saved.current.section)?.id === target.id;
          const fraction =
            !explicit || sameBookmark
              ? (saved.current.sectionProgress ?? 0)
              : 0;
          window.scrollTo({
            top: Math.max(
              0,
              window.scrollY +
                element.getBoundingClientRect().top +
                fraction * element.getBoundingClientRect().height -
                TOP,
            ),
            behavior: "instant",
          });
          remember(target.id, fraction);
        }
      } else if (!hashValue) remember(lesson.sections[0].id, 0);
      restored = true;
    });
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("hashchange", hash);
    window.addEventListener("pagehide", observe);
    return () => {
      cancelAnimationFrame(frame);
      if (timer !== undefined) clearTimeout(timer);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("hashchange", hash);
      window.removeEventListener("pagehide", observe);
    };
  }, [lesson, ready, remember, go]);
  return { active, go };
}
