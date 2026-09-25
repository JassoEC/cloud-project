# Architecture Review and Specification Adjustments

This document records the changes that should be applied while implementing the existing technical specification.

## Changes to the existing specification

### 1. Expiration scheduling

Replace the per-visit EventBridge rule model with EventBridge Scheduler one-time schedules.

Do not create a permanent event-bus rule for every visit.

The expiration Lambda must perform a conditional state transition so a delayed or duplicate invocation cannot overwrite a terminal state.

DynamoDB TTL can be used later for storage cleanup, but TTL is not the source of truth for business expiration.

### 2. DynamoDB physical model

Keep the current entity definitions as the domain model.

Before implementing tables, produce a physical DynamoDB design containing:

- access pattern
- PK/SK
- GSI
- query example
- cardinality
- consistency requirement
- pagination strategy
- expected cost characteristics

Avoid creating tables because the domain has similarly named entities.

The guard search is particularly important: the current conceptual requirement combines a time range with visitor/unit matching. The implementation must prove that the selected key design can execute this efficiently without relying on an unbounded scan.

### 3. Validation atomicity and idempotency

POST /visits/validate must not be implemented as an unconditional read followed by an unconditional update.

The final implementation should use a conditional write or transaction that prevents two guards from successfully validating the same visit.

A repeated request for an already-terminal visit must produce deterministic behavior.

### 4. Asynchronous notifications

Validation success must be independent from notification delivery.

The flow becomes:

Validation -> SQS -> notification worker -> provider

The SQS queue must have:

- bounded retry behavior
- visibility timeout appropriate for the worker
- dead-letter queue
- alarms/metrics for messages sent to the DLQ

The worker must be idempotent.

### 5. IAM

Define runtime IAM roles per workload.

At minimum:

- API/business workload
- public workload
- expiration workload
- notification worker

Document the exact AWS actions each role requires.

Infrastructure deployment credentials/roles must not be reused as application runtime credentials.

### 6. Security boundary for public access

The public endpoint exposes only the minimum information necessary to render the visitor page.

The access code should be treated as a bearer capability. It must have sufficient entropy and must not be predictable.

Rate limiting should be implemented as an infrastructure/API concern rather than relying exclusively on application code.

### 7. Observability

The existing monitoring requirements should be expanded into implementation requirements:

- structured JSON logs
- correlation ID
- request ID
- business metrics
- technical metrics
- actionable alarms
- separate technical and business dashboards

Logs must exclude passwords, tokens, and unnecessary personal information.

### 8. Local development

LocalStack is useful for fast feedback, but it must not be treated as proof of AWS compatibility.

The project should maintain a clear distinction:

- local tests: fast feedback and deterministic unit/integration tests
- AWS staging: integration validation against real managed services

Important IAM, EventBridge Scheduler, API Gateway, Cognito, and CloudWatch behavior must eventually be validated against AWS.

### 9. CI/CD

The deployment strategy should become executable rather than descriptive.

Pull requests should validate:

- formatting/linting
- unit tests
- integration tests where practical
- TypeScript build
- CDK synth

AWS deployment should be environment-specific and reproducible.

## Implementation order

The recommended order is:

1. CDK foundation and IAM boundaries
2. Cognito + API Gateway
3. DynamoDB physical design
4. Visit lifecycle
5. Public visitor endpoint
6. S3 + CloudFront
7. Guard validation with conditional/idempotent writes
8. SQS + DLQ + notification worker
9. EventBridge Scheduler expiration
10. CloudWatch observability
11. CI/CD
12. failure exercises
13. React Native clients

This order intentionally puts cloud fundamentals before mobile development.

## Explicit non-goals for Phase 1

The following should not expand the initial scope:

- payments
- complex administration UI
- multi-region deployment
- Kubernetes
- event sourcing
- microservices for their own sake
- advanced analytics
- production-scale multi-account organization

The project should become deeper before it becomes broader.
