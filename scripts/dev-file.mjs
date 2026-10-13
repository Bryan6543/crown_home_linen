// Runs the dev server against the local file store (data/store.json) instead
// of Supabase, on port 3000 unless another is given: npm run dev:file -- -p 3200
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const next = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
const args = process.argv.slice(2);
const child = spawn(process.execPath, [next, "dev", ...(args.some((arg) => arg === "-p" || arg === "--port") ? [] : ["-p", "3000"]), ...args], {
  stdio: "inherit",
  env: { ...process.env, CROWN_STORAGE: "file" },
});
child.on("exit", (code) => process.exit(code ?? 0));
