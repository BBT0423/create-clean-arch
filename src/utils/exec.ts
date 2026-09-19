import { spawn } from "node:child_process";

/** Quotes an argument for cmd.exe only if it needs it — avoids Node's DEP0190 warning
 * (args array + shell:true) by folding command+args into a single pre-escaped string. */
function quoteForWindowsShell(arg: string): string {
  return /[\s"^&|<>]/.test(arg) ? `"${arg.replace(/"/g, '\\"')}"` : arg;
}

function spawnAsync(command: string, args: string[], cwd?: string, env?: NodeJS.ProcessEnv): Promise<void> {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === "win32";
    const spawnEnv = env ? { ...process.env, ...env } : undefined;
    const child = isWindows
      ? spawn([command, ...args].map(quoteForWindowsShell).join(" "), { cwd, stdio: "inherit", shell: true, env: spawnEnv })
      : spawn(command, args, { cwd, stdio: "inherit", env: spawnEnv });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
  });
}

/** Returns true if the given command exists on PATH (cross-platform). */
export function commandExists(command: string): Promise<boolean> {
  return new Promise((resolve) => {
    const isWindows = process.platform === "win32";
    const checker = isWindows ? "where" : "which";
    const child = isWindows
      ? spawn([checker, quoteForWindowsShell(command)].join(" "), { stdio: "ignore", shell: true })
      : spawn(checker, [command], { stdio: "ignore" });
    child.on("error", () => resolve(false));
    child.on("exit", (code) => resolve(code === 0));
  });
}

export function run(command: string, args: string[], cwd: string, env?: NodeJS.ProcessEnv): Promise<void> {
  return spawnAsync(command, args, cwd, env);
}
