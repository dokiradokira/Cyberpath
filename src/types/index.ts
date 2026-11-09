export type Vocabulary = { word: string; zh: string; definition: string };
export type Question = {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
};
export type Lesson = {
  id: string;
  number: number;
  title: string;
  zh: string;
  description: string;
  minutes: number;
  available: boolean;
  /** Content revision where this lesson first became available; defaults to 1. */
  introducedIn?: number;
  objectives: string[];
  sections: {
    id: string;
    title: string;
    text: string;
    legacyTitles?: string[];
  }[];
  vocabulary: Vocabulary[];
  labs: string[];
  commands: { command: string; explanation: string }[];
  quiz: Question[];
};
export type RecordEntry = {
  completed: boolean;
  latest: number | null;
  best: number | null;
  incorrect: string[];
  visited: boolean;
  section: string;
  sectionProgress?: number;
  updated: string;
};
export type Progress = {
  version: 1;
  contentVersion?: number;
  lessons: Record<string, RecordEntry>;
  currentLesson: string;
  favorites: string[];
  reviews: Record<
    string,
    { known: boolean; attempts: number; correct: number }
  >;
  notes: Record<string, string>;
  theme: "dark" | "light";
  mode: "learning" | "challenge";
};
