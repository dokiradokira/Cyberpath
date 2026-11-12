import { expect, it } from "vitest";
import {
  CPU_RESULT_CELL,
  cpuFinished,
  initialCpu,
  runCpu,
  stepCpu,
} from "../src/lib/cpu-sim";

it("loads, adds and stores the result of the fixed program", () => {
  const state = runCpu(initialCpu(7, 5));
  expect(cpuFinished(state)).toBe(true);
  expect(state.memory[CPU_RESULT_CELL]).toBe(12);
  expect(state.steps).toBe(4);
  expect(state.pc).toBe(3);
});

it("executes fetch, decode and execute as separate phases", () => {
  const start = initialCpu(2, 3);
  const fetched = stepCpu(start);
  expect(fetched.phase).toBe("decode");
  expect(fetched.trace.at(-1)).toContain("fetch");
  const decoded = stepCpu(fetched);
  expect(decoded.phase).toBe("execute");
  expect(decoded.trace.at(-1)).toContain("decode");
  const executed = stepCpu(decoded);
  expect(executed.trace.at(-1)).toContain("execute");
  expect(executed.acc).toBe(2);
});

it("changes the result when the learner edits an input cell", () => {
  const first = runCpu(initialCpu(2, 3));
  const second = runCpu(initialCpu(2, 10));
  expect(first.memory[CPU_RESULT_CELL]).toBe(5);
  expect(second.memory[CPU_RESULT_CELL]).toBe(12);
  expect(first.memory[CPU_RESULT_CELL]).not.toBe(
    second.memory[CPU_RESULT_CELL],
  );
});

it("stops at HALT and never mutates the previous state", () => {
  const start = initialCpu(1, 1);
  const finished = runCpu(start);
  expect(start.acc).toBe(0);
  expect(start.memory[CPU_RESULT_CELL]).toBe(0);
  expect(stepCpu(finished)).toBe(finished);
  expect(runCpu(finished).trace.length).toBe(finished.trace.length);
});
