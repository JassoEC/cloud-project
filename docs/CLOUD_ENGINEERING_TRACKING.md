# Cloud Engineering Tracking Guide

> Tracking guide for building **Proyecto Transversal** as an AWS Cloud Engineering laboratory.

## How to use this document

This document turns the project roadmap into a practical tracking system. The goal is not to measure how much code exists, but how much technical capability has been developed.

A capability is truly complete when you can answer four questions:

1. **Build — Can I build it?**
2. **Understand — Can I explain why it works this way and what trade-offs it has?**
3. **Operate — Can I detect, diagnose, and recover when it fails?**
4. **Reproduce — Can I recreate it through infrastructure and automation?**

Checking a box only because "it works on my machine" is not sufficient.

### Recommended states

- [ ] Pending
- [~] In progress
- [x] Implemented
- [x] Understood
- [x] Operable
- [x] Reproducible

When useful, record evidence below a check: commit, test, dashboard, metric, ADR, runbook, or failure experiment.

---

# 0. Architecture and Design

## Objective

Before building services, you should be able to explain the system as a distributed architecture and justify every major component.

The goal is not to memorize AWS services. It is to learn how to turn business requirements into technical decisions: synchronous vs asynchronous processing, state vs events, authorization, persistence, availability, observability, and cost.

### Checks

- [ ] Explicitly define the project's engineering objective.
- [ ] Draw the overall architecture.
- [ ] Document the main Resident → API → Visit → Visitor → Guard flow.
- [ ] Document the asynchronous notification flow.
- [ ] Document the expiration flow.
- [ ] Document trust boundaries.
- [ ] Document which AWS service owns each responsibility.
- [ ] Document synchronous and asynchronous components.
- [ ] Document where eventual consistency can occur.
- [ ] Define local, staging, and production environments.
- [ ] Maintain ADRs for relevant architectural decisions.
- [ ] Define a Definition of Done for cloud capabilities.

### You should understand

- Why a Lambda is not simply "a small server".
- When API Gateway should invoke Lambda directly and when SQS should decouple work.
- Why DynamoDB's physical model depends on access patterns.
- Why IAM is part of architecture rather than post-deployment configuration.
- What distributed systems imply: latency, partial failures, retries, duplicates, and consistency.

### Evidence

You can draw the architecture from scratch and explain the path of a request, including what happens when one component fails.

---

# 1. AWS Account Foundation

## Objective

Build a secure and reproducible AWS foundation for experimentation without turning the learning account into an operational or financial risk.

### Checks

- [ ] Configure the AWS sandbox account.
- [ ] Configure MFA and protect the root user.
- [ ] Define the primary region.
- [ ] Define an identity and role strategy.
- [ ] Configure the AWS CLI.
- [ ] Configure profiles/credentials without storing secrets in the repository.
- [ ] Run and understand `aws sts get-caller-identity`.
- [ ] Configure billing alerts.
- [ ] Review relevant AWS service limits.
- [ ] Document cost assumptions.
- [ ] Document how experimental resources are destroyed.

### You should understand

The difference between:

- AWS account;
- IAM user;
- IAM role;
- long-lived credentials;
- temporary credentials;
- the identity used by your CLI;
- the identity assumed by a Lambda;
- the identity used by CI/CD.

The important question is not "How do I log into AWS?" but:

> Which identity is performing this operation, and what permissions does it have?

### Evidence

You can explain the result of `sts get-caller-identity`, identify which credential/role performs an operation, and demonstrate that the repository contains no AWS secrets.

---

# 2. CDK / Infrastructure as Code

## Objective

Make infrastructure versioned, reviewable, reproducible code.

### Checks

- [ ] Create the CDK TypeScript structure.
- [ ] Define stack/context.
- [ ] Implement `cdk synth`.
- [ ] Implement `cdk diff`.
- [ ] Implement `cdk deploy`.
- [ ] Implement `cdk destroy` for disposable resources.
- [ ] Define useful outputs.
- [ ] Define naming and tags.
- [ ] Define removal policies consciously.
- [ ] Model Cognito.
- [ ] Model API Gateway.
- [ ] Model DynamoDB.
- [ ] Model SQS/DLQ.
- [ ] Model EventBridge Scheduler.
- [ ] Model observability.
- [ ] Avoid manual configuration as a deployment requirement.
- [ ] Review generated CloudFormation.

### You should understand

