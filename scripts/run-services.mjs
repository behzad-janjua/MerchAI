import { spawn } from "node:child_process";

const scripts = process.argv.slice(2);

if (scripts.length === 0) {
  console.error("Usage: node scripts/run-services.mjs <script> [script...]");
  process.exit(1);
}

const packageManager = process.env.npm_config_user_agent?.includes("yarn") ? "yarn" : "npm";
const children = scripts.map((script) => {
  const args = packageManager === "yarn" ? ["run", script] : ["run", script];
  const child = spawn(packageManager, args, {
    env: process.env,
    shell: true,
    stdio: "inherit"
  });

  child.on("exit", (code, signal) => {
    if (code && code !== 0) {
      shutdown(code);
    }

    if (signal) {
      shutdown(0);
    }
  });

  return child;
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => shutdown(0, signal));
}

function shutdown(code, signal = "SIGTERM") {
  for (const child of children) {
    if (!child.killed) {
      child.kill(signal);
    }
  }

  process.exit(code);
}
