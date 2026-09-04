import { resolve } from "node:path";

export interface AppConfig {
  port: number;
  dataFilename: string;
  seedFilename: string;
  publicDirectory: string;
}

export function readConfig(
  environment: NodeJS.ProcessEnv = process.env,
  workingDirectory = process.cwd(),
): AppConfig {
  return {
    port: parsePort(environment.PORT),
    dataFilename: environment.STUDYBRIDGE_DATA_FILE ??
      resolve(workingDirectory, "var/studybridge.json"),
    seedFilename: resolve(workingDirectory, "data/seed.json"),
    publicDirectory: resolve(workingDirectory, "public"),
  };
}

function parsePort(value: string | undefined): number {
  if (value === undefined) {
    return 3000;
  }
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`PORT must be an integer from 1 to 65535; received '${value}'.`);
  }
  return port;
}
