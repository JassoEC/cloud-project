# Proyecto Transversal

A cloud-native visit management system for residential communities, designed as a hands-on AWS Cloud Engineering laboratory and portfolio project.

## Project Mission

The residential visitor-management domain is intentionally small. The engineering depth is the point.

This project is designed to demonstrate the ability to **design, provision, secure, operate, observe, and evolve a distributed application on AWS**.

The primary learning areas are:

- Serverless architecture
- DynamoDB access-pattern-first modeling
- Least-privilege IAM
- Event-driven and asynchronous processing
- Reliability and failure handling
- Observability
- Infrastructure as Code
- CI/CD
- Security and privacy
- Cost awareness

The product domain is a vehicle for exercising those capabilities.

> **Engineering principle:** a feature is not complete when the code works locally. It is complete when its implementation, infrastructure, security, tests, observability, failure behavior, and deployment path are understood.

## Problem Domain

Residential communities often manage visitors through phone calls, WhatsApp messages, paper logs, and manual coordination.

The system models a minimal digital flow:

1. A resident registers an expected visitor.
2. The system generates an access code and public URL.
3. The resident shares the URL with the visitor.
4. The visitor presents the generated QR code at the entrance.
5. A guard validates the visit.
6. The resident receives an asynchronous notification.

A second flow supports visitors without a usable phone:

1. The guard searches by visitor name or unit.
2. The system searches the expected-visit window.
3. Sensitive resident information is only exposed after an exact match.
4. If the guard cannot establish a safe match, the resident is contacted directly.

## Architecture

Phase 1 intentionally focuses on cloud/backend engineering before mobile clients are introduced.

```
                         ┌─────────────────────┐
                         │   Visitor Web       │
                         │   S3 + CloudFront   │
                         └──────────┬──────────┘
                                    │
Resident / Guard ────────┐         │
                          ▼         ▼
                    ┌───────────────────┐
                    │    API Gateway    │
                    │       REST        │
                    └─────────┬─────────┘
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
          Auth / Cognito  Business      Public
                          Lambdas       Lambda
                              │
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
                DynamoDB     SQS    Scheduler
                              │         │
                              ▼         ▼
                         Notification  Expiration
                           Worker       Lambda
                              │         │
                              ▼         ▼
                             SNS     DynamoDB
```

Cross-cutting capabilities:

```
     ┌─────────────────────────────────────────┐
     │ IAM · CloudWatch · CDK · CI/CD · Tests │
     └─────────────────────────────────────────┘
```

## AWS Responsibilities

| Capability | AWS service | Engineering concern |
|---|---|---|
| Identity | Cognito | Authentication and authorization |
| HTTP API | API Gateway | Public/private boundaries, throttling |
| Compute | Lambda | Stateless workloads and runtime boundaries |
| Primary data | DynamoDB | Access-pattern-first modeling |
| Async work | SQS | Decoupling, retries, DLQ |
| Notifications | SNS/provider | Eventual consistency and delivery |
| Scheduling | EventBridge Scheduler | One-time expiration events |
| Visitor web | S3 + CloudFront | Static delivery and HTTPS |
| Observability | CloudWatch | Logs, metrics, alarms, dashboards |
| IaC | AWS CDK | Reproducible infrastructure |
| Delivery | GitHub Actions | Automated validation and deployment |
| Security | IAM | Least-privilege runtime roles |

## Engineering Principles

### Access patterns before tables

The conceptual domain model contains:

- Condominium
- Resident
- Guard
- Visit
- Validation

Those objects do not imply one DynamoDB table per entity.

The physical model must be derived from the queries and mutations required by the application. See [ADR-002](docs/adr/002-dynamodb-access-patterns.md).

### Least privilege

Each workload receives only the permissions it needs.

Runtime roles must not use broad administrative policies. Infrastructure deployment permissions are separated from application runtime permissions.

See [ADR-004](docs/adr/004-least-privilege-iam.md).

### Synchronous vs asynchronous work

The validation API should not wait for notification delivery.