CDK does not replace CloudFormation: it generates a declarative template that CloudFormation uses to manage infrastructure state.

You should be able to distinguish:

- application code;
- infrastructure code;
- configuration;
- AWS-managed state;
- secrets;
- ephemeral vs persistent resources.

You should also understand what changing a resource can mean: in-place update, replacement, potential data loss, and resource dependencies.

### Evidence

Another person can clone the repository, configure credentials, and deploy the stack without relying on undocumented manual steps.

---

# 3. IAM and Security

## Objective

Learn least privilege through small roles and isolated responsibilities.

### Checks

- [ ] Configure Cognito User Pool.
- [ ] Configure App Client.
- [ ] Define user roles/profiles.
- [ ] Create a role for API/business logic.
- [ ] Create a role for the notification worker.
- [ ] Create a role for expiration.
- [ ] Separate deployment permissions from runtime permissions.
- [ ] Avoid AdministratorAccess for workloads.
- [ ] Avoid `*` when a specific resource is sufficient.
- [ ] Review every Lambda's permissions.
- [ ] Test Resident isolation to their own visits.
- [ ] Test Guard isolation to their condominium.
- [ ] Test that a worker cannot modify resources it does not need.
- [ ] Test invalid/expired JWT behavior.
- [ ] Document major threats.

### You should understand

IAM should answer:

> Who can do what, on which resource, and under which conditions?

A working system is not enough. You must demonstrate that a compromised credential has a limited blast radius.

Also understand the difference between:

- authentication: who you are;
- authorization: what you can do;
- user identity;
- workload identity;
- infrastructure permissions.

### Evidence

For every workload, you can explain which AWS actions it needs and why. You can also deliberately remove a permission and demonstrate what fails and how the failure is detected.

---

# 4. DynamoDB and Access Patterns

## Objective

Learn to design DynamoDB from real queries rather than relational entities.

### Minimum access patterns

- [ ] Get a visit by access code.
- [ ] Get visits for a resident.
- [ ] Get expected visits.
- [ ] Search visitors by name/unit within a time window.
- [ ] Query residents in a condominium.
- [ ] Query guards in a condominium.
- [ ] Validate a visit.
- [ ] Expire a visit.
- [ ] Query relevant history.

### Checks

- [ ] Define PK/SK.
- [ ] Define GSIs.
- [ ] Document cardinality.
- [ ] Document required consistency.
- [ ] Document pagination.
- [ ] Document the cost of each access pattern.
- [ ] Create the table through CDK.
- [ ] Create indexes through CDK.
- [ ] Implement the repository/data-access layer.
- [ ] Implement real queries.
- [ ] Avoid scans for normal operations.
- [ ] Implement conditional writes.
- [ ] Evaluate the need for TransactWriteItems.
- [ ] Design idempotency.
- [ ] Test concurrent validation.

### You should understand

The first DynamoDB question is not:

> "What tables do I have?"

It is:

> "What queries must I execute, and how will I solve them efficiently?"

Understand:

- partition key;
- sort key;
- data distribution;
- hot partitions;
- GSI;
- Query vs Scan;
- consistency;
- conditional expressions;
- idempotency;
- read/write cost;
- pagination.

### Evidence

You can take a new domain query and design its DynamoDB access pattern before writing code. You can explain why a Scan would be a poor solution for a frequent operation.

---

# 5. Cognito + API Gateway

## Objective

Build an authenticated and controlled HTTP boundary.

### Checks

- [ ] User registration.
- [ ] Login.
- [ ] JWT issuance.
- [ ] Token refresh/lifecycle.
- [ ] Derive user identity from the JWT.
- [ ] Define role-based authorization.
- [ ] Configure API Gateway.
- [ ] Configure routes.
- [ ] Configure CORS where appropriate.
- [ ] Configure throttling.
- [ ] Validate requests.
- [ ] Define consistent HTTP errors.
- [ ] Protect private endpoints.
- [ ] Keep the public endpoint conceptually separate.

### Target endpoints

- [ ] `POST /auth/register`
- [ ] `POST /visits`
- [ ] `GET /visits`
- [ ] `DELETE /visits/:id`
- [ ] `POST /visits/validate`
- [ ] `GET /visits/expected`
- [ ] `POST /visits/search`
- [ ] `GET /public/visits/:code`

### You should understand

The API must not trust client-supplied data to determine identity.

