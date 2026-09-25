# ADR-001: Serverless Architecture

## Context

The project is intended to demonstrate cloud engineering skills while keeping operational overhead appropriate for a portfolio-scale application.

The workloads are request-driven, asynchronous, and scheduled. They do not require long-lived application servers.

## Decision

Use API Gateway for HTTP exposure, Lambda for application workloads, DynamoDB for primary persistence, SQS for asynchronous work, EventBridge Scheduler for scheduled expiration, S3 + CloudFront for the visitor web, and Cognito for identity.

The application layer remains TypeScript. NestJS can be used selectively, but the architecture must keep AWS runtime boundaries explicit.

## Alternatives

### ECS/Fargate

Provides long-running containers and more runtime control, but introduces a larger operational surface for this workload.

### EC2

Provides maximum infrastructure control but requires server lifecycle, patching, scaling, and availability management.

## Consequences

Positive:

- small operational footprint
- automatic scaling for request-driven workloads
- native AWS integrations
- infrastructure is reproducible through CDK

Negative:

- distributed debugging requires deliberate observability
- Lambda runtime limits affect workload design
- local emulation cannot reproduce every AWS behavior

## Reconsider when

The system develops sustained workloads, long-running processes, specialized runtime requirements, or performance characteristics that justify containers.
