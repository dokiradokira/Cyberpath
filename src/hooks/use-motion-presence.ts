"use client";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { cancelMotion, reveal } from "../lib/motion";

export function useMotionPresence() {
  const [open, setOpen] = useState(false),
    [present, setPresent] = useState(false);
  const panel = useRef<HTMLSpanElement>(null),
    generation = useRef({ value: 0 });
  const show = useCallback(() => {
    generation.current.value++;
    setPresent(true);
    setOpen(true);
  }, []);
  const hide = useCallback(() => {
    const version = ++generation.current.value;
    setOpen(false); // Immediately inert/hidden to assistive technology; only the visual tail remains.
    const animation = reveal(panel.current, "out");
    if (!animation) setPresent(false);
    else
      animation.finished.then(
        () => {
          if (generation.current.value === version) setPresent(false);
        },
        () => {},
      );
  }, []);
  useLayoutEffect(() => {
    if (open) reveal(panel.current);
  }, [open]);
  useLayoutEffect(() => {
    const element = panel.current,
      lifetime = generation.current;
    return () => {
      lifetime.value++;
      cancelMotion(element);
    };
  }, [present]);
  return { open, present, panel, show, hide };
}
