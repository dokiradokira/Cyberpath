"use client";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { cancelMotion, playFrames } from "../lib/motion";

/** Native details without JS; bounded height animation with immediate interactive state when hydrated. */
export function AnimatedDetails({
  summary,
  children,
  className = "",
}: {
  summary: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const root = useRef<HTMLDetailsElement>(null),
    body = useRef<HTMLDivElement>(null),
    version = useRef({ value: 0 });
  const id = useId();
  useEffect(() => {
    const element = root.current,
      lifetime = version.current;
    return () => {
      lifetime.value++;
      cancelMotion(element);
    };
  }, []);
  return (
    <details
      ref={root}
      className={`motion-details ${className}`}
      onToggle={() => {
        const element = root.current;
        if (element && !element.hasAttribute("data-moving"))
          element.dataset.expanded = String(element.open);
      }}
    >
      <summary
        aria-controls={id}
        onClick={(event) => {
          event.preventDefault();
          const element = root.current!,
            content = body.current!;
          const next = element.dataset.expanded !== "true",
            token = ++version.current.value;
          const from = element.getBoundingClientRect().height;
          cancelMotion(element);
          element.dataset.expanded = String(next);
          event.currentTarget.setAttribute("aria-expanded", String(next));
          content.inert = !next;
          content.setAttribute("aria-hidden", String(!next));
          element.open = next;
          const to = element.getBoundingClientRect().height;
          element.open = true;
          element.setAttribute("data-moving", "");
          const finish = () => {
            if (version.current.value === token) {
              element.open = next;
              element.removeAttribute("data-moving");
            }
          };
          const animation = playFrames(element, [
            { height: `${from}px` },
            { height: `${to}px` },
          ]);
          if (animation) animation.finished.then(finish, () => {});
          else finish();
        }}
      >
        {summary}
      </summary>
      <div id={id} ref={body} className="motion-details-content">
        {children}
      </div>
    </details>
  );
}
