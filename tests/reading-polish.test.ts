import { expect, it } from "vitest";
import { findTerms } from "../src/lib/terms";
import { wordEntries } from "../src/content/vocabulary";
import { dnsWorkshop } from "../src/content/lessons/dns-workshop";
import { initialProgress, parseProgress } from "../src/lib/storage";
import { recordWord, toggleWord } from "../src/lib/vocabulary-learning";

it("resolves inflections to existing IDs and prefers complete technical phrases", () => {
  expect(
    findTerms(
      "Cached answers expire. A cache hit leaves the remaining TTL unchanged.",
    ).map((m) => m.entry.id),
  ).toEqual(["cache", "expire", "cache hit", "remaining", "ttl"]);
  expect(findTerms("hostile")).toEqual([]);
  expect(
    findTerms("A record differs from a record in general.").map(
      (m) => m.entry.id,
    ),
  ).toEqual(["a record", "record"]);
  expect(
    findTerms("The cache is empty. The cache now holds an answer.")
      .filter((m) => m.entry.id === "cache")
      .map((m) => m.context),
  ).toEqual(["The cache is empty.", "The cache now holds an answer."]);
  expect(
    findTerms("A records and AAAA records").map((m) => m.entry.id),
  ).toEqual(["a record", "aaaa record"]);
});
it("covers the DNS sample's prerequisite, goals, lab and feedback vocabulary with the shared dictionary", () => {
  for (const text of [
    "client IP address URL host",
    "query authority remaining TTL",
    "resolve cache expire evidence",
    "NXDOMAIN SOA NODATA SERVFAIL timeout",
    "predict variable observe source",
    "invalidate reachability transport",
  ]) {
    expect(
      findTerms(text)
        .map((m) => m.text.toLowerCase())
        .join(" "),
    ).toBe(text.toLowerCase());
  }
  for (const term of findTerms(
    [
      ...dnsWorkshop.prerequisites,
      ...dnsWorkshop.technicalGoals,
      ...dnsWorkshop.englishGoals,
    ].join(" "),
  )) {
    expect(term.entry.zh).toBeTruthy();
    expect(term.entry.example).toBeTruthy();
  }
  expect(new Set(wordEntries.map((w) => w.id)).size).toBe(wordEntries.length);
});

it("roundtrips new phrase IDs with old favorites and reviews without a schema change", () => {
  let profile = initialProgress();
  profile = recordWord(toggleWord(profile, "packet"), "packet", true);
  profile = recordWord(toggleWord(profile, "cache hit"), "cache hit", false);
  const restored = parseProgress(JSON.stringify(profile));
  expect(restored).toEqual(profile);
  expect(restored.favorites).toEqual(["packet", "cache hit"]);
  expect(restored.reviews.packet.known).toBe(true);
  expect(restored.reviews["cache hit"].attempts).toBe(1);
});