For example, a resident should not send `residentId=123` and expect the API to accept it as truth. Identity should come from the authenticated context, and authorization must be enforced by the backend.

Also understand the difference between:

- authentication;
- authorization;
- validation;
- throttling;
- rate limiting;
- CORS;
- client errors vs server errors.

### Evidence

You can inspect a request and explain how it travels from API Gateway to Lambda and how identity and authorization are determined.

---

# 6. Visit Domain and State Machine

## Objective

Keep the domain small but rich enough to practice business rules and state transitions.

### Target state

`PENDING → VALIDATED`

Terminal states:

- `REJECTED`
- `CANCELLED`
- `EXPIRED`

### Checks

- [ ] Create visit.
- [ ] Generate access code.
- [ ] Calculate expiration.
- [ ] Get visit.
- [ ] Cancel visit.
- [ ] Validate visit.
- [ ] Reject visit.
- [ ] Expire visit.
- [ ] Implement the ±90-minute search window.
- [ ] Implement exact matching where required.
- [ ] Implement case-insensitive comparison.
- [ ] Protect sensitive information.
- [ ] Enforce condominium isolation.
- [ ] Handle multiple matches.
- [ ] Define terminal-state behavior.
- [ ] Define duplicate-validation behavior.

### You should understand

A state transition is more than updating a property.

Ask:

- Who can execute it?
- From which state?
- What happens if two processes execute it simultaneously?
- What external event triggers it?
- What side effects does it produce?
- Is it idempotent?
- How is it observed?

### Evidence

You can draw the state machine and demonstrate what happens when two requests attempt to validate the same visit simultaneously.

---

# 7. Asynchronous Architecture: SQS + Worker + DLQ

## Objective

Learn to decouple work that does not need to block the immediate response and handle partial failures.

Flow:

`Validation API → SQS → Worker → Notification Provider`

### Checks

- [ ] Create SQS queue.
- [ ] Configure visibility timeout.
- [ ] Configure retries.
- [ ] Create DLQ.
- [ ] Configure redrive policy.
- [ ] Create worker Lambda.
- [ ] Implement processing.
- [ ] Implement idempotency.
- [ ] Handle transient errors.
- [ ] Handle permanent errors.
- [ ] Record failed messages.
- [ ] Create a DLQ alarm.
- [ ] Test success.
- [ ] Test retry.
- [ ] Test repeated failure → DLQ.

### You should understand

SQS is not simply "a way to send messages".

Understand:

- eventual consistency;
- at-least-once delivery;
- duplicates;
- visibility timeout;
- retries;
- poison messages;
- DLQ;
- backpressure;
- idempotency.

A key question:

> What happens if the worker processes the message, sends the notification, and then fails before the message is successfully acknowledged?

The answer must be part of the design.

### Evidence

You can introduce an artificial worker failure and observe the retry, the DLQ message, and the corresponding alarm.

---

# 8. EventBridge Scheduler and Expiration

## Objective

Learn to execute a future action as part of an entity's lifecycle.

### Checks

- [ ] Create a one-time schedule.
- [ ] Associate it with `expiresAt`.
- [ ] Invoke the expiration Lambda.
- [ ] Implement a conditional transition to EXPIRED.
- [ ] Handle duplicate execution.
- [ ] Handle delayed execution.
- [ ] Define schedule cleanup.
- [ ] Observe executions and errors.
- [ ] Document why Scheduler is used.

### You should understand

Distinguish between:

- DynamoDB TTL;
- EventBridge Scheduler;
- EventBridge Rules.

TTL is primarily for eventual data expiration/deletion.

Scheduler is appropriate when a specific action needs to happen at a scheduled time.

A visit becoming invalid is a business state transition, so TTL should not automatically be treated as a replacement for that logic.

### Evidence

You can delay or repeat expiration execution and demonstrate that the state transition remains safe.

---

# 9. Visitor Web: S3 + CloudFront

## Objective

Build a minimal public client and use it as a laboratory for hosting, CDN behavior, and security.

### Checks

- [ ] Create the static web application.
- [ ] Publish assets to S3.
- [ ] Configure CloudFront.
- [ ] Configure HTTPS.
- [ ] Configure caching.
- [ ] Configure required errors/routing.
- [ ] Consume the public endpoint.
- [ ] Display the QR code.
- [ ] Display minimum visit information.
- [ ] Display expired visits.
- [ ] Display invalid codes.
- [ ] Validate responsive behavior.

### Security

