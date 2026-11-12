"use client";
import { useMemo, useState } from "react";
import {
  CPU_DATA_CELLS,
  CPU_PROGRAM,
  CPU_RESULT_CELL,
  cpuFinished,
  initialCpu,
  runCpu,
  stepCpu,
} from "../../lib/cpu-sim";

const mono = {
  fontFamily:
    "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
} as const;

export function CpuLab({ id = "cpu-sim" }: { id?: string }) {
  const [a, setA] = useState(7);
  const [b, setB] = useState(5);
  const [cpu, setCpu] = useState(() => initialCpu(7, 5));
  const [prediction, setPrediction] = useState("");
  const [checked, setChecked] = useState(false);

  const finished = cpuFinished(cpu);
  const result = cpu.memory[CPU_RESULT_CELL];
  const memoryRows = useMemo(
    () =>
      CPU_DATA_CELLS.map((cell) => ({
        cell,
        value: cpu.memory[cell],
      })),
    [cpu.memory],
  );

  function reset(nextA = a, nextB = b) {
    setCpu(initialCpu(nextA, nextB));
    setChecked(false);
  }

  function applyInputs(nextA: number, nextB: number) {
    setA(nextA);
    setB(nextB);
    reset(nextA, nextB);
  }

  const predictionMatches =
    checked && prediction !== "" && Number(prediction) === result;

  return (
    <div role="group" id={id} aria-label="CPU instruction lab">

      <h3 lang="en">CPU and memory: run one program</h3>
      <p lang="en">
        The program is fixed: LOAD the value at address 10, ADD the value at
        address 11, STORE the sum at address 12, then HALT. Change the inputs,
        predict the result, and step through fetch, decode and execute.
      </p>

      <div className="device-buttons">
        <label>
          Memory[10]
          <input
            aria-label="Memory cell 10 value"
            type="number"
            min={0}
            max={99}
            value={a}
            onChange={(e) => applyInputs(Number(e.target.value) || 0, b)}
          />
        </label>
        <label>
          Memory[11]
          <input
            aria-label="Memory cell 11 value"
            type="number"
            min={0}
            max={99}
            value={b}
            onChange={(e) => applyInputs(a, Number(e.target.value) || 0)}
          />
        </label>
        <label>
          Predict memory[12]
          <input
            aria-label="Predict the stored result"
            type="number"
            value={prediction}
            onChange={(e) => setPrediction(e.target.value)}
          />
        </label>
      </div>

      <div
        style={{
          ...mono,
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          margin: "14px 0",
        }}
      >
        <div
          style={{
            border: "1px solid var(--line)",
            borderRadius: 8,
            padding: 12,
            background: "var(--raised)",
          }}
        >
          <strong lang="en">Program</strong>
          <ol style={{ margin: "8px 0 0", paddingLeft: 22 }}>
            {CPU_PROGRAM.map((instruction, index) => (
              <li
                key={instruction.text}
                aria-current={cpu.pc === index ? "step" : undefined}
                style={{
                  color:
                    cpu.pc === index && !finished
                      ? "var(--primary)"
                      : undefined,
                  fontWeight: cpu.pc === index ? 700 : 400,
                }}
              >
                {instruction.text}
              </li>
            ))}
          </ol>
        </div>
        <div
          style={{
            border: "1px solid var(--line)",
            borderRadius: 8,
            padding: 12,
            background: "var(--raised)",
          }}
        >
          <strong lang="en">Registers</strong>
          <dl className="result-grid" style={{ margin: "8px 0 0" }}>
            <div>
              <dt>PC</dt>
              <dd>{cpu.pc}</dd>
            </div>
            <div>
              <dt>ACC</dt>
              <dd>{cpu.acc}</dd>
            </div>
            <div>
              <dt>phase</dt>
              <dd>{cpu.phase}</dd>
            </div>
            <div>
              <dt>instructions</dt>
              <dd>{cpu.steps}</dd>
            </div>
          </dl>
        </div>
        <div
          style={{
            border: "1px solid var(--line)",
            borderRadius: 8,
            padding: 12,
            background: "var(--raised)",
          }}
        >
          <strong lang="en">Memory</strong>
          <ul style={{ listStyle: "none", margin: "8px 0 0", padding: 0 }}>
            {memoryRows.map((row) => (
              <li key={row.cell}>
                [{row.cell}] = {row.value}
              </li>
            ))}
            <li>
              [{CPU_RESULT_CELL}] = {result}
            </li>
          </ul>
        </div>
      </div>

      <div className="device-buttons">
        <button
          onClick={() => setCpu((s) => stepCpu(s))}
          disabled={finished}
        >
          单步执行
        </button>
        <button
          className="primary"
          onClick={() => {
            setCpu((s) => runCpu(s));
            setChecked(true);
          }}
          disabled={finished}
        >
          运行到结束
        </button>
        <button onClick={() => reset()}>重置模拟</button>
      </div>

      <p className="lab-observation" aria-live="polite">
        状态：PC={cpu.pc} · ACC={cpu.acc} · phase={cpu.phase} · memory[12]=
        {result}
      </p>
      {checked && (
        <p role="status" lang="en">
          {prediction === ""
            ? `No prediction recorded. The program stored ${result}.`
            : predictionMatches
              ? `Prediction correct: ${result}.`
              : `Prediction ${prediction} does not match the stored result ${result}.`}
        </p>
      )}
      {cpu.trace.length > 0 && (
        <pre
          aria-label="Execution trace"
          style={{
            ...mono,
            margin: "12px 0",
            padding: 12,
            borderRadius: 8,
            border: "1px solid var(--line)",
            background: "var(--bg)",
            maxHeight: 180,
            overflow: "auto",
            fontSize: 12.5,
          }}
        >
          {cpu.trace.slice(-12).join("\n")}
        </pre>
      )}
      <p className="caption">
        简化模型：单核、顺序执行、无流水线与缓存。真实 CPU 会重叠执行多条指令，并有多级缓存。修改输入会重置模拟，便于对比结果。
      </p>
    </div>
  );
}
