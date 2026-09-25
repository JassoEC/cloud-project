# Cloud Engineering Focus

## Purpose

This project is intentionally small at the product level and deep at the engineering level.

The residential visitor-management domain is the vehicle for demonstrating the ability to design, provision, secure, operate, and evolve a distributed application on AWS.

The primary outcome is evidence of sound engineering decisions around serverless architecture, data modeling from access patterns, least-privilege IAM, asynchronous processing, reliability, observability, infrastructure as code, CI/CD, cost awareness, security, and privacy.

## Scope

### Phase 1 — Cloud + Backend

The first phase must be complete without the mobile clients.

It includes:

1. Cognito authentication and authorization
2. API Gateway REST API
3. TypeScript Lambda workloads
4. DynamoDB designed from access patterns
5. SQS-based asynchronous notification workflow
6. EventBridge Scheduler-based expiration workflow
7. S3 + CloudFront visitor web
8. CloudWatch logs, metrics, alarms, and dashboards
9. CDK infrastructure
10. Automated tests and CI/CD
11. Failure scenarios and recovery documentation

NestJS may be used where it adds value to the application layer, but AWS primitives remain explicit and understandable.

### Phase 2 — Mobile

React Native/Expo clients are intentionally deferred until the cloud/backend foundation is operational.

The mobile clients consume the same API and demonstrate Cognito authentication, QR scanning, resident workflows, guard workflows, and push notification delivery.

## Engineering Principles

### 1. Access patterns before tables

The conceptual domain model remains:

- Condominium
- Resident
- Guard
- Visit
- Validation

The physical DynamoDB design must be derived from actual queries and mutations.

Every access pattern should document its request, partition key, sort key, GSI when needed, expected cardinality, consistency requirements, pagination behavior, and cost considerations.

The relational-looking interfaces in SPECIFICATIONS.md describe domain objects; they do not prescribe one DynamoDB table per entity.

### 2. Least privilege by workload

Each Lambda or service integration receives only the permissions it requires.

Examples:

- resident workload: own-visit operations and notification enqueue
- guard workload: condominium-scoped visit lookup and validation
- expiration workload: visit status transition only
- notification worker: receive/delete SQS messages and publish/send notification

Broad administrative IAM policies are not acceptable for application workloads.

### 3. Synchronous vs asynchronous work

The API should perform only work required to answer the request.

Notification delivery is asynchronous:

API -> SQS -> worker -> notification provider

The system must tolerate transient failures through retries and a dead-letter queue.

### 4. Idempotency

Operations that can be retried must be safe to execute more than once.

The project must explicitly define idempotency for visit validation, notification processing, and expiration.

### 5. Observability is part of the feature

Structured logs, correlation/request identifiers, business metrics, technical metrics, alarms, and dashboards are part of the definition of done.

Sensitive information must never be written to logs.

### 6. Infrastructure is code

AWS resources are provisioned through CDK and committed to the repository.

Manual console configuration may be used for investigation, but it must not be the required path for reproducing an environment.

### 7. Failure is tested

The project must include documented failure scenarios, such as notification worker failure, SQS redelivery, dead-letter queue routing, duplicate validation requests, expired-visit races, Lambda errors/throttling, and public endpoint abuse.

Each scenario should describe detection, expected behavior, and recovery.

## Definition of Done

A cloud capability is complete only when it has:

- implementation
- infrastructure definition
- automated tests
- security/IAM policy
- observability
- documented failure behavior
- relevant ADR
- reproducible deployment

## Portfolio Evidence

The repository should make architectural reasoning visible.

Important artifacts:

- docs/adr/
- docs/ENGINEERING_FOCUS.md
- docs/SPECIFICATIONS.md

Future additions should include a threat model, runbooks, cost analysis, and an incident exercise.