- [ ] Do not expose unnecessary sensitive information.
- [ ] Treat the access code as a bearer capability.
- [ ] Use sufficient entropy/unpredictability.
- [ ] Protect the endpoint against abuse.
- [ ] Do not place secrets in public JavaScript.

### You should understand

The public web experience is deliberately different from the authenticated application.

The visitor does not need an account, so the access code acts as a capability. It must therefore be difficult to guess, and the response should contain only the information required for the visitor flow.

Also understand:

- object storage;
- CDN;
- cache;
- invalidation;
- HTTPS;
- origin;
- public exposure vs controlled public access.

### Evidence

You can explain what information would be dangerous to expose even with a valid access code and how you would limit that exposure.

---

# 10. Observability and Operations

## Objective

Move from "the system works" to "I know whether it works, why it fails, and when it recovered".

### Logs

- [ ] Structured JSON logs.
- [ ] Request/correlation ID.
- [ ] User ID where appropriate.
- [ ] Operation identifiers.
- [ ] Consistent log levels.
- [ ] No secrets in logs.
- [ ] Minimize PII.
- [ ] Record errors with useful context.

### Metrics

- [ ] Visits created.
- [ ] Visits validated.
- [ ] Visits rejected.
- [ ] Visits expired.
- [ ] Validation latency.
- [ ] API latency.
- [ ] API 5xx.
- [ ] Lambda errors.
- [ ] Lambda duration.
- [ ] Lambda throttles.
- [ ] SQS failures.
- [ ] DLQ messages.

### Dashboards

- [ ] Technical dashboard.
- [ ] Business dashboard.
- [ ] Visualize trends.
- [ ] Identify anomalies.

### Alarms

- [ ] API 5xx.
- [ ] High latency.
- [ ] Lambda errors.
- [ ] Lambda throttling.
- [ ] DLQ messages.

### You should understand

Observability answers three questions:

- **Logs:** What happened?
- **Metrics:** How often or how severely is it happening?
- **Traces/correlation:** How is one distributed operation connected across components?

Producing logs is not enough. They must allow investigation of a specific operation.

### Evidence

Introduce a failure and demonstrate:

1. how it is detected;
2. where it appears;
3. how you identify the cause;
4. how you verify recovery.

---

# 11. Testing

## Objective

Test behavior, security, and contracts rather than only isolated functions.

### Unit tests

- [ ] Domain rules.
- [ ] State transitions.
- [ ] Access code generation.
- [ ] Validation rules.
- [ ] Authorization decisions.

### Integration tests

- [ ] DynamoDB.
- [ ] SQS.
- [ ] Cognito/API boundary.
- [ ] Persistence conditions.
- [ ] Worker behavior.

### E2E

- [ ] Resident creates a visit.
- [ ] Visitor opens the URL.
- [ ] Guard validates.
- [ ] Notification flow executes.
- [ ] Visit expires.

### Security tests

- [ ] Resident cannot access another resident's visit.
- [ ] Guard cannot access another condominium.
- [ ] Invalid JWT is rejected.
- [ ] Expired JWT is rejected.
- [ ] Public endpoint does not expose sensitive data.
- [ ] Invalid access code reveals no sensitive information.
- [ ] Concurrent validation does not produce two valid validations.

### You should understand

The difference between:

- unit;
- integration;
- contract;
- end-to-end;
- security;
- failure testing.

Also understand which dependencies should be mocked and which are worth testing against real or emulated services.

LocalStack can help during development, but it does not by itself prove that behavior is identical to AWS.

### Evidence

A change that breaks a critical rule must cause an automated test to fail before the issue is fixed.

---

# 12. CI/CD

## Objective

Turn the repository into a reproducible validation and deployment pipeline.

### Pull Request checks

- [ ] Format.
- [ ] Lint.
- [ ] Unit tests.
- [ ] Integration tests.
- [ ] Build.
- [ ] CDK synth.
- [ ] CDK diff where appropriate.
- [ ] Type checking.

### Deployment

- [ ] Development/staging environment.
- [ ] Production environment.
- [ ] Environment-specific configuration.
- [ ] External secrets.
- [ ] Reproducible deployment.
- [ ] Documented rollback.
- [ ] GitHub Actions configured.
- [ ] GitHub → AWS through OIDC/short-lived credentials where appropriate.
- [ ] No AWS access keys stored in the repository.

### You should understand

CI/CD does not simply mean "deploy automatically".

