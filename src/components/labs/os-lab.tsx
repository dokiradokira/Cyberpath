"use client";
import { useMemo, useState } from "react";
import {
  defaultOsProcesses,
  simulate,
  type OsAlgorithm,
  type OsProcess,
} from "../../lib/os-sim";
import { useLabReady } from "./use-lab-ready";

const COLORS: Record<string, string> = {
  p1: "var(--primary)",
  p2: "#60a5fa",
  p3: "#f59e0b",
};

export function OsLab({ id = "os-sim" }: { id?: string }) {
  const [processes, setProcesses] = useState<OsProcess[]>(
    defaultOsProcesses,
  );
  const [algorithm, setAlgorithm] = useState<OsAlgorithm>("fcfs");
  const [quantum, setQuantum] = useState(2);
  const [visible, setVisible] = useState(0);
  const [prediction, setPrediction] = useState("");
  const ready = useLabReady();

  const result = useMemo(
    () => simulate(processes, algorithm, quantum),
    [processes, algorithm, quantum],
  );
  const total = result.timeline.length;
  const done = visible >= total && total > 0;
  const shown = result.timeline.slice(0, visible);
  const executed = new Map<string, number>();
  for (const slice of shown) {
    if (slice.pid) executed.set(slice.pid, (executed.get(slice.pid) ?? 0) + 1);
  }

  function updateBurst(index: number, value: number) {
    setProcesses((current) =>
      current.map((p, i) =>
        i === index
          ? { ...p, burst: Math.min(8, Math.max(1, Math.floor(value) || 1)) }
          : p,
      ),
    );
    setVisible(0);
  }

  function changeAlgorithm(next: OsAlgorithm) {
    setAlgorithm(next);
    setVisible(0);
  }

  return (
    <div role="group" id={id} aria-label="OS scheduler lab">

      <h3 lang="en">Scheduler: share one CPU</h3>
      <p lang="en">
        Three processes arrive at times 0, 1 and 2. Edit how much CPU time each
        one needs, choose a policy, predict which finishes first, then advance
        the clock one unit at a time.
      </p>

      <div className="device-buttons">
        <button
          aria-pressed={algorithm === "fcfs"}
          className={algorithm === "fcfs" ? "selected" : ""}
          disabled={!ready}
          onClick={() => changeAlgorithm("fcfs")}
        >
          FCFS 先到先服务
        </button>
        <button
          aria-pressed={algorithm === "rr"}
          className={algorithm === "rr" ? "selected" : ""}
          disabled={!ready}
          onClick={() => changeAlgorithm("rr")}
        >
          Round Robin 时间片
        </button>
        <label>
          时间片
          <select
            aria-label="时间片长度"
            value={quantum}
            disabled={!ready || algorithm !== "rr"}
            onChange={(e) => {
              setQuantum(Number(e.target.value));
              setVisible(0);
            }}
          >
            {[1, 2, 3, 4].map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="device-buttons">
        {processes.map((p, index) => (
          <label key={p.id}>
            {p.name} 需要
            <input
              aria-label={`${p.name} burst time`}
              disabled={!ready}
              type="number"
              min={1}
              max={8}
              value={p.burst}
              onChange={(e) => updateBurst(index, Number(e.target.value))}
            />
            个时间片
          </label>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          overflowX: "auto",
          padding: "12px 2px",
          borderBottom: "1px solid var(--line)",
        }}
        aria-label="CPU timeline"
      >
        {result.timeline.map((slice, index) => {
          const active = index < visible;
          return (
            <div
              key={`${slice.t}-${slice.pid ?? "idle"}`}
              style={{
                minWidth: 38,
                textAlign: "center",
                fontFamily: "ui-monospace, Menlo, Consolas, monospace",
                fontSize: 12,
                opacity: active ? 1 : 0.28,
              }}
            >
              <div
                style={{
                  height: 34,
                  borderRadius: 6,
                  border: "1px solid var(--line)",
                  background: slice.pid
                    ? COLORS[slice.pid]
                    : "var(--raised)",
                  color: slice.pid ? "#04120f" : "var(--muted)",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 700,
                }}
              >
                {slice.pid ? slice.pid.toUpperCase() : "idle"}
              </div>
              <span>t={slice.t}</span>
            </div>
          );
        })}
      </div>

      <div className="device-buttons" style={{ marginTop: 12 }}>
        <button
          onClick={() => setVisible((v) => Math.min(total, v + 1))}
          disabled={!ready || done}
        >
          下一步
        </button>
        <button
          className="primary"
          onClick={() => setVisible(total)}
          disabled={!ready || done}
        >
          运行到结束
        </button>
        <button
          onClick={() => {
            setProcesses(defaultOsProcesses());
            setAlgorithm("fcfs");
            setQuantum(2);
            setVisible(0);
            setPrediction("");
          }}
          disabled={!ready}
        >
          重置实验
        </button>
      </div>

      <p className="lab-observation" aria-live="polite">
        状态：t={Math.min(visible, total)} / {total} · 策略=
        {algorithm === "fcfs" ? "FCFS" : `RR(q=${quantum})`} · 已执行{" "}
        {processes
          .map((p) => `${p.id}:${executed.get(p.id) ?? 0}/${p.burst}`)
          .join(" ")}
      </p>

      <label>
        预测：谁先完成？
        <select
          aria-label="预测先完成的进程"
          disabled={!ready}
          value={prediction}
          onChange={(e) => setPrediction(e.target.value)}
        >
          <option value="">先作预测</option>
          {processes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      {done && (
        <div role="status" lang="en">
          <p>
            First to finish:{" "}
            {processes.find((p) => p.id === result.order[0])?.name ??
              "none"}
            {prediction === ""
              ? " (no prediction recorded)"
              : prediction === result.order[0]
                ? " — prediction correct."
                : " — prediction did not match."}
          </p>
          <p>
            Average waiting time: {result.avgWaiting.toFixed(2)} time units.
            Per process:{" "}
            {processes
              .map((p) => `${p.id} waited ${result.waiting[p.id]}`)
              .join(", ")}
            .
          </p>
          {algorithm === "rr" && (
            <p>
              Round robin rotates the queue, so short jobs finish earlier but
              every switch costs overhead that this model does not count.
            </p>
          )}
        </div>
      )}

      <p className="caption">
        简化模型：单核、无 I/O、无上下文切换开销、到达时间固定为 0/1/2。真实调度器还会考虑优先级、I/O 等待与多核负载均衡。
      </p>
    </div>
  );
}
