"use client";
import { useLinkStatus } from "next/link";
import type { ReactNode } from "react";

export function NavFeedback({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  const { pending } = useLinkStatus();
  return (
    <>
      <span
        className="nav-feedback"
        data-nav-pending={pending}
        aria-busy={pending}
      >
        {children}
      </span>
      {pending && (
        <span className="nav-announcement" role="status">
          正在打开{label}
        </span>
      )}
    </>
  );
}
