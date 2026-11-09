import { it, expect } from "vitest";
import { StorageSession } from "../src/lib/storage-session";
import { initialProgress, STORAGE_KEY } from "../src/lib/storage";
function memory(raw: string | null) {
  let value = raw;
  return {
    getItem: () => value,
    setItem: (_key: string, v: string) => {
      value = v;
    },
    value: () => value,
  };
}
it.each(["{broken", '{"version":99}', ""])(
  "never auto-overwrites recovery data %s",
  (raw) => {
    const store = memory(raw),
      s = new StorageSession(() => store);
    s.load();
    expect(s.save(initialProgress())).toBe(false);
    expect(store.value()).toBe(raw);
    expect(s.raw).toBe(raw);
  },
);
it("only explicit replacement can reset protected data; cancelled action leaves it intact", () => {
  const store = memory("{broken"),
    s = new StorageSession(() => store);
  s.load();
  expect(store.value()).toBe("{broken");
  expect(s.replace(initialProgress())).toBe(true);
  expect(JSON.parse(store.value()!).version).toBe(1);
});
it("reports failed writes and preserves original data", () => {
  const old = JSON.stringify(initialProgress());
  const store = {
    getItem: () => old,
    setItem: () => {
      throw new Error("quota");
    },
  };
  const s = new StorageSession(() => store);
  s.load();
  expect(s.save(initialProgress())).toBe(false);
  expect(s.status).toBe("write-error");
  expect(s.warning).toContain("无法保存");
  expect(s.raw).toBe(old);
});
it("blocks writes when storage is unavailable", () => {
  const s = new StorageSession(() => {
    throw new Error("SecurityError");
  });
  s.load();
  expect(s.raw).toBeUndefined();
  expect(s.save(initialProgress())).toBe(false);
  expect(s.replace(initialProgress())).toBe(false);
});
it("detects other-tab changes instead of overwriting them", () => {
  const store = memory(null),
    s = new StorageSession(() => store);
  s.load();
  const foreign = JSON.stringify({ ...initialProgress(), theme: "light" });
  store.setItem(STORAGE_KEY, foreign);
  expect(s.save(initialProgress())).toBe(false);
  expect(store.value()).toBe(foreign);
  expect(s.status).toBe("conflict");
  expect(s.save(initialProgress())).toBe(false);
});
it("saves first use and loads legacy backups", () => {
  const store = memory(null),
    s = new StorageSession(() => store);
  s.load();
  expect(s.status).toBe("first-use");
  expect(s.save(initialProgress())).toBe(true);
  const loaded = new StorageSession(() => store);
  expect(loaded.load()).toEqual(initialProgress());
  expect(loaded.status).toBe("loaded");
});

it("does not partially replace when a confirmed import write fails", () => {
  const old = JSON.stringify(initialProgress());
  const store = {
    getItem: () => old,
    setItem: () => {
      throw new Error("quota");
    },
  };
  const s = new StorageSession(() => store);
  s.load();
  expect(s.replace({ ...initialProgress(), theme: "light" })).toBe(false);
  expect(s.raw).toBe(old);
});
it("detects a foreign update before explicit replace too", () => {
  const store = memory(null),
    s = new StorageSession(() => store);
  s.load();
  store.setItem(STORAGE_KEY, "foreign");
  expect(s.replace(initialProgress())).toBe(false);
  expect(store.value()).toBe("foreign");
});
