import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  project: "proj_gist_agent_v1",
  runtime: "node",
  logLevel: "log",
  maxDuration: 600,
  dirs: ["src/trigger"],
});
