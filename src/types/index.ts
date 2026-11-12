export type Vocabulary = {
  word: string;
  zh: string;
  definition: string;
  /** Optional usage sentence shown in the shared vocabulary detail panel. */
  example?: string;
  /** Alternate surface forms matched by the shared reading highlighter. */
  aliases?: string[];
};
export type Exercise = {
  level: "Understand" | "Apply" | "Reason";
  prompt: string;
  options: string[];
  answer: number;
  /** One targeted explanation per option, indexed like options. */
  feedback: string[];
};
export type LessonBrief = {
  prerequisites: string[];
  technicalGoals: string[];
  englishGoals: string[];
  completion: string;
};
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
  /** Display label for the course family shown in the reader header. */
  category?: string;
  brief?: LessonBrief;
  exercises?: Exercise[];
  /** Platform label and instructions for the hands-on command panel. */
  practice?: { label: string; intro: string };
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
  lastVisitedAt?: string;
  lastQuizAt?: string;
  completedAt?: string;
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
  study?: { version: 1; history: QuizAttempt[] };
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
export type AnswerSnapshot = Question & {
  topicId: string;
  sectionId: string;
  selected: number;
  correct: boolean;
};
export type QuizAttempt = {
  id: string;
  lessonId: string;
  kind: "quiz" | "review";
  at: string;
  score: number;
  total: number;
  questions: AnswerSnapshot[];
};
