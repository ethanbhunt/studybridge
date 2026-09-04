# ADR 0001: Mutations pass through services

- Status: accepted
- Date: 2025-08-18

## Context

Early prototypes let routes update the repository directly. Authorization and
audit logging then differed by endpoint, and one route exposed an account state
that could not be produced through the main UI.

## Decision

All application mutations are service methods. Routes parse and translate;
repositories store and retrieve. A service owns the complete authorized use
case and its audit event.

## Consequences

Even a one-line update may need a service method. This small amount of ceremony
keeps every entry point consistent and makes service tests meaningful. Read-only
query composition may live in a query service.
