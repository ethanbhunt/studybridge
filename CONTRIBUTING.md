# Contributing

Thanks for helping out.

## Before coding

- Search `docs/` for rules connected to the behavior you plan to change.
- Reproduce a bug before fixing it.
- Do not edit `data/seed.json` just to make a test pass.
- Avoid adding dependencies unless the standard library cannot reasonably do
  the job and the deployment notes permit the dependency.

## Architecture convention

HTTP handlers may validate transport details and call a service. They must not
write through a repository directly. A mutation belongs in a service because
services apply authorization, product rules, and audit logging as one use case.
See `docs/architecture.md` and ADR 0001 for the reasoning.

## Tests

Every bug fix needs a regression test at the service layer. Add narrower policy
tests when useful, but do not substitute a route-only test for the service 
regression test.

Run this before opening a pull request:

```bash
npm run check
npm run build
```

## Pull requests

Describe:

- the user-visible behavior before and after;
- the product or architecture rule that applies;
- the verification you performed;
- any intentionally untouched follow-up work.

Never include real user data in examples, screenshots, fixtures, or
commit messages.
