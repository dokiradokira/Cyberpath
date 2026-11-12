import { wordEntries, type WordEntry } from "../content/vocabulary";
const byForm = new Map<string, WordEntry>();
for (const entry of wordEntries) {
  for (const form of [entry.word, ...(entry.aliases ?? [])]) {
    byForm.set(form.toLowerCase(), entry);
  }
}
const pattern = [...byForm.keys()]
  .sort((a, b) => b.length - a.length)
  .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  .join("|");
function contextAt(text: string, offset: number) {
  let start = 0;
  for (const boundary of text.matchAll(/[.!?]\s+(?=[A-Z])/g)) {
    if (boundary.index! >= offset)
      return text.slice(start, boundary.index! + 1);
    start = boundary.index! + boundary[0].length;
  }
  return text.slice(start);
}
export function findTerms(text: string) {
  return [...text.matchAll(new RegExp(`\\b(${pattern})(s?)\\b`, "gi"))].map(
    (match) => {
      // Lowercase "a record" is usually an English article plus the generic noun,
      // whereas "A record" names the IPv4 resource-record type.
      const article =
        match[1].toLowerCase() === "a record" && match[0].startsWith("a ");
      const start = match.index! + (article ? 2 : 0);
      return {
        text: article ? match[0].slice(2) : match[0],
        start,
        end: match.index! + match[0].length,
        entry: byForm.get(article ? "record" : match[1].toLowerCase())!,
        context: contextAt(text, start),
      };
    },
  );
}
