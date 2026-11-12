// CSS tokens are the single source of timing, easing and distance. No animation gates data updates.
export type MotionPhase = "press" | "state" | "scene";
export function motionMilliseconds(value: string) {
  const match = value.trim().match(/^(-?\d*\.?\d+)(ms|s)$/);
  if (!match) return 0;
  const duration = Number(match[1]) * (match[2] === "s" ? 1000 : 1);
  return Number.isFinite(duration) && duration > 0 ? duration : 0;
}
const running = new WeakMap<Element, Animation>();
export const reducedMotion = () =>
  typeof window === "undefined" ||
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export function cancelMotion(element: Element | null) {
  if (element) {
    const animation = running.get(element);
    running.delete(element);
    animation?.cancel();
  }
}
export function playFrames(
  element: Element | null,
  frames: Keyframe[],
  phase: MotionPhase = "state",
  multiplier = 1,
  fill: FillMode = "none",
) {
  if (!element) return null;
  cancelMotion(element);
  if (reducedMotion() || !element.animate) return null;
  const style = getComputedStyle(element);
  const duration = motionMilliseconds(
    style.getPropertyValue(`--motion-${phase}`),
  );
  if (!Number.isFinite(duration) || duration <= 0) return null;
  const animation = element.animate(frames, {
    duration: duration * multiplier,
    easing: style.getPropertyValue("--motion-ease").trim() || "ease-out",
    fill,
  });
  running.set(element, animation);
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finishReduced = () => {
    if (media.matches) animation.finish();
  };
  media.addEventListener("change", finishReduced);
  const cleanup = (cancelled: boolean) => {
    media.removeEventListener("change", finishReduced);
    // A finished exit must hold its final frame through the React commit boundary.
    // Keep ownership so rapid reopen/unmount can cancel that retained effect.
    if ((fill === "none" || cancelled) && running.get(element) === animation)
      running.delete(element);
  };
  // Cancellation is expected on rapid input / unmount, never an unhandled rejection.
  animation.finished.then(
    () => cleanup(false),
    () => cleanup(true),
  );
  return animation;
}
export function reveal(
  element: Element | null,
  direction: "in" | "out" = "in",
) {
  if (!element) return null;
  const style = getComputedStyle(element);
  const distance = style.getPropertyValue("--motion-distance").trim();
  const scale = style.getPropertyValue("--motion-enter-scale").trim();
  const hidden = {
    opacity: Number(style.getPropertyValue("--motion-hidden-opacity")),
    transform: `translateY(${distance}) scale(${scale})`,
  };
  const current = running.has(element)
    ? { opacity: style.opacity, transform: style.transform }
    : null;
  return playFrames(
    element,
    direction === "in"
      ? [current ?? hidden, { opacity: 1, transform: "translateY(0) scale(1)" }]
      : [
          current ?? { opacity: 1, transform: "translateY(0) scale(1)" },
          hidden,
        ],
    "state",
    1,
    direction === "out" ? "forwards" : "none",
  );
}
export function revealRoute(element: Element | null) {
  if (!element) return null;
  const style = getComputedStyle(element);
  return playFrames(
    element,
    [
      {
        opacity: Number(style.getPropertyValue("--motion-route-opacity")),
        transform: `translateY(${style.getPropertyValue("--motion-route-distance").trim()})`,
      },
      { opacity: 1, transform: "translateY(0)" },
    ],
    "press",
  );
}
