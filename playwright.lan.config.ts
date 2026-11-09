import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "tests/lan",
  outputDir: "test-results-lan",
  workers: 1,
  retries: 0,
  use: { trace: "retain-on-failure" },
  projects: [
    { name: "chromium-lan", use: { ...devices["Desktop Chrome"] } },
    {
      name: "webkit-lan",
      use: { ...devices["iPhone 13"], defaultBrowserType: "webkit" },
    },
  ],
  webServer: {
    command: "npm run start -- --port 3102",
    url: "http://127.0.0.1:3102",
    reuseExistingServer: false,
    timeout: 120000,
  },
});
