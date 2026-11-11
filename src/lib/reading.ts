import type { Lesson } from "../types";

// IDs are authored in content, never regenerated from translated titles.
export function resolveSection(lesson: Lesson, value: string) {
  return lesson.sections.find(
    (section, index) =>
      section.id === value ||
      section.title === value ||
      section.legacyTitles?.includes(value) ||
      `section-${index}` === value,
  );
}

export function lessonHref(lesson: Lesson, section: string) {
  const resolved = resolveSection(lesson, section);
  return `/courses/${lesson.id}${resolved ? `#${resolved.id}` : ""}`;
}
