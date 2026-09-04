# ADR 0002: Retain history when accounts close

- Status: accepted
- Date: 2025-09-02

## Context

The tutoring program needs to honor account-closure requests while retaining
anonymous participation counts and a coherent record of who was authorized to
change a request at the time. Deleting an account would leave dangling student,
mentor, note-author, and audit-actor relationships.

## Decision

Account closure anonymizes the account in place. The stable account ID remains,
but direct identifiers are replaced. Related requests, notes, and events are not
deleted or reassigned. Audit details never contain the removed identifiers.

## Consequences

Views must render an anonymized label without attempting to recover the old
identity. Code that assumes all inactive accounts can be deleted is incorrect.
Tests must cover the retained relationships and non-sensitive audit payload.
