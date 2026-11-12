export type OsProcess = {
  id: string;
  name: string;
  arrival: number;
  burst: number;
};

export type OsAlgorithm = "fcfs" | "rr";

export type Slice = { t: number; pid: string | null };

export type OsResult = {
  timeline: Slice[];
  completion: Record<string, number>;
  waiting: Record<string, number>;
  turnaround: Record<string, number>;
  avgWaiting: number;
  order: string[];
};

export const defaultOsProcesses = (): OsProcess[] => [
  { id: "p1", name: "Build", arrival: 0, burst: 5 },
  { id: "p2", name: "Video call", arrival: 1, burst: 3 },
  { id: "p3", name: "Indexer", arrival: 2, burst: 1 },
];

function emptyResult(procs: OsProcess[]): OsResult {
  return {
    timeline: [],
    completion: Object.fromEntries(procs.map((p) => [p.id, 0])),
    waiting: Object.fromEntries(procs.map((p) => [p.id, 0])),
    turnaround: Object.fromEntries(procs.map((p) => [p.id, 0])),
    avgWaiting: 0,
    order: [],
  };
}

function finish(
  procs: OsProcess[],
  timeline: Slice[],
): OsResult {
  const completion: Record<string, number> = {};
  const waiting: Record<string, number> = {};
  const turnaround: Record<string, number> = {};
  const order: string[] = [];
  for (const p of procs) {
    let last = 0;
    for (const slice of timeline) if (slice.pid === p.id) last = slice.t + 1;
    completion[p.id] = last;
    turnaround[p.id] = last - p.arrival;
    waiting[p.id] = turnaround[p.id] - p.burst;
    if (last > 0) order.push(p.id);
  }
  order.sort((a, b) => completion[a] - completion[b]);
  const total = procs.length ? procs.reduce((s, p) => s + waiting[p.id], 0) : 0;
  return {
    timeline,
    completion,
    waiting,
    turnaround,
    avgWaiting: procs.length ? total / procs.length : 0,
    order,
  };
}

/** First come, first served: each process runs to completion in arrival order. */
export function simulateFcfs(procs: OsProcess[]): OsResult {
  if (!procs.length) return emptyResult(procs);
  const queue = [...procs].sort(
    (a, b) => a.arrival - b.arrival || a.id.localeCompare(b.id),
  );
  const timeline: Slice[] = [];
  let t = 0;
  for (const p of queue) {
    while (t < p.arrival) {
      timeline.push({ t, pid: null });
      t += 1;
    }
    for (let i = 0; i < p.burst; i += 1) {
      timeline.push({ t, pid: p.id });
      t += 1;
    }
  }
  return finish(procs, timeline);
}

/**
 * Round robin with a fixed quantum. Arrivals are admitted before the next
 * process is chosen, which is the usual textbook assumption.
 */
export function simulateRoundRobin(
  procs: OsProcess[],
  quantum = 2,
): OsResult {
  if (!procs.length) return emptyResult(procs);
  const q = Math.max(1, Math.floor(quantum));
  const remaining = new Map(procs.map((p) => [p.id, p.burst]));
  const order = [...procs].sort(
    (a, b) => a.arrival - b.arrival || a.id.localeCompare(b.id),
  );
  const queue: string[] = [];
  const timeline: Slice[] = [];
  let t = 0;
  let admitted = 0;
  const admit = () => {
    while (admitted < order.length && order[admitted].arrival <= t) {
      queue.push(order[admitted].id);
      admitted += 1;
    }
  };
  admit();
  if (!queue.length && admitted < order.length) {
    t = order[0].arrival;
    admit();
  }
  while (queue.length || admitted < order.length) {
    if (!queue.length) {
      timeline.push({ t, pid: null });
      t += 1;
      admit();
      continue;
    }
    const id = queue.shift()!;
    const left = remaining.get(id) ?? 0;
    const slice = Math.min(q, left);
    for (let i = 0; i < slice; i += 1) {
      timeline.push({ t, pid: id });
      t += 1;
      admit();
    }
    remaining.set(id, left - slice);
    if ((remaining.get(id) ?? 0) > 0) queue.push(id);
  }
  return finish(procs, timeline);
}

export function simulate(
  procs: OsProcess[],
  algorithm: OsAlgorithm,
  quantum = 2,
): OsResult {
  return algorithm === "fcfs"
    ? simulateFcfs(procs)
    : simulateRoundRobin(procs, quantum);
}
