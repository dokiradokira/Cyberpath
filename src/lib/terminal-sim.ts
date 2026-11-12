export type FsFile = { type: "file"; content: string; mode: string };
export type FsDir = {
  type: "dir";
  mode: string;
  children: Record<string, FsNode>;
};
export type FsNode = FsFile | FsDir;

export type TerminalState = {
  /** Absolute working directory, for example /home/student. */
  cwd: string;
  root: FsDir;
  output: string[];
  history: string[];
  exit: number;
};

const HOME = "/home/student";

const dir = (children: Record<string, FsNode> = {}, mode = "755"): FsDir => ({
  type: "dir",
  mode,
  children,
});

const file = (content: string, mode = "644"): FsFile => ({
  type: "file",
  content,
  mode,
});

export function createTerminal(): TerminalState {
  const root = dir({
    home: dir({
      student: dir({
        "readme.txt": file(
          "Welcome to the CyberPath practice shell.\nType help to list the supported commands.\nNothing here touches your real computer.\n",
        ),
        projects: dir(),
      }),
    }),
    var: dir({
      log: dir({
        "app.log": file(
          "2026-11-01T09:00:00 INFO  service started\n2026-11-01T09:04:12 WARN  disk usage 91%\n2026-11-01T09:05:40 ERROR upload failed: timeout\n",
        ),
      }),
    }),
    tmp: dir(),
  });
  return {
    cwd: HOME,
    root,
    output: [
      "CyberPath practice shell (simulated) — no real commands run.",
      "Try: pwd, ls, cd /var/log, cat app.log, help",
    ],
    history: [],
    exit: 0,
  };
}

const clone = (state: TerminalState): TerminalState => ({
  ...state,
  root: JSON.parse(JSON.stringify(state.root)) as FsDir,
  output: [...state.output],
  history: [...state.history],
});

export function displayPath(state: TerminalState, absolute = state.cwd) {
  if (absolute === HOME) return "~";
  if (absolute.startsWith(`${HOME}/`)) return `~${absolute.slice(HOME.length)}`;
  return absolute;
}

export function promptFor(state: TerminalState) {
  return `student@cyberpath:${displayPath(state)}$`;
}

function normalize(base: string, raw: string) {
  const target = raw.startsWith("/")
    ? raw
    : raw.startsWith("~")
      ? `${HOME}${raw.slice(1)}`
      : `${base}/${raw}`;
  const parts: string[] = [];
  for (const part of target.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") {
      parts.pop();
      continue;
    }
    parts.push(part);
  }
  return `/${parts.join("/")}`;
}

function getNode(root: FsDir, absolute: string): FsNode | undefined {
  if (absolute === "/") return root;
  let node: FsNode = root;
  for (const part of absolute.split("/").filter(Boolean)) {
    if (node.type !== "dir") return undefined;
    const next: FsNode | undefined = node.children[part];
    if (!next) return undefined;
    node = next;
  }
  return node;
}

function parentOf(root: FsDir, absolute: string) {
  const parts = absolute.split("/").filter(Boolean);
  const name = parts.pop() ?? "";
  const parentPath = `/${parts.join("/")}`;
  const parent = getNode(root, parentPath);
  return { parentPath, name, parent };
}

function permString(mode: string) {
  const digits = mode.padStart(3, "0").slice(-3);
  const bits = ["r", "w", "x"];
  return digits
    .split("")
    .map((d) =>
      bits
        .map((bit, i) => ((Number(d) >> (2 - i)) & 1 ? bit : "-"))
        .join(""),
    )
    .join("");
}

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  const pattern = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(input))) {
    tokens.push(match[1] ?? match[2] ?? match[3]);
  }
  return tokens;
}

function write(state: TerminalState, lines: string[]) {
  state.output.push(...lines);
}

function fail(state: TerminalState, message: string) {
  write(state, [message]);
  state.exit = 1;
}

