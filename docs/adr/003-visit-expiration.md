# ADR-003: Scheduled Visit Expiration

## Context

Each visit has an expiration timestamp. The original design proposed creating and deleting an EventBridge rule for every visit.

That creates unnecessary lifecycle management for per-visit infrastructure objects.

## Decision

Use EventBridge Scheduler for one-time expiration invocations.

The expiration workflow is:

Create visit -> calculate expiresAt -> schedule expiration -> expiration Lambda -> conditional status update

The expiration operation must be idempotent and must not overwrite a visit that has already been cancelled, rejected, or validated.

DynamoDB TTL may be considered as a secondary storage cleanup mechanism, but it is not the business-state transition mechanism because TTL deletion is not a precise application event.

## Consequences

Positive:

- separates business expiration from storage cleanup
- avoids maintaining one EventBridge rule lifecycle per visit
- makes expiration behavior explicit and testable

Negative:

- scheduled invocations add another distributed boundary
- the application must handle duplicate or delayed expiration events

## Reconsider when

Expiration volume or timing requirements make a periodic expiration worker more appropriate than individual schedules.
