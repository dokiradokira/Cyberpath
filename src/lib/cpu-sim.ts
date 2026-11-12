export type CpuPhase = "fetch" | "decode" | "execute" | "halted";

export type CpuState = {
  pc: number;
  acc: number;
  memory: number[];
  phase: CpuPhase;
  steps: number;
  /** Human-readable trace of the last phases, oldest first. */
  trace: string[];
};

export type CpuInstruction = {
  op: "LOAD" | "ADD" | "STORE" | "HALT";
  addr: number;
  text: string;
};

/**
 * A four-instruction program: result = memory[10] + memory[11].
 * Instructions occupy addresses 0-3 and data lives at 10-12.
 */
export const CPU_PROGRAM: CpuInstruction[] = [
  { op: "LOAD", addr: 10, text: "LOAD  [10]" },
  { op: "ADD", addr: 11, text: "ADD   [11]" },
  { op: "STORE", addr: 12, text: "STORE [12]" },
  { op: "HALT", addr: 0, text: "HALT" },
];

export const CPU_DATA_CELLS = [10, 11] as const;
export const CPU_RESULT_CELL = 12;

export function initialCpu(a = 7, b = 5): CpuState {
  const memory = new Array<number>(13).fill(0);
  memory[10] = a;
  memory[11] = b;
  return { pc: 0, acc: 0, memory, phase: "fetch", steps: 0, trace: [] };
}

function append(state: CpuState, line: string, next: Partial<CpuState>): CpuState {
  return {
    ...state,
    ...next,
    trace: [...state.trace, line].slice(-40),
  };
}

/** Advance exactly one phase: fetch, then decode, then execute. */
export function stepCpu(state: CpuState): CpuState {
  if (state.phase === "halted") return state;
  const instruction = CPU_PROGRAM[state.pc];
  if (!instruction) {
    return append(state, "halt  pc outside program", { phase: "halted" });
  }
  if (state.phase === "fetch") {
    return append(
      state,
      `fetch   pc=${state.pc}  ${instruction.text}`,
      { phase: "decode" },
    );
  }
  if (state.phase === "decode") {
    const operand =
      instruction.op === "HALT" ? "-" : String(instruction.addr);
    return append(
      state,
      `decode  op=${instruction.op}  operand=${operand}`,
      { phase: "execute" },
    );
  }
  // execute
  const memory = [...state.memory];
  let acc = state.acc;
  let pc = state.pc + 1;
  let phase: CpuPhase = "fetch";
  switch (instruction.op) {
    case "LOAD":
      acc = memory[instruction.addr];
      break;
    case "ADD":
      acc = acc + memory[instruction.addr];
      break;
    case "STORE":
      memory[instruction.addr] = acc;
      break;
    case "HALT":
      phase = "halted";
      pc = state.pc;
      break;
  }
  return append(
    state,
    `execute acc=${acc}` +
      (instruction.op === "HALT" ? "  halted" : `  pc=${pc}`),
    { memory, acc, pc, phase, steps: state.steps + 1 },
  );
}

export function runCpu(state: CpuState, maxSteps = 24): CpuState {
  let next = state;
  for (let i = 0; i < maxSteps && next.phase !== "halted"; i += 1) {
    next = stepCpu(next);
  }
  return next;
}

export function cpuFinished(state: CpuState) {
  return state.phase === "halted";
}