export function runCommand(input: string): TerminalState;
export function runCommand(
  state: TerminalState,
  input: string,
): TerminalState;
export function runCommand(
  first: string | TerminalState,
  second?: string,
): TerminalState {
  const state = clone(
    typeof first === "string" ? createTerminal() : first,
  );
  const raw = (typeof first === "string" ? first : second ?? "").trim();
  if (!raw) return state;
  write(state, [`${promptFor(state)} ${raw}`]);
  state.history.push(raw);
  state.exit = 0;
  const tokens = tokenize(raw);
  const command = tokens[0];
  const args = tokens.slice(1);

  if (command === "pwd") {
    if (args.length) fail(state, "pwd: too many arguments");
    else write(state, [state.cwd]);
    return state;
  }

  if (command === "clear") {
    state.output = [];
    return state;
  }

  if (command === "help") {
    write(state, [
      "pwd              print the working directory",
      "ls [-l] [-a]     list a directory",
      "cd [path]        change directory (~ means home)",
      "mkdir [-p] path  create a directory",
      "touch path       create an empty file",
      "cat path         print a file",
      "echo text > path write text to a file (>> appends)",
      "chmod 600 path   change permissions",
      "rm [-r] path     remove a file or directory",
      "clear            clear the screen",
    ]);
    return state;
  }

  if (command === "ls") {
    const options = args.filter((a) => a.startsWith("-"));
    const target = args.find((a) => !a.startsWith("-"));
    const long = options.some((o) => o.includes("l"));
    const all = options.some((o) => o.includes("a"));
    const absolute = target ? normalize(state.cwd, target) : state.cwd;
    const node = getNode(state.root, absolute);
    if (!node) {
      fail(state, `ls: cannot access '${target ?? absolute}': No such file or directory`);
      return state;
    }
    if (node.type === "file") {
      write(state, [target ?? absolute]);
      return state;
    }
    const names = Object.keys(node.children).sort();
    if (all) names.unshift("..", ".");
    write(
      state,
      names.map((name) => {
        const child =
          name === "." || name === ".."
            ? undefined
            : node.children[name];
        if (!long) return name;
        const childMode =
          name === "."
            ? node.mode
            : name === ".."
              ? "755"
              : (child?.mode ?? "644");
        const suffix = child?.type === "dir" ? "/" : "";
        return `${child?.type === "dir" ? "d" : "-"}${permString(childMode)}  ${name}${suffix}`;
      }),
    );
    return state;
  }

  if (command === "cd") {
    const target = args[0] ?? "~";
    const absolute = normalize(state.cwd, target);
    const node = getNode(state.root, absolute);
    if (!node) {
      fail(state, `bash: cd: ${target}: No such file or directory`);
      return state;
    }
    if (node.type !== "dir") {
      fail(state, `bash: cd: ${target}: Not a directory`);
      return state;
    }
    state.cwd = absolute;
    return state;
  }

  if (command === "mkdir") {
    const recursive = args.includes("-p");
    const target = args.find((a) => !a.startsWith("-"));
    if (!target) {
      fail(state, "mkdir: missing operand");
      return state;
    }
    const absolute = normalize(state.cwd, target);
    if (absolute === "/") {
      fail(state, "mkdir: cannot create directory '/': File exists");
      return state;
    }
    const segments = absolute.split("/").filter(Boolean);
    let node: FsNode = state.root;
    for (let i = 0; i < segments.length; i += 1) {
      if (node.type !== "dir") {
        fail(state, `mkdir: cannot create directory '${target}': Not a directory`);
        return state;
      }
      const name = segments[i];
      const existing: FsNode | undefined = node.children[name];
      if (existing) {
        if (i === segments.length - 1 && !recursive) {
          fail(state, `mkdir: cannot create directory '${target}': File exists`);
          return state;
        }
        node = existing;
        continue;
      }
      if (i < segments.length - 1 && !recursive) {
        fail(
          state,
          `mkdir: cannot create directory '${target}': No such file or directory`,
        );
        return state;
      }
      const created = dir();
      node.children[name] = created;
      node = created;
    }
    return state;
  }

  if (command === "touch") {
    const target = args[0];
    if (!target) {
      fail(state, "touch: missing file operand");
      return state;
    }
    const absolute = normalize(state.cwd, target);
    const existing = getNode(state.root, absolute);
    if (existing) return state;
    const { parent, name } = parentOf(state.root, absolute);
    if (!parent || parent.type !== "dir") {
      fail(state, `touch: cannot touch '${target}': No such file or directory`);
      return state;
    }
    parent.children[name] = file("");
    return state;
  }

  if (command === "cat") {
    const target = args[0];
    if (!target) {
      fail(state, "cat: missing operand");
      return state;
    }
    const absolute = normalize(state.cwd, target);
    const node = getNode(state.root, absolute);
    if (!node) {
      fail(state, `cat: ${target}: No such file or directory`);
      return state;
    }
    if (node.type === "dir") {
      fail(state, `cat: ${target}: Is a directory`);
      return state;
    }
    write(state, node.content.replace(/\n$/, "").split("\n"));
    return state;
  }

  if (command === "echo") {
    const join = args.join(" ");
    const append = /\s>>\s?/.test(` ${join} `);
    const split = join.split(append ? ">>" : ">");
    if (split.length === 2 && split[1].trim()) {
      const target = split[1].trim().replace(/^["']|["']$/g, "");
      const text = split[0].trim();
      const absolute = normalize(state.cwd, target);
      const existing = getNode(state.root, absolute);
      if (existing?.type === "dir") {
        fail(state, `bash: ${target}: Is a directory`);
        return state;
      }
      if (existing) {
        existing.content = append ? `${existing.content}${text}\n` : `${text}\n`;
        return state;
      }
      const { parent, name } = parentOf(state.root, absolute);
      if (!parent || parent.type !== "dir") {
        fail(state, `bash: ${target}: No such file or directory`);
        return state;
      }
      parent.children[name] = file(`${text}\n`);
      return state;
    }
    write(state, [join]);
    return state;
  }

  if (command === "chmod") {
    const [mode, target] = args;
    if (!mode || !target) {
      fail(state, "chmod: missing operand");
      return state;
    }
    if (!/^[0-7]{3,4}$/.test(mode)) {
      fail(state, `chmod: invalid mode: '${mode}'`);
      return state;
    }
    const absolute = normalize(state.cwd, target);
    const node = getNode(state.root, absolute);
    if (!node) {
      fail(state, `chmod: cannot access '${target}': No such file or directory`);
      return state;
    }
    node.mode = mode.slice(-3);
    return state;
  }

  if (command === "rm") {
    const recursive = args.some((a) => a.startsWith("-") && a.includes("r"));
    const force = args.some((a) => a.startsWith("-") && a.includes("f"));
    const target = args.find((a) => !a.startsWith("-"));
    if (!target) {
      fail(state, "rm: missing operand");
      return state;
    }
    const absolute = normalize(state.cwd, target);
    if (absolute === "/" || absolute === HOME) {
      fail(state, `rm: refusing to remove '${target}': protected path`);
      return state;
    }
    const node = getNode(state.root, absolute);
    if (!node) {
      if (!force) fail(state, `rm: cannot remove '${target}': No such file or directory`);
      return state;
    }
    if (node.type === "dir" && !recursive) {
      fail(state, `rm: cannot remove '${target}': Is a directory`);
      return state;
    }
    const { parent, name } = parentOf(state.root, absolute);
    if (!parent || parent.type !== "dir") {
      fail(state, `rm: cannot remove '${target}': No such file or directory`);
      return state;
    }
    delete parent.children[name];
    return state;
  }

  fail(state, `bash: ${command}: command not found`);
  return state;
}

export type TerminalMission = {
  id: string;
  label: string;
  hint: string;
  done: boolean;
};

export function terminalMissions(state: TerminalState): TerminalMission[] {
  const notes = getNode(state.root, `${HOME}/notes`);
  const today = getNode(state.root, `${HOME}/notes/today.txt`);
  const readBack = state.history.some(
    (line) => /^cat\b/.test(line) && /today\.txt/.test(line),
  );
  return [
    {
      id: "mkdir",
      label: "Create the directory ~/notes",
      hint: "mkdir -p ~/notes",
      done: notes?.type === "dir",
    },
    {
      id: "write",
      label: "Write hello into ~/notes/today.txt",
      hint: "echo hello > ~/notes/today.txt",
      done:
        today?.type === "file" && today.content.toLowerCase().includes("hello"),
    },
    {
      id: "read",
      label: "Read the file back with cat",
      hint: "cat ~/notes/today.txt",
      done: readBack,
    },
    {
      id: "chmod",
      label: "Restrict permissions to 600",
      hint: "chmod 600 ~/notes/today.txt",
      done: today?.type === "file" && today.mode === "600",
    },
  ];
}
