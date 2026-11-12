"use client";
import { useRef, useState } from "react";
import {
  createTerminal,
  promptFor,
  runCommand,
  terminalMissions,
  type TerminalState,
} from "../../lib/terminal-sim";

export function TerminalLab({ id = "terminal-sim" }: { id?: string }) {
  const [term, setTerm] = useState<TerminalState>(createTerminal);
  const [input, setInput] = useState("");
  const [predicted, setPredicted] = useState("");
  const [pwdRan, setPwdRan] = useState(false);
  const output = useRef<HTMLPreElement>(null);
  const missions = terminalMissions(term);

  function submit() {
    const line = input;
    setInput("");
    setTerm((current) => runCommand(current, line));
    if (line.trim() === "pwd") setPwdRan(true);
    requestAnimationFrame(() => {
      if (output.current) output.current.scrollTop = output.current.scrollHeight;
    });
  }

  return (
    <div role="group" id={id} aria-label="Linux terminal lab">

      <h3 lang="en">A safe Linux shell in your browser</h3>
      <p lang="en">
        This shell reads commands against a simulated file system. It never
        starts a real process or touches your computer. Complete the four
        missions with pwd, ls, mkdir, echo, cat and chmod.
      </p>

      <div className="device-buttons" role="group" aria-label="预测主目录">
        <span>先预测：在这个 shell 里，~ 指向哪个绝对路径？</span>
        {["/", "/home/student", "/var/log"].map((option) => (
          <button
            key={option}
            aria-pressed={predicted === option}
            className={predicted === option ? "selected" : ""}
            onClick={() => setPredicted(option)}
          >
            {option}
          </button>
        ))}
      </div>
      {predicted !== "" && (
        <p role="status" lang="en">
          {pwdRan
            ? predicted === "/home/student"
              ? "Correct: ~ expands to the home directory /home/student, which is why pwd prints that path."
              : `Not quite: pwd printed /home/student, so ~ expands to /home/student rather than ${predicted}.`
            : "Now run pwd to check your prediction."}
        </p>
      )}

      <pre
        ref={output}
        role="log"
        aria-label="Terminal output"
        aria-live="polite"
        style={{
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
          fontSize: 13,
          lineHeight: 1.55,
          margin: "12px 0",
          padding: 12,
          borderRadius: 8,
          border: "1px solid var(--line)",
          background: "var(--bg)",
          color: "var(--text)",
          height: 260,
          overflow: "auto",
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
        }}
      >
        {term.output.slice(-200).join("\n")}
      </pre>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        style={{ display: "grid", gap: 8 }}
      >
        <label htmlFor="terminal-command">
          <code>{promptFor(term)}</code>
        </label>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            id="terminal-command"
            aria-label="输入命令"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            style={{
              flex: 1,
              minWidth: 0,
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
              fontSize: 16,
            }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="pwd"
          />
          <button type="submit" className="primary">
            执行
          </button>
        </div>
      </form>

      <div className="device-buttons" style={{ marginTop: 10 }}>
        <button
          onClick={() => {
            setTerm(createTerminal());
            setInput("");
            setPredicted("");
            setPwdRan(false);
          }}
        >
          重置实验
        </button>
        <button onClick={() => setInput("help")}>help</button>
        <button onClick={() => setInput("ls -la")}>ls -la</button>
        <button onClick={() => setInput("cd /var/log")}>cd /var/log</button>
      </div>

      <h3 lang="en" style={{ marginTop: 18 }}>
        Missions
      </h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {missions.map((mission) => (
          <li
            key={mission.id}
            data-done={mission.done}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              padding: "6px 0",
              color: mission.done ? "var(--primary)" : undefined,
            }}
          >
            <span aria-hidden="true">{mission.done ? "✔" : "○"}</span>
            <span style={{ flex: 1 }}>
              {mission.label}
              {!mission.done && (
                <code
                  style={{
                    display: "block",
                    fontSize: 12.5,
                    color: "var(--muted)",
                  }}
                >
                  {mission.hint}
                </code>
              )}
            </span>
            {!mission.done && (
              <button
                type="button"
                onClick={() => setInput(mission.hint)}
                aria-label={`使用提示 ${mission.hint}`}
              >
                使用提示
              </button>
            )}
          </li>
        ))}
      </ul>
      <p className="lab-observation" aria-live="polite">
        进度：{missions.filter((m) => m.done).length} / {missions.length}{" "}
        个任务完成 · 目录 {term.cwd} · 上一条命令退出码 {term.exit}
      </p>

      <p className="caption">
        模拟范围：pwd、ls、cd、mkdir、touch、cat、echo、chmod、rm、clear、help。
        rm 只删除模拟文件系统中的节点，并拒绝对 / 与主目录执行删除。
      </p>
    </div>
  );
}
