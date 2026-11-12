import { expect, it } from "vitest";
import {
  createTerminal,
  displayPath,
  runCommand,
  terminalMissions,
} from "../src/lib/terminal-sim";

const run = (state: ReturnType<typeof createTerminal>, line: string) =>
  runCommand(state, line);

function last(state: ReturnType<typeof createTerminal>) {
  return state.output.slice(-1)[0] ?? "";
}

it("starts in the home directory and prints paths without touching a real shell", () => {
  const state = createTerminal();
  expect(state.cwd).toBe("/home/student");
  expect(displayPath(state)).toBe("~");
  const after = run(state, "pwd");
  expect(last(after)).toBe("/home/student");
  expect(state.output.length).toBe(2);
  expect(after.output.length).toBeGreaterThan(state.output.length);
});

it("resolves absolute, relative and parent paths", () => {
  const state = run(createTerminal(), "cd /var/log");
  expect(state.cwd).toBe("/var/log");
  const read = run(state, "cat app.log");
  expect(read.output.join("\n")).toContain("ERROR upload failed");
  const back = run(run(read, "cd .."), "pwd");
  expect(last(back)).toBe("/var");
  const root = run(run(back, "cd ../.."), "pwd");
  expect(last(root)).toBe("/");
});

it("completes the four missions with mkdir, echo, cat and chmod", () => {
  let state = createTerminal();
  expect(terminalMissions(state).filter((m) => m.done)).toHaveLength(0);
  state = run(state, "mkdir -p ~/notes");
  state = run(state, "echo hello > ~/notes/today.txt");
  state = run(state, "cat ~/notes/today.txt");
  expect(state.output.at(-1)).toBe("hello");
  state = run(state, "chmod 600 ~/notes/today.txt");
  expect(terminalMissions(state).every((m) => m.done)).toBe(true);
  const listed = run(state, "ls -l ~/notes");
  expect(listed.output.join("\n")).toContain("-rw-------");
});

it("explains missing paths, directories and invalid modes", () => {
  let state = run(createTerminal(), "cd /nope");
  expect(last(state)).toContain("No such file or directory");
  expect(state.exit).toBe(1);
  state = run(createTerminal(), "cat /home");
  expect(last(state)).toContain("Is a directory");
  state = run(createTerminal(), "chmod 999 ~/readme.txt");
  expect(last(state)).toContain("invalid mode");
  state = run(createTerminal(), "frobnicate");
  expect(last(state)).toContain("command not found");
  expect(state.exit).toBe(1);
});

it("refuses to delete protected paths and requires -r for directories", () => {
  let state = run(createTerminal(), "rm -rf /");
  expect(last(state)).toContain("protected path");
  state = run(createTerminal(), "rm -rf ~");
  expect(last(state)).toContain("protected path");
  state = run(createTerminal(), "rm /home/student/projects");
  expect(last(state)).toContain("Is a directory");
  state = run(createTerminal(), "mkdir -p ~/notes");
  state = run(state, "rm -r ~/notes");
  expect(terminalMissions(state).find((m) => m.id === "mkdir")!.done).toBe(
    false,
  );
});

it("quotes arguments and appends instead of truncating", () => {
  let state = run(createTerminal(), 'echo "first line" > ~/notes.txt');
  state = run(state, "echo second >> ~/notes.txt");
  state = run(state, "cat ~/notes.txt");
  const lines = state.output.slice(-3);
  expect(lines).toContain("first line");
  expect(lines).toContain("second");
});
