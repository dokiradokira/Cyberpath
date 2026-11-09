import type { Question } from "../types";
export function gradeQuiz(
  questions: Question[],
  answers: Record<string, number>,
) {
  if (
    !questions.length ||
    questions.some(
      (q) =>
        !Number.isInteger(answers[q.id]) ||
        answers[q.id] < 0 ||
        answers[q.id] >= q.options.length,
    )
  )
    throw new Error("Answer every question before submitting.");
  const incorrect = questions
    .filter((q) => answers[q.id] !== q.answer)
    .map((q) => q.id);
  return { score: questions.length - incorrect.length, incorrect };
}
