# ADR-006: Observability as a First-Class Capability

## Context

A distributed serverless system cannot be operated reliably from application logs alone.

## Decision

Instrument:

- structured JSON logs
- request/correlation identifiers
- Lambda duration and errors
- API latency
- API 5xx rate
- throttling
- validation latency
- visits created/validated/rejected/expired
- notification processing failures

Create separate technical and business dashboards.

Alarms should represent actionable conditions rather than every possible metric anomaly.

Sensitive personal information, access tokens, passwords, and secrets must not appear in logs.

## Consequences

Positive:

- faster diagnosis
- measurable SLO-oriented behavior
- operational evidence for the portfolio

Negative:

- instrumentation and log retention have a cost
- metric dimensions require careful cardinality control

## Reconsider when

A future production workload justifies dedicated observability tooling beyond CloudWatch.
