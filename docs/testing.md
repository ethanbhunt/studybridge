# Testing guide

The default test command is:

```bash
npm test
```

Tests use Node's built-in test runner through `tsx`, so TypeScript test files run
without a separate compilation step. `npm run check` also type-checks the server
and browser code.

## Where a regression test belongs

A bug fix requires a service-layer regression test. The service is where HTTP,
authorization, persistence, and product behavior meet; testing only a route or
pure helper can miss a broken use case. It is fine to add a smaller policy test
as well.

Tests should:

- start from a new in-memory database;
- use the fixed clock and ID source in `tests/fixtures.ts` when time or IDs
  matter;
- assert the user-visible result;
- assert important side effects such as the audit event;
- assert important non-effects, especially for rejected and idempotent actions.

Avoid snapshots for these small domain objects. Explicit assertions make the
rule under test easier to review.

## Manual checks

After the automated checks pass, use the demo toolbar to repeat the scenario as
the affected role. Inspect the browser response, not just whether a button is
visible. The browser is not an authorization boundary.

## Test data

Tests must not read or modify `var/studybridge.json`. `createTestContext()`
builds a fresh in-memory database from fictional fixtures. Keep real personal
information out of fixtures and failure messages.
