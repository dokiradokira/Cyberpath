"use client";
import { useLearning } from "../learning-provider";

/**
 * Labs render in static HTML before React and the learning profile are ready.
 * Controls stay disabled until then so an early tap or keystroke cannot be
 * dropped by hydration.
 */
export function useLabReady() {
  return useLearning().ready;
}
