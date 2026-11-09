export function reviewPosition(
  words: string[],
  index: number,
  locked: string | null,
  reviewed: boolean,
) {
  const current = locked ?? words[index % Math.max(1, words.length)];
  const departed = locked !== null && !words.includes(locked);
  return {
    current,
    canNext: words.length > 1 || (departed && words.length > 0),
    canPrevious: words.length > 1 || (departed && words.length > 0),
    finish: locked !== null && words.length === 0,
    complete: !locked && words.length === 0 && reviewed,
  };
}
export function reviewIndex(
  words: string[],
  index: number,
  locked: string | null,
  delta: number,
) {
  if (!words.length) return 0;
  const departed = locked !== null && !words.includes(locked);
  return (
    (index + (departed ? (delta > 0 ? 0 : -1) : delta) + words.length) %
    words.length
  );
}