You should be able to explain:

- what CI validates;
- what CD changes;
- which identity GitHub Actions uses;
- which permissions it has;
- how credentials are protected;
- how a bad deployment is detected;
- how to return to a previous version.

### Evidence

A PR that breaks tests or CDK synth is automatically blocked. A valid change can reach the appropriate environment without undocumented manual intervention.

---

# 13. Reliability / Failure Lab

## Objective

This is where the project moves from tutorial to engineering laboratory.

Do not implement only happy paths. Deliberately introduce failures.

### Experiments

- [ ] Lambda failure.
- [ ] SQS consumer failure.
- [ ] Message reaches DLQ.
- [ ] Duplicate message.
- [ ] Duplicate validation.
- [ ] Race condition during expiration.
- [ ] API throttling.
- [ ] Invalid JWT.
- [ ] DynamoDB conditional write failure.
- [ ] Worker failure after partially completing work.
- [ ] External dependency unavailable.

### Document each experiment as

**Failure → Detection → Impact → Recovery → Prevention**

### You should understand

A reliable system is not one where nothing fails.

It is one where:

1. failures are anticipated;
2. impact is limited;
3. the system can detect them;
4. recovery is possible;
5. the same failure does not repeat indefinitely.

### Evidence

Each experiment should record:

- initial condition;
- injected failure;
- symptom;
- observed metric/log/alarm;
- recovery;
- preventive change.

---

# 14. Cost Engineering

## Objective

Learn to treat cost as a technical property.

### Checks

- [ ] Identify potential cost drivers for each service.
- [ ] Configure billing alerts.
- [ ] Document usage assumptions.
- [ ] Estimate monthly cost.
- [ ] Separate fixed and variable costs.
- [ ] Analyze DynamoDB capacity mode.
- [ ] Analyze Lambda invocations/duration.
- [ ] Analyze API Gateway.
- [ ] Analyze SQS.
- [ ] Analyze CloudFront/S3.
- [ ] Analyze CloudWatch logs/retention.
- [ ] Review cost as traffic increases.
- [ ] Document Free Tier assumptions.
- [ ] Do not assume "Free Tier" means zero cost in every scenario.

### You should understand

The question is not only:

> "How much does it cost today?"

It is:

> "Which variable causes the cost to increase?"

Examples:

- requests;
- duration;
- storage;
- data transfer;
- reads/writes;
- logs;
- messages;
- CDN distribution.

### Evidence

Given a traffic hypothesis, you can explain which system components would increase in cost and why.

---

# 15. Threat Model and Security Review

## Objective

Model threats before they become incidents.

### Checks

- [ ] Identify assets.
- [ ] Identify actors.
- [ ] Identify trust boundaries.
- [ ] Identify attack surfaces.
- [ ] Review authentication.
- [ ] Review authorization.
- [ ] Review public URLs.
- [ ] Review access codes.
- [ ] Review QR codes.
- [ ] Review API abuse.
- [ ] Review PII.
- [ ] Review logs.
- [ ] Document mitigations.

### Minimum actors

- Resident.
- Guard.
- Visitor.
- Administrator.
- External attacker.
- AWS workload.
- CI/CD pipeline.

### You should understand

For each threat, you should be able to answer:

- What resource am I protecting?
- Who could attack it?
- Which vector could they use?
- Which control blocks it?
- What happens if that control fails?
- How would I detect the incident?

### Evidence

You can review the architecture and identify at least one scenario where a naive implementation would expose information that should remain protected.

---

# 16. Mobile Phase 2

## Objective

Add React Native/Expo only after the cloud platform can operate independently of the mobile client.

Mobile is a consumer of the platform, not the center of the cloud laboratory.

### Resident App

- [ ] Expo project.
- [ ] Cognito login.
- [ ] Token lifecycle.
- [ ] Create visit.
- [ ] Query visits.
- [ ] History.
- [ ] Share visit.
- [ ] Display QR when appropriate.
- [ ] Push notifications.

### Guard App

- [ ] Login.
- [ ] Scanner.
- [ ] Validation.
- [ ] Manual search.
- [ ] Approve/reject.
- [ ] Error handling.
- [ ] Minimum information before exact matching.

### Client/API

- [ ] API client.
- [ ] Token management.
- [ ] Error handling.
- [ ] Loading states.
- [ ] Retry behavior.
- [ ] Offline considerations.
- [ ] Push registration.

