import pc from "picocolors";

export const logger = {
  info(message: string): void {
    console.log(pc.cyan("info"), message);
  },
  success(message: string): void {
    console.log(pc.green("done"), message);
  },
  warn(message: string): void {
    console.warn(pc.yellow("warn"), message);
  },
  error(message: string): void {
    console.error(pc.red("error"), message);
  },
  plain(message: string): void {
    console.log(message);
  },
};
