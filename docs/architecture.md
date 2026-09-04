# Architecture

StudyBridge follows a deliberately small layered design. The layers are more
important than the number of folders: each one owns a different kind of
decision.

```text
browser -> HTTP route -> service -> repository -> JSON file
                        |       |
                        |       -> audit event
                        -> policy functions
```

## Browser client

`client/app.ts` renders server data and sends user actions over HTTP. The client
is not a security boundary. Hiding a button can improve usability, but the
service must still authorize every operation. Browser code must not invent
product rules that disagree with the server.

## HTTP layer

Files in `src/api/` translate HTTP details into ordinary TypeScript values. A
route may parse a path, query string, or JSON body; reject malformed transport
input; call one service method; and map a known application error to an HTTP
response.

Routes do not mutate repositories. A route-level shortcut can appear harmless,
especially for a one-field update, but it bypasses authorization, audit events,
and multi-record rules. The composition root may pass repositories into service
constructors; that does not make repositories part of the route API.

## Services

Services implement complete use cases. A successful mutation normally follows
this sequence:

1. Load the actor and target.
2. Check authorization and current state.
3. Construct the new record without mutating the old object.
4. Persist the record.
5. Append an audit event that describes the same use case.

The JSON repository commits each repository call immediately, so a future
production implementation would need a transaction around steps 4 and 5. For
this teaching app, keep both operations visibly adjacent in the service. Do not
silently omit the audit event.

Query services may read repositories and compose view models. They are also the
last server-side line of defense against exposing staff-only notes.

## Domain

The domain layer contains data shapes, errors, and pure authorization policies.
It does not import HTTP or persistence code. Prefer a small pure policy function
when a rule is shared by multiple use cases.

## Repositories

The interfaces in `src/repositories/interfaces.ts` are the boundary between
application logic and storage. The JSON-file implementation exists so the app
runs without an external service. It returns copies of records: callers should
not rely on mutating a returned object to update storage.

The seed file is immutable input. On first start it is copied to
`var/studybridge.json`; later writes go only to that working file. Tests use an
in-memory repository with fresh data for every test.

## Dependency direction

Dependencies point inward:

- domain imports nothing from the other application layers;
- repositories may import domain types;
- services may import domain and repository interfaces;
- API code may import services and domain errors;
- `src/server.ts` is the composition root and may import every layer.

This is a boundary for maintainability, not a demand for extra abstractions.
Do not introduce interfaces for stateless helpers or split a readable file just
to create more layers.
