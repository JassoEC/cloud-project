# Proyecto Transversal

A small cloud-native visit-management system used as a **hands-on AWS learning laboratory**.

The product domain is intentionally simple. The project exists to build practical cloud-engineering experience while studying for the AWS Developer Associate exam.

## Project mission

The goal is not to build a large application as quickly as possible.

The goal is to repeatedly:

1. learn an AWS concept,
2. build a small working example,
3. break it deliberately,
4. inspect and fix the failure,
5. understand the cost/security implications,
6. document the lesson,
7. clean up the resources.

The application is the thread that connects those experiments. It is not a requirement to implement the whole architecture up front.

## Learning principles

### Incremental over comprehensive

Only the AWS capabilities needed for the current learning milestone should be implemented.

Future architecture is documented as backlog, not treated as a current requirement.

### Hands-on over ceremony

A lab is complete when the AWS behavior is understood, not when it has accumulated every production concern.

Production-grade practices such as automated delivery, extensive observability, and multi-environment deployment are introduced when they are useful for learning them.

### Failure is part of the lab

Important capabilities should be exercised in both working and failing states.

Examples:

- missing IAM permission
- Lambda failure
- invalid API request
- DynamoDB conditional failure
- SQS retry/redelivery
- DLQ routing

### Cost awareness is part of cloud engineering

Every lab should make it easy to answer:

- What resources did I create?
- What can cost money?
- What can I delete now?
- What should be monitored?

The sandbox account is a learning budget, not a reason to keep infrastructure running.

## Learning path

The project grows in small milestones.

### Milestone 0 — AWS foundations

Focus:

- AWS account hygiene
- AWS CLI
- IAM fundamentals
- CloudWatch basics
- billing/budget awareness

Outcome:

> I can safely create, inspect, troubleshoot, and remove AWS resources.

### Milestone 1 — Lambda

Start with a single function.

Learn:

- handler/runtime
- execution role
- environment variables
- invocation
- logs
- errors
- basic deployment

Outcome:

> I understand the Lambda execution model instead of only knowing its definition.

### Milestone 2 — API Gateway + Lambda

Build a minimal HTTP endpoint.

Learn:

- REST API integration
- request/response mapping
- authentication boundary
- API errors
- CloudWatch troubleshooting

Outcome:

> I can expose a Lambda-backed API and diagnose a failed request.

### Milestone 3 — DynamoDB

Persist the visit domain.

Start with only the access patterns required by the current API.

Learn:

- partition/sort keys
- Query vs Scan
- conditional writes
- indexes when justified
- consistency
- capacity/cost basics

Outcome:

> I can model DynamoDB from access patterns and explain why the key design exists.

### Milestone 4 — IAM and Cognito

Introduce authenticated resident/guard operations.

Learn:

- IAM roles and policies
- Lambda permissions
- least privilege
- authentication vs authorization
- Cognito integration

Outcome:

> I can explain who is allowed to do what and where that permission is enforced.

### Milestone 5 — S3 and visitor web

Add a minimal visitor-facing web surface.

Learn:

- object storage
- private/public boundaries
- presigned access where appropriate
- static delivery
- CloudFront fundamentals

Outcome:

> I understand the difference between storing content and serving content.

### Milestone 6 — SQS and asynchronous processing

Move notification work off the synchronous API path.

Learn:

- queues
- consumers
- retries
- visibility timeout
- DLQs
- idempotency

Outcome:

> I can design and troubleshoot a small asynchronous workflow.

### Milestone 7 — EventBridge Scheduler

Add visit expiration.

Learn:

- scheduled invocation
- delayed work
- race conditions
- idempotent state transitions

Outcome:

> I understand when scheduled work is preferable to synchronous request handling.

### Milestone 8 — CDK

Once the core resources are familiar, reproduce them with infrastructure as code.

Learn:

- CDK constructs
- stacks
- configuration
- CloudFormation lifecycle
- synth/deploy/destroy

Outcome:

> I can reproduce the lab environment instead of relying on console clicks.

### Milestone 9 — Observability and failure exercises

Add only the telemetry needed to operate the current system.

Learn:

- structured logs
- metrics
- alarms
- dashboards
- troubleshooting workflows
- failure drills

Outcome:

> I can investigate a production-like failure using evidence from AWS.

### Milestone 10 — CI/CD

Automate validation and deployment after the deployment model is understood manually.

Learn:

- GitHub Actions
- test/lint/build
- CDK synth
- deployment permissions
- environment separation

Outcome:

> I understand what the pipeline is automating because I have already performed the steps manually.

## Lab structure

Small, disposable experiments belong under `labs/`.

Suggested structure:

```
labs/
├── 01-lambda/
├── 02-api-gateway/
├── 03-dynamodb/
├── 04-iam/
├── 05-cognito/
├── 06-s3/
├── 07-sqs/
├── 08-eventbridge/
├── 09-cdk/
└── 10-observability/
```

A lab may be completed in one or a few study sessions. It does not need to become production code.

The main application should only absorb a capability after the underlying AWS behavior has been understood.

## Definition of done for a learning milestone

A milestone is complete when I can:

- explain the problem the AWS service solves,
- create and use the service,
- integrate it with the application or a focused lab,
- reproduce at least one meaningful failure,
- diagnose and fix that failure,
- identify the important security boundary,
- identify the main cost driver,
- clean up the resources,
- document what I learned.

Not every milestone needs:

- a production-grade CI/CD pipeline,
- multiple environments,
- exhaustive E2E coverage,
- a dashboard,
- a custom domain,
- an ADR.

Those concerns are introduced when they become the subject of the lesson.

## Deferred scope

The original architecture remains useful as a **future target**, but it is not the current implementation plan.

The following are explicitly deferred until the learning path reaches them:

- full visitor lifecycle
- multiple DynamoDB GSIs and advanced access patterns
- complete guard workflows
- notification provider integration
- expiration orchestration
- production observability
- staging/production environments
- Route 53 / ACM
- GitHub Actions deployment
- React Native clients
- advanced threat modeling
- portfolio hardening

Existing specifications and ADRs can be used as reference material, but they do not create implementation obligations for the current milestone.

## Relationship to DVA preparation

The Udemy course is the conceptual track.

This repository is the practical track.

The intended loop is:

```
Course topic
    ↓
Small AWS lab
    ↓
Apply it to cloud-project
    ↓
Break it
    ↓
Fix it
    ↓
Document the lesson
    ↓
Practice exam questions
    ↓
Next topic
```

The project should therefore evolve with the course instead of becoming a separate large project competing for study time.

## Current status

🚧 **Learning-path refactor**

The architecture and product specifications contain a larger future scope. This branch narrows the active scope so the repository can be used as a sustainable AWS learning laboratory.

## Documentation

- [Learning Path](docs/LEARNING_PATH.md)
- [Engineering Focus](docs/ENGINEERING_FOCUS.md)
- [Technical Specifications](docs/SPECIFICATIONS.md)
- [ADR-001 Serverless Architecture](docs/adr/001-serverless-architecture.md)
- [ADR-002 DynamoDB Access Patterns](docs/adr/002-dynamodb-access-patterns.md)
- [ADR-003 Visit Expiration](docs/adr/003-visit-expiration.md)
- [ADR-004 Least-Privilege IAM](docs/adr/004-least-privilege-iam.md)
- [ADR-005 Asynchronous Notifications](docs/adr/005-asynchronous-notifications.md)
- [ADR-006 Observability](docs/adr/006-observability.md)
- [ADR-007 CI/CD and Environments](docs/adr/007-ci-cd-and-environments.md)

## License

This project is for educational and portfolio purposes.
