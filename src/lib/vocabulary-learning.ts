import type { Progress } from "../types";
import { wordEntries } from "../content/vocabulary";

// Existing word strings are the permanent IDs used by all schema-1 backups.
const ids = new Set(wordEntries.map((w) => w.id));
export function toggleWord(p: Progress, id: string): Progress {
  if (!ids.has(id)) return p;
  return {
    ...p,
    favorites: p.favorites.includes(id)
      ? p.favorites.filter((w) => w !== id)
      : [...p.favorites, id],
  };
}
export function recordWord(p: Progress, id: string, known: boolean): Progress {
  if (!ids.has(id)) return p;
  const old = p.reviews[id] ?? { known: false, attempts: 0, correct: 0 };
  return {
    ...p,
    reviews: {
      ...p.reviews,
      [id]: {
        known,
        attempts: old.attempts + 1,
        correct: old.correct + (known ? 1 : 0),
      },
    },
  };
}
export function reviewSummary(words: string[], answered: string[]) {
  const seen = new Set(answered);
  return {
    count: seen.size,
    allReviewed: words.length > 0 && words.every((w) => seen.has(w)),
  };
}
