import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const workflow = readFileSync(
  new URL("../.github/workflows/ci.yml", import.meta.url),
  "utf8",
);
it("CI verifies the locked application before browser tests with read-only credentials", () => {
  expect(workflow).toContain("contents: read");
  expect(workflow).toContain("persist-credentials: false");
  expect(workflow).toMatch(/node-version: ["']24["']/);
  const commands = [
    "npm ci",
    "npm run typecheck",
    "npm run lint",
    "npm test",
    "npm run build",
    "npx playwright install --with-deps chromium webkit",
    "npm run test:e2e",
  ];
  let previous = -1;
  for (const command of commands) {
    const position = workflow.indexOf(`run: ${command}`);
    expect(position, command).toBeGreaterThan(previous);
    previous = position;
  }
  expect(workflow).toContain("if: failure()");
  expect(workflow).toContain("test-results/");
  expect(workflow).toContain("shell: bash");
  expect(workflow).toContain("reports/build.log");
  expect(workflow).not.toMatch(
    /pull_request_target|secrets\.|contents: write|id-token: write|npm publish|run:.*deploy/,
  );
});
