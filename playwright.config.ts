import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  timeout: 30000,
  expect: { timeout: 10000 },
  reporter: "list",
  use: {
    baseURL: "https://jurnalisme-damai.vercel.app",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
});
