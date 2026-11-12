import { expect, it } from "vitest";
import {
  initialDns,
  queryDns,
  advanceDns,
  changeDns,
} from "../src/lib/dns-workshop";
import { availableLessons } from "../src/content/lessons";
import { dnsWorkshop } from "../src/content/lessons/dns-workshop";
import { initialProgress, parseProgress } from "../src/lib/storage";
it("preserves published IDs and old bookmarks while adding substantive scaffolded teaching", () => {
  const l = availableLessons.find((l) => l.id === "dns-tcp-web")!;
  expect(l.sections.slice(0, 7).map((s) => s.id)).toEqual([
    "dns-records",
    "dns-lookup",
    "tcp-reliability",
    "tcp-handshake",
    "udp-transport",
    "https-tls",
    "browser-request",
  ]);
  expect(l.quiz.map((q) => q.id)).toEqual(["w1", "w2", "w3", "w4", "w5"]);
  const p = initialProgress();
  p.notes[l.id] = "existing note";
  p.lessons[l.id].section = "dns-lookup";
  p.favorites = ["packet"];
  expect(parseProgress(JSON.stringify(p))).toEqual(p);
  expect(
    dnsWorkshop.sections
      .map((s) => s.text)
      .join(" ")
      .split(/\s+/).length,
  ).toBeGreaterThan(600);
  expect(dnsWorkshop.exercises.map((q) => q.level)).toEqual([
    "Understand",
    "Apply",
    "Reason",
  ]);
  for (const q of dnsWorkshop.exercises) {
    expect(q.feedback).toHaveLength(q.options.length);
    expect(q.answer).toBeLessThan(q.options.length);
  }
});
it("uses authoritative data on a miss and preserves the original cache expiry on hits", () => {
  const first = queryDns(initialDns());
  expect(first.source).toBe("authority");
  expect(first.answer).toBe("192.0.2.10");
  const changed = changeDns(advanceDns(first, 30), "192.0.2.20");
  const hit = queryDns(changed);
  expect(hit.source).toBe("cache");
  expect(hit.answer).toBe("192.0.2.10");
  expect(hit.cache?.expires).toBe(60);
  const expired = queryDns(advanceDns(hit, 30));
  expect(expired.answer).toBe("192.0.2.20");
  expect(expired.source).toBe("authority");
});
it("retains a negative response until its separate TTL expires", () => {
  const negative = queryDns(changeDns(initialDns(), null));
  expect(negative.answer).toBeNull();
  const created = changeDns(negative, "192.0.2.20");
  expect(queryDns(created).answer).toBeNull();
  expect(queryDns(advanceDns(created, 30)).answer).toBe("192.0.2.20");
});
