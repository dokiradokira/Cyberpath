import { afterEach, expect, it, vi } from "vitest";
import { playFrames, motionMilliseconds } from "../src/lib/motion";
afterEach(() => vi.unstubAllGlobals());
it.each([
  ["220ms", 220],
  [".22s", 220],
  ["0s", 0],
  ["bad", 0],
  ["-1s", 0],
])("normalizes CSS time %s across browsers", (value, expected) => {
  expect(motionMilliseconds(String(value))).toBe(expected);
});
function setup(matches: boolean) {
  let changed: (() => void) | undefined;
  const media = {
    matches,
    addEventListener: vi.fn((_name: string, callback: () => void) => {
      changed = callback;
    }),
    removeEventListener: vi.fn(),
  };
  vi.stubGlobal("window", { matchMedia: () => media });
  vi.stubGlobal("getComputedStyle", () => ({
    getPropertyValue: (name: string) =>
      name === "--motion-ease" ? "ease-out" : "220ms",
  }));
  return { media, change: () => changed?.() };
}
it("never starts WAAPI when reduced motion is requested", () => {
  setup(true);
  const animate = vi.fn();
  expect(
    playFrames({ animate } as unknown as Element, [
      { opacity: 0 },
      { opacity: 1 },
    ]),
  ).toBeNull();
  expect(animate).not.toHaveBeenCalled();
});
it("retains a finished exit until removal and cancels that retained effect on reopen", async () => {
  setup(false);
  const exit = { finished: Promise.resolve(), cancel: vi.fn() };
  const enter = { finished: Promise.resolve(), cancel: vi.fn() };
  const animate = vi.fn().mockReturnValueOnce(exit).mockReturnValueOnce(enter);
  const element = { animate } as unknown as Element;
  playFrames(element, [{ opacity: 1 }, { opacity: 0 }], "state", 1, "forwards");
  expect(animate.mock.calls[0][1].fill).toBe("forwards");
  await exit.finished;
  await Promise.resolve();
  playFrames(element, [{ opacity: 0 }, { opacity: 1 }]);
  expect(exit.cancel).toHaveBeenCalledOnce();
});
it("replaces interrupted animations, handles cancellation and finishes immediately on reduced-motion changes", async () => {
  const { media, change } = setup(false);
  const create = () => {
    let done!: () => void, stop!: () => void;
    const finished = new Promise<void>((resolve, reject) => {
      done = resolve;
      stop = () => reject(new Error("cancelled"));
    });
    return {
      finished,
      finish: vi.fn(() => done()),
      cancel: vi.fn(() => stop()),
    };
  };
  const first = create(),
    second = create();
  const animate = vi
    .fn()
    .mockReturnValueOnce(first)
    .mockReturnValueOnce(second);
  const element = { animate } as unknown as Element;
  playFrames(element, [{ opacity: 0 }, { opacity: 1 }]);
  playFrames(element, [{ opacity: 1 }, { opacity: 0 }]);
  expect(first.cancel).toHaveBeenCalledOnce();
  expect(animate.mock.calls[1][1]).toMatchObject({
    duration: 220,
    easing: "ease-out",
  });
  media.matches = true;
  change();
  expect(second.finish).toHaveBeenCalledOnce();
  await second.finished;
  await Promise.resolve();
  expect(media.removeEventListener).toHaveBeenCalledTimes(2);
});