### You should understand

The mobile client should not contain critical authorization rules.

The API remains the source of truth.

The app can improve UX, cache data, or anticipate operations, but it must not become the place where permission to perform an operation is decided.

### Phase 2 entry criteria

Do not start Mobile Phase 2 until Phase 1 has:

- deployable infrastructure;
- operational API;
- security;
- persistence;
- events;
- observability;
- tests;
- CI/CD;
- a minimum failure lab.

---

# 17. Definition of Done per Capability

To avoid marking work complete prematurely, every cloud capability should pass this template.

## Capability

**Name:** _e.g. Visit validation_

### Build

- [ ] Code implemented.
- [ ] Infrastructure defined in CDK.
- [ ] Automated tests.
- [ ] Configuration documented.

### Understand

- [ ] I can explain the complete flow.
- [ ] I can explain why this architecture was chosen.
- [ ] I know reasonable alternatives.
- [ ] I know the trade-offs.
- [ ] I know the solution's limitations.

### Operate

- [ ] Useful logs exist.
- [ ] Relevant metrics exist.
- [ ] Alarms exist where appropriate.
- [ ] I can diagnose a failure.
- [ ] I can recover the system.
- [ ] Retry/duplicate behavior is defined.

### Security

- [ ] IAM least privilege.
- [ ] Correct authentication.
- [ ] Correct authorization.
- [ ] No secret exposure.
- [ ] No unnecessary PII exposure.
- [ ] Attack surfaces reviewed.

### Cost

- [ ] I know the main cost drivers.
- [ ] I have an estimate.
- [ ] I know what happens as traffic increases.

### Reproduce

- [ ] Infrastructure is defined in CDK.
- [ ] Deployment is automatable.
- [ ] No undocumented manual configuration is required.
- [ ] The capability can be rebuilt from the repository.

---

# 18. Global Tracking

## Phase 1 — Cloud Engineering

| Area | Weight |
|---|---:|
| Architecture & Design | 5% |
| AWS Foundation | 5% |
| CDK / IaC | 10% |
| IAM / Security | 10% |
| DynamoDB | 10% |
| Cognito / API Gateway | 10% |
| Visit Domain | 5% |
| Async / Events | 10% |
| Visitor Web | 5% |
| Observability | 10% |
| Testing | 5% |
| CI/CD | 10% |
| Reliability / Failure Lab | 5% |
| Cost Engineering | 5% |
| **Total** | **100%** |

> Threat Modeling is treated as a cross-cutting Security review rather than an additional percentage.

## Build / Understand / Operate / Reproduce view

Use this table as a progress summary:

| Capability | Build | Understand | Operate | Reproduce |
|---|---|---|---|---|
| CDK foundation | [ ] | [ ] | [ ] | [ ] |
| IAM roles | [ ] | [ ] | [ ] | [ ] |
| DynamoDB access patterns | [ ] | [ ] | [ ] | [ ] |
| Cognito | [ ] | [ ] | [ ] | [ ] |
| API Gateway | [ ] | [ ] | [ ] | [ ] |
| Visit lifecycle | [ ] | [ ] | [ ] | [ ] |
| SQS + DLQ | [ ] | [ ] | [ ] | [ ] |
| Scheduler | [ ] | [ ] | [ ] | [ ] |
| S3 + CloudFront | [ ] | [ ] | [ ] | [ ] |
| Observability | [ ] | [ ] | [ ] | [ ] |
| Testing | [ ] | [ ] | [ ] | [ ] |
| CI/CD | [ ] | [ ] | [ ] | [ ] |
| Failure Lab | [ ] | [ ] | [ ] | [ ] |
| Cost Engineering | [ ] | [ ] | [ ] | [ ] |

---

# 19. Practical Progress Rule

Do not measure progress only by features.

A feature such as "create visit" may represent little learning if it is only:

`POST → Lambda → DynamoDB → 200`

The same capability represents substantially more engineering learning when it also includes:

`API → Auth → IAM → Validation → DynamoDB access pattern → Conditional write → Logs → Metrics → Tests → Failure handling → CDK → CI/CD → Cost`

That is the standard for this project.

## The project is progressing when you can move from:

**"I know how to build it."**

to

**"I know why it is designed this way."**

to

**"I know what happens when it fails."**

to

**"I can detect and recover from it."**

to

**"I can reproduce it automatically."**

That final level is the primary goal of the laboratory.
