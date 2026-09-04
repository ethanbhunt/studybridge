import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer, type ServerResponse } from "node:http";
import { extname, join, normalize } from "node:path";
import { createApplication, type Application } from "./application.js";
import { createApiHandler } from "./api/router.js";
import { readConfig } from "./config.js";

const config = readConfig();
let applicationPromise: Promise<Application> | undefined;
const getApplication = (): Promise<Application> => {
  applicationPromise ??= createApplication(
    config.dataFilename,
    config.seedFilename,
  );
  return applicationPromise;
};

const handleApi = createApiHandler(getApplication);
const server = createServer(async (request, response) => {
  const pathname = new URL(
    request.url ?? "/",
    "http://studybridge.local",
  ).pathname;

  if (pathname.startsWith("/api/")) {
    await handleApi(request, response);
    return;
  }
  await serveStatic(pathname, config.publicDirectory, response);
});

server.listen(config.port, () => {
  console.log(`StudyBridge is running at http://localhost:${config.port}`);
});

process.on("SIGTERM", () => {
  console.log("Stopping StudyBridge...");
  server.close((error) => {
    process.exitCode = error === undefined ? 0 : 1;
  });
  setTimeout(() => process.exit(1), 9_000).unref();
});

async function serveStatic(
  pathname: string,
  publicDirectory: string,
  response: ServerResponse,
): Promise<void> {
  const requested = pathname === "/" ? "index.html" : pathname.slice(1);
  const safePath = normalize(requested).replace(/^(\.\.(\/|\\|$))+/, "");
  const filename = join(publicDirectory, safePath);

  try {
    const fileStat = await stat(filename);
    if (!fileStat.isFile()) {
      throw new Error("not a file");
    }
    response.writeHead(200, {
      "content-type": mediaType(filename),
      "content-length": fileStat.size,
      "x-content-type-options": "nosniff",
    });
    createReadStream(filename).pipe(response);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found\n");
  }
}

function mediaType(filename: string): string {
  const types: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".svg": "image/svg+xml",
  };
  return types[extname(filename)] ?? "application/octet-stream";
}
