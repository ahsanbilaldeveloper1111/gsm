import fs from "fs";
import path from "path";

export function initLogsDir(): void {
  fs.mkdirSync(path.join(process.cwd(), "logs"), { recursive: true });
}
