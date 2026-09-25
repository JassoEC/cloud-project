# ADR-005: Asynchronous Notification Processing

## Context

A visit validation should not depend on the notification provider responding synchronously. Notification delivery can fail transiently and should not make the guard's validation request fail after the visit has been accepted.

## Decision

Use:

Validation API -> SQS -> Notification Worker -> SNS/provider

Configure a dead-letter queue and bounded retries.

The worker must be idempotent so that redelivery does not generate unintended duplicate business effects.

The API response represents successful domain validation, not successful delivery to the notification provider.

## Consequences

Positive:

- lower coupling
- retry capability
- failure isolation
- explicit operational state

Negative:

- eventual consistency for notifications
- additional infrastructure and monitoring

## Reconsider when

Notification volume, routing requirements, or provider capabilities justify a different eventing/fan-out architecture.
