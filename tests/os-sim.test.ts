import { expect, it } from "vitest";
import {
  defaultOsProcesses,
  simulate,
  simulateFcfs,
  simulateRoundRobin,
} from "../src/lib/os-sim";

it("runs first come first served to completion in arrival order", () => {
  const result = simulateFcfs(defaultOsProcesses());
  expect(result.order).toEqual(["p1", "p2", "p3"]);
  expect(result.completion).toEqual({ p1: 5, p2: 8, p3: 9 });
  expect(result.waiting.p2).toBe(4);
  expect(result.waiting.p3).toBe(6);
  expect(result.avgWaiting).toBeCloseTo(10 / 3, 5);
  expect(result.timeline).toHaveLength(9);
  expect(result.timeline.every((slice) => slice.pid !== null)).toBe(true);
});

it("rotates the queue under round robin and lets a short job finish first", () => {
  const result = simulateRoundRobin(defaultOsProcesses(), 2);
  expect(result.order[0]).toBe("p3");
  expect(result.timeline).toHaveLength(9);
  const quantumThree = simulateRoundRobin(defaultOsProcesses(), 3);
  expect(quantumThree.order[0]).toBe("p2");
  expect(quantumThree.timeline).not.toEqual(result.timeline);
});

it("keeps inputs immutable and handles idle time and empty input", () => {
  const processes = defaultOsProcesses();
  const before = JSON.parse(JSON.stringify(processes));
  simulate(processes, "rr", 2);
  expect(processes).toEqual(before);
  const idle = simulateFcfs([{ id: "p1", name: "Solo", arrival: 3, burst: 2 }]);
  expect(idle.timeline.slice(0, 3)).toEqual([
    { t: 0, pid: null },
    { t: 1, pid: null },
    { t: 2, pid: null },
  ]);
  expect(simulate([], "fcfs").timeline).toEqual([]);
});

it("treats a quantum below one as one time unit", () => {
  const result = simulate(defaultOsProcesses(), "rr", 0);
  expect(result.timeline.length).toBe(9);
  expect(result.order).toHaveLength(3);
});
