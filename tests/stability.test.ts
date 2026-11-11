import { describe, it, expect } from "vitest";
import {
  initialProgress,
  parseProgress,
  readProgress,
} from "../src/lib/storage";
describe("F01 strict import types", () => {
  for (const field of ["currentLesson", "theme", "mode"] as const) {
    for (const value of [[], {}, 42, null, undefined])
      it(`${field} rejects ${JSON.stringify(value)}`, () => {
        expect(() =>
          parseProgress(
            JSON.stringify({ ...initialProgress(), [field]: value }),
          ),
        ).toThrow();
      });
    it(`${field} rejects a coercible single-item array`, () => {
      const p = initialProgress();
      expect(() =>
        parseProgress(JSON.stringify({ ...p, [field]: [p[field]] })),
      ).toThrow();
    });
  }
  it("preserves valid backups and rejects unsupported versions atomically", () => {
    const p = initialProgress();
    p.notes[p.currentLesson] = "keep";
    expect(parseProgress(JSON.stringify(p))).toEqual(p);
    expect(() =>
      parseProgress(JSON.stringify({ ...p, version: 99 })),
    ).toThrow();
    expect(p.notes[p.currentLesson]).toBe("keep");
  });
});
describe("F02 distinguish recovery states", () => {
  it.each(["{broken", '{"version":99}', ""])(
    "preserves unreadable raw data %s",
    (raw) => {
      const r = readProgress({ getItem: () => raw });
      expect(r).toMatchObject({ status: "read-error", raw });
    },
  );
  it("distinguishes first use from a loaded legacy backup", () => {
    expect(readProgress({ getItem: () => null })).toMatchObject({
      status: "first-use",
      raw: null,
    });
    const { reviews, ...legacy } = initialProgress();
    void reviews;
    expect(
      readProgress({ getItem: () => JSON.stringify(legacy) }),
    ).toMatchObject({ status: "loaded", data: { reviews: {} } });
  });
});

it.each(["lessons", "notes", "favorites"])(
  "rejects missing required collection %s",
  (field) => {
    const p: Record<string, unknown> = { ...initialProgress() };
    delete p[field];
    expect(() => parseProgress(JSON.stringify(p))).toThrow();
  },
);
it.each(["1", null, [], {}, 2])("rejects noncanonical version %j", (version) =>
  expect(() =>
    parseProgress(JSON.stringify({ ...initialProgress(), version })),
  ).toThrow(),
);