```
Validation API
      │
      ▼
     SQS
      │
      ▼
Notification Worker
      │
      ▼
     SNS
```

Retries and a dead-letter queue are part of the design.

See [ADR-005](docs/adr/005-asynchronous-notifications.md).

### Idempotency

Retryable operations must be safe to execute more than once.

The implementation must explicitly handle:

- visit validation
- notification processing
- expiration

### Observability

CloudWatch is not an afterthought.

The project will expose:

- structured logs
- correlation/request IDs
- API latency
- API 5xx rate
- Lambda errors and duration
- throttling
- validation latency
- visits created/validated/rejected/expired
- notification failures

See [ADR-006](docs/adr/006-observability.md).

### Infrastructure as Code

AWS infrastructure is provisioned through CDK.

Manual console configuration may be used while learning or investigating, but the repository must remain capable of reproducing the environment.

### Failure is part of the design

The project will deliberately exercise scenarios such as:

- SQS redelivery
- notification worker failure
- DLQ routing
- duplicate validation
- expiration races
- Lambda errors/throttling
- public endpoint abuse

## Phase 1 — Cloud + Backend

Phase 1 is complete without React Native.

### Milestone 1 — Foundation

- CDK project
- AWS account/bootstrap strategy
- TypeScript runtime
- Cognito
- API Gateway
- DynamoDB access-pattern design
- IAM roles
- automated tests

### Milestone 2 — Visit lifecycle

- Register visit
- Generate secure access code
- Retrieve own visits
- Cancel pending visit
- Public visit lookup
- Authorization boundaries

### Milestone 3 — Visitor web

- Static visitor page
- S3
- CloudFront
- HTTPS/custom domain when appropriate
- QR generation
- Public API protection

### Milestone 4 — Guard workflows

- QR validation
- Alternative search
- condominium scoping
- exact-match privacy rules
- atomic/idempotent validation

### Milestone 5 — Event-driven behavior

- SQS notification queue
- retry policy
- dead-letter queue
- notification worker
- EventBridge Scheduler expiration
- idempotent expiration

### Milestone 6 — Operability

- structured logging
- CloudWatch metrics
- dashboards
- alarms
- failure exercises
- operational runbooks

### Milestone 7 — Delivery

- GitHub Actions
- lint/test/build
- CDK synth
- staging deployment
- controlled production deployment
- deployment documentation

## Phase 2 — Mobile Client

After Phase 1 is operational:

- React Native / Expo resident app
- React Native / Expo guard app
- Cognito authentication
- QR scanning
- resident visit management
- guard validation
- push notification UX

Mobile is intentionally a second phase so that the project demonstrates cloud/backend depth before client breadth.

## Definition of Done

A cloud capability is complete only when it has:

- application implementation
- CDK infrastructure
- automated tests
- least-privilege IAM
- observability
- documented failure behavior
- relevant ADR
- reproducible deployment

## Documentation

- [Engineering Focus](docs/ENGINEERING_FOCUS.md)
- [Technical Specifications](docs/SPECIFICATIONS.md)
- [ADR-001 Serverless Architecture](docs/adr/001-serverless-architecture.md)
- [ADR-002 DynamoDB Access Patterns](docs/adr/002-dynamodb-access-patterns.md)
- [ADR-003 Visit Expiration](docs/adr/003-visit-expiration.md)
- [ADR-004 Least-Privilege IAM](docs/adr/004-least-privilege-iam.md)
- [ADR-005 Asynchronous Notifications](docs/adr/005-asynchronous-notifications.md)
- [ADR-006 Observability](docs/adr/006-observability.md)
- [ADR-007 CI/CD and Environments](docs/adr/007-ci-cd-and-environments.md)

Planned documentation:

- Threat model
- DynamoDB physical key design
- Operational runbooks
- Cost analysis
- Incident/failure exercise
- CI/CD implementation guide

## Current Status

🚧 **Architecture refactoring phase**

The product specification is established. The current work is turning it into an explicit cloud-engineering learning path before implementation begins.

## License

This project is for educational and portfolio purposes.
