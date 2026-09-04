# StudyBridge

StudyBridge is a small peer tutoring and student-support application. Students create
requests for help with a course, study planning, or campus resources; mentors claim
requests; and coordinators can add private support notes. 

## Quick start

You need Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Open <http://localhost:3000> and sign in with one of the demo accounts:

| Role | Username | Password |
| --- | --- | --- |
| Student | `student` | `student` |
| Mentor | `mentor` | `mentor` |
| Coordinator | `coordinator` | `coordinator` |

The server validates credentials and stores the signed-in account in an
HTTP-only session cookie. Changes are stored in `var/studybridge.json`. Restore the
original sample data with:

```bash
npm run reset:data
```

## Useful commands

```bash
npm test          # run the automated tests
npm run typecheck # check server and browser TypeScript
npm run build     # produce server and browser JavaScript
npm run check     # typecheck, then test
```

## Repository map

```text
client/       Browser UI, written in TypeScript without a framework
data/         Read-only seed data copied on first start
docs/         Architecture, product, testing, and project notes
public/       HTML and CSS served by the application
src/api/      HTTP parsing, routing, and response helpers
src/auth/     Demo credential validation and in-memory login sessions
src/domain/   Shared data types, errors, and authorization policies
src/services/ Use cases and application rules
src/repositories/ Persistence interfaces and JSON-file implementation
tests/        Service and policy tests
```

The production server uses only Node's standard library. TypeScript and the
test runner adapter are development dependencies.

## Project status

StudyBridge is a teaching project rather than a hosted service. Issues and pull
requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md)
for the project's change conventions.
