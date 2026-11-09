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
  objectives: string[];
  sections: { title: string; text: string }[];
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
  updated: string;
};
export type Progress = {
  version: 1;
  lessons: Record<string, RecordEntry>;
  currentLesson: string;
  favorites: string[];
  notes: Record<string, string>;
  theme: "dark" | "light";
  mode: "learning" | "challenge";
};
