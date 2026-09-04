# Deployment notes

StudyBridge is designed for a small teaching-lab container with Node.js 20.
The container has no compiler toolchain after the image is built and runs with
network access disabled. Its writable data volume is mounted at `/data`; the
application image and all other paths are read-only.

Consequences:

- Production dependencies must be pure JavaScript and work without install-time
  downloads or native compilation. Do not replace the JSON repository with a
  native SQLite package.
- Browser assets and server TypeScript must be compiled during the image build,
  not on application startup.
- Set `STUDYBRIDGE_DATA_FILE=/data/studybridge.json` in the container. Local
  development defaults to `var/studybridge.json`.
- The service must bind the `PORT` environment variable when present and must
  answer `GET /api/health` without touching the data file.
- The current platform sends `SIGTERM` and allows ten seconds to stop accepting
  connections. Keep the shutdown handler in `src/server.ts`.

This is a compatibility contract for the course environment. A future move to a
managed database is reasonable, but it is not part of a maintenance work item.
