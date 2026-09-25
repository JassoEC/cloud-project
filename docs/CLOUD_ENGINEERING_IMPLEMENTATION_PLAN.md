# Cloud Engineering Implementation Plan

This document is the execution path for implementing Proyecto Transversal as described in [CLOUD_ENGINEERING_TRACKING.md](./CLOUD_ENGINEERING_TRACKING.md).

The tracking guide answers **what capabilities must be demonstrated**. This document answers **in what order to implement them, what to verify, and what evidence to leave behind**.

The sequence is intentionally designed to build the cloud foundation before the product surface. Do not skip directly to application features because the domain is small; the purpose of the project is to practice production-oriented Cloud Engineering.

## 1. Define the engineering baseline

### Goal

Establish the repository, development conventions, AWS account boundary, and local toolchain before provisioning application resources.

### Implement

- Confirm the repository structure.
- Confirm TypeScript and Node.js versions.
- Define package scripts for:
  - formatting
  - linting
  - type checking
  - unit tests
  - integration tests
  - CDK synth
- Establish the CDK application entry point.
- Document required local tools.
- Define environment names such as `dev`, `staging`, and `prod`.
- Confirm that no AWS credentials or secrets are committed.

### Verify

Run the repository checks locally and confirm that the CDK application can load without deploying resources.

### Evidence

- Working repository scripts
- Initial CDK skeleton
- Documentation
- Clean Git history
- No committed credentials

### Tracking alignment

- Architecture and Design
- AWS Account Foundation
- CDK / Infrastructure as Code
- CI/CD

---

## 2. Establish the AWS account foundation

### Goal

Create a safe AWS foundation for experimentation and deployment.

### Implement

- Enable MFA on the root account.
- Create the required administrative/deployment identity.
- Configure the AWS CLI.
- Select and document the primary AWS region.
- Configure billing visibility and cost alerts.
- Confirm the active identity with:

```bash
aws sts get-caller-identity
```

- Document account and environment assumptions without committing sensitive identifiers.
- Establish a policy for destroying disposable resources created during experiments.

### Verify

The CLI identity is the expected identity and the development environment does not rely on the root account for normal engineering work.

### Evidence

- AWS account setup checklist
- Successful `sts get-caller-identity`
- Billing/cost controls
- Documented region and environment strategy

### Tracking alignment

- AWS Account Foundation
- Cost Engineering
- IAM / Security

---

## 3. Build the CDK foundation

### Goal

Make infrastructure reproducible before implementing application behavior.

### Implement

Create the initial CDK application and establish:

- CDK bootstrap requirements
- stack boundaries
- environment configuration
- resource naming conventions
- tags
- outputs
- removal policies appropriate for each environment
- synthesis and deployment scripts

Start with the minimum infrastructure required to prove the deployment path.

Run:

```bash
npm run build
npx cdk synth
```

Then inspect the generated CloudFormation instead of treating CDK as a black box.

### Verify

A clean environment can synthesize the infrastructure from the repository.

### Evidence

- CDK application
- Successful `cdk synth`
- Reviewed CloudFormation output
- Documented environment configuration

### Tracking alignment

- CDK / Infrastructure as Code
- Reproduce
- Cost Engineering

---

## 4. Design IAM before application code

### Goal

Define workload permissions before Lambda handlers begin accessing AWS services.

### Implement

Create separate IAM roles for each workload.

At minimum, distinguish:

- API/business Lambda permissions
- public visitor Lambda permissions
- expiration Lambda permissions
- notification worker permissions
- deployment permissions

Grant only the actions and resources required by each workload.

Avoid:

- `AdministratorAccess` for runtime workloads
- broad wildcard permissions when resource-level permissions are possible
- shared runtime roles with unrelated permissions
- long-lived AWS access keys in CI/CD

### Verify

For every role, answer:

1. Who assumes this role?
2. Which AWS actions can it perform?
3. Which resources can those actions access?
4. What happens if the role is compromised?

### Evidence

- IAM policies in CDK
- IAM review notes
- Negative authorization tests where practical
- ADR updates when an important tradeoff exists

### Tracking alignment

- IAM / Security
- Threat Model
- Reproduce

---

## 5. Model DynamoDB from access patterns

### Goal

Design persistence from the queries and state transitions the system actually needs.

### Implement

Write the access patterns before finalizing the table design.

The initial patterns include:

1. Get a visit by access code.
2. List visits for a resident.
3. Find expected visits for a time window.
4. Search by visitor name and unit.
5. Find residents by condominium and unit.
6. Find guards by condominium.
7. Validate a visit safely.
8. Expire a visit safely.
9. Retrieve validation/history information where required.

For each access pattern, define:

- partition key
- sort key
- GSI requirements
- cardinality
- consistency requirements
- pagination behavior
- expected read/write cost
- authorization boundary

Prefer a small number of purposeful tables and indexes over entity-driven table proliferation.

### Verify

Every required query can be mapped to a concrete DynamoDB operation without relying on an unbounded scan.

### Evidence

- Access-pattern document/table
- DynamoDB CDK definitions
- Repository/integration tests
- Capacity/cost reasoning
- ADR updates for non-obvious modeling decisions

### Tracking alignment

- DynamoDB and Access Patterns
- Cost Engineering
- Security

---

## 6. Implement authentication and API boundaries

### Goal

Create the authenticated API boundary before implementing business workflows.

### Implement

Provision:

- Cognito
- API Gateway REST API
- authenticated routes
- public visitor route
- CORS policy
- API throttling where appropriate

Establish the authorization model:

- residents can access their own visits
- guards can access visits within their condominium
- administrators have the documented administrative scope
- public visitors receive only the minimum information required

Initial API surface:

```text
POST /auth/register
POST /visits
GET /visits
DELETE /visits/:id
POST /visits/validate
GET /visits/expected
POST /visits/search
GET /public/visits/:code
```

### Verify

Test valid and invalid JWTs, authenticated route isolation, and public/private data boundaries.

### Evidence

- Cognito configuration
- API Gateway/CDK definitions
- Authorization tests
- API contract documentation

### Tracking alignment

- Cognito + API Gateway
- IAM / Security
- Threat Model

---

## 7. Implement the visit domain and state machine

### Goal

Implement the smallest meaningful business capability while preserving explicit state transitions.

### Implement

Create the visit lifecycle:

```text
PENDING -> VALIDATED
PENDING -> REJECTED
PENDING -> CANCELLED
PENDING -> EXPIRED
```

Define:

- visit creation
- access-code generation
- expected visit time
- expiration time
- ownership rules
- cancellation
- terminal-state behavior

Treat state transitions as domain rules rather than allowing arbitrary status updates.

### Verify

Test valid transitions, invalid transitions, authorization failures, duplicate operations, and boundary conditions around expected/expiration times.

### Evidence

- Domain implementation
- Unit tests
- Integration tests
- API tests
- State-transition documentation

### Tracking alignment

- Visit Domain and State Machine
- Testing
- Security

---

## 8. Implement the public visitor flow

### Goal

Allow a visitor to retrieve the minimum information associated with a valid access code.

### Implement

Create the public endpoint and static visitor web application.

Use:

- S3 for static assets
- CloudFront for delivery
- HTTPS
- cache policies appropriate to the content
- invalid/expired code handling
- QR generation/display

Treat the access code as a bearer capability.

Do not expose:

- resident credentials
- internal identifiers unless required
- unnecessary personal information
- secrets
- infrastructure configuration

### Verify

Test:

- valid code
- invalid code
- expired code
- malformed code
- repeated requests
- excessive request volume
- minimum-data response

### Evidence

- S3/CloudFront CDK
- Public endpoint tests
- Visitor web
- Security review of public payloads

### Tracking alignment

- Visitor Web
- Threat Model
- Security
- Cost Engineering

---

## 9. Implement guard validation as a concurrency-safe operation

### Goal

Make visit validation correct even when two requests arrive at nearly the same time.

### Implement

The validation operation must enforce the state transition atomically.

Use a conditional write or transaction so that:

- only a valid pending visit can become validated
- a second validation cannot incorrectly validate the same visit again
- the result of repeated validation is deterministic
- the guard is authorized for the condominium

Create the validation record as part of the consistency strategy where appropriate.

### Verify

Explicitly test concurrent or repeated validation attempts.

Do not consider the endpoint complete because a single happy-path request returns HTTP 200.

### Evidence

- Conditional expression/transaction
- Concurrency test
- Authorization test
- Documented failure behavior

### Tracking alignment

- DynamoDB
- Visit Domain
- Reliability / Failure Lab
- Testing

---

## 10. Introduce asynchronous notifications

### Goal

Separate visit validation from notification delivery.

### Implement

Build the flow:

```text
Validation API
      |
      v
     SQS
      |
      v
Notification Worker
      |
      v
SNS / Notification Provider
```

Configure:

- queue
- visibility timeout
- retry behavior
- dead-letter queue
- worker permissions
- idempotency strategy
- alarms for DLQ messages and processing failures

The API must not depend on successful notification delivery to complete validation.

### Verify

Simulate:

- worker failure
- transient provider failure
- duplicate message delivery
- malformed message
- DLQ routing
- message redrive

### Evidence

- SQS/DLQ CDK
- Worker implementation
- Integration tests
- Failure-lab experiment
- Recovery runbook

### Tracking alignment

- Asynchronous Architecture
- Reliability / Failure Lab
- Observability
- IAM

---

## 11. Implement scheduled expiration

### Goal

Move visit expiration from application polling into an event-driven mechanism.

### Implement

Use EventBridge Scheduler to create a one-time schedule for each visit expiration.

The expiration operation must:

- verify the visit is still eligible for expiration
- transition it atomically
- tolerate delayed execution
- tolerate duplicate execution
- avoid changing an already validated/cancelled/rejected visit
- clean up the one-time schedule

Do not create one permanent EventBridge rule per visit.

### Verify

Test:

- normal expiration
- already validated visit
- already cancelled visit
- delayed scheduler invocation
- duplicate invocation
- race between validation and expiration

### Evidence

- Scheduler CDK
- Expiration Lambda
- Conditional update
- Race-condition tests
- Failure-lab record

### Tracking alignment

- EventBridge Scheduler and Expiration
- DynamoDB
- Reliability
- Cost Engineering

---

## 12. Make observability part of every capability

### Goal

Make failures diagnosable before calling the system operational.

### Implement

Establish structured JSON logging with:

- request ID
- correlation ID
- operation ID
- workload/function name
- relevant user identifier where appropriate
- outcome
- duration
- error category

Never log:

- credentials
- tokens
- secrets
- unnecessary sensitive personal information

Create CloudWatch metrics for:

- visits created
- visits validated
- visits rejected
- visits expired
- validation latency
- API latency
- API 5xx
- Lambda errors
- Lambda duration
- Lambda throttles
- SQS processing failures
- DLQ messages

Create separate technical and business dashboards where useful.

### Verify

Trigger controlled failures and confirm that an operator can determine:

1. what failed
2. when it failed
3. which component failed
4. the affected operation
5. whether recovery occurred

### Evidence

- Structured logs
- Metrics
- Dashboards
- Alarms
- Example incident investigation

### Tracking alignment

- Observability and Operations
- Reliability
- Security

---

## 13. Build the automated test pyramid

### Goal

Validate behavior at the appropriate level instead of relying only on end-to-end tests.

### Implement

### Unit tests

Cover:

- domain rules
- state transitions
- access-code generation
- authorization decisions
- validation rules

### Integration tests

Cover:

- DynamoDB persistence
- conditional writes
- SQS
- worker processing
- Cognito/API integration where practical

### End-to-end tests

Exercise the complete path:

```text
Resident creates visit
        ↓
Visitor opens URL
        ↓
Guard validates
        ↓
Notification is queued
        ↓
Worker processes notification
        ↓
Visit expires when applicable
```

### Security tests

Cover:

- invalid JWT
- cross-resident access
- cross-condominium access
- invalid public code
- expired public code
- repeated validation
- concurrent validation

Use LocalStack where it provides useful development feedback, but validate important AWS-specific behavior on real AWS environments.

### Evidence

- Test suites
- CI test execution
- Coverage report
- AWS staging validation

### Tracking alignment

- Testing
- Security
- Reliability
- Reproduce

---

## 14. Automate CI/CD

### Goal

Make the infrastructure and application reproducible from Git.

### Implement

For pull requests, run at least:

```text
format check
lint
type check
unit tests
integration tests
build
CDK synth
```

For deployment:

1. authenticate to AWS using short-lived credentials
2. select the target environment
3. synthesize infrastructure
4. review/deploy the intended change
5. run post-deployment validation
6. expose deployment outputs
7. retain enough evidence to diagnose failures

Prefer GitHub Actions OIDC over long-lived AWS access keys.

Separate development, staging, and production deployment behavior.

### Verify

A new environment can be deployed without manually configuring hidden resources outside the repository.

### Evidence

- GitHub Actions workflows
- OIDC configuration
- Environment configuration
- Deployment logs
- Rollback procedure

### Tracking alignment

- CI/CD
- CDK / IaC
- IAM / Security
- Reproduce

---

## 15. Run the failure laboratory

### Goal

Demonstrate that the system is understood under failure, not only under normal operation.

### Execute controlled experiments

At minimum:

1. Lambda execution failure
2. SQS consumer failure
3. DLQ routing
4. duplicate SQS message
5. duplicate visit validation
6. validation/expiration race
7. API throttling
8. invalid JWT
9. DynamoDB conditional-write failure
10. partial notification failure
11. unavailable external notification dependency

For every experiment document:

```text
Failure
Detection
Impact
Recovery
Prevention
```

### Verify

Every important failure has an observable signal and a documented recovery path.

### Evidence

- Failure-lab records
- CloudWatch evidence
- Runbooks
- Tests
- Architecture updates where failures reveal design changes

### Tracking alignment

- Reliability / Failure Lab
- Observability
- Security
- Testing

---

## 16. Perform the security and threat-model review

### Goal

Review the complete system as an attack surface rather than reviewing security only at the authentication layer.

### Review

Identify:

- assets
- actors
- trust boundaries
- public endpoints
- authentication boundaries
- authorization boundaries
- access-code abuse
- QR-code abuse
- API abuse
- PII exposure
- log exposure
- CI/CD permissions
- AWS credential exposure
- dependency risks

Actors include:

- Resident
- Guard
- Visitor
- Administrator
- External attacker
- AWS workload
- CI/CD pipeline

For each relevant threat, document:

- attack path
- affected asset
- likelihood/impact considerations
- mitigation
- detection
- residual risk

### Evidence

- Threat model
- IAM review
- Public API review
- Security tests
- Updated ADRs where necessary

### Tracking alignment

- Threat Model and Security Review
- IAM / Security
- Observability
- CI/CD

---

## 17. Perform cost engineering

### Goal

Understand what drives cost before increasing traffic or infrastructure complexity.

### Review

For every AWS service, identify:

- fixed costs, if any
- variable usage costs
- primary cost driver
- scaling behavior
- logging/storage costs
- assumptions behind estimates
- environment-specific differences

Pay particular attention to:

- DynamoDB reads/writes
- Lambda invocation and duration
- API Gateway requests
- SQS requests
- CloudFront traffic
- S3 storage/requests
- CloudWatch logs and retention
- notification delivery

Do not treat Free Tier assumptions as permanent architecture guarantees. Verify current AWS pricing and account-specific eligibility when making real cost decisions.

### Evidence

- Cost assumptions
- Billing alerts
- AWS Cost Explorer observations
- Scaling scenarios
- Documented tradeoffs

### Tracking alignment

- Cost Engineering
- AWS Foundation
- Architecture and Design

---

## 18. Establish the Phase 1 release gate

Phase 1 is not complete when the visitor flow works.

Before starting the mobile phase, confirm that the system has:

- deployable infrastructure
- authenticated API
- authorization boundaries
- DynamoDB access-pattern design
- visit lifecycle
- public visitor flow
- concurrency-safe validation
- asynchronous notifications
- DLQ and retry behavior
- scheduled expiration
- structured observability
- tests
- CI/CD
- security review
- cost understanding
- documented failure experiments
- reproducible deployment

Use the tracking guide to record the evidence for each capability.

### Release question

> Can another engineer clone the repository, understand the architecture, provision the required infrastructure, deploy the system, exercise the main workflow, observe failures, and explain the security, reliability, and cost decisions?

If the answer is no, Phase 1 is still in progress.

---

## 19. Start Phase 2 only after the cloud foundation is operational

Phase 2 introduces the client applications.

### Resident application

Use React Native / Expo to implement:

- authentication
- visit creation
- visit listing
- visit history
- visit sharing
- QR display
- push notification handling

### Guard application

Implement:

- authentication
- QR scanning
- visit validation
- manual visitor search
- approve/reject interaction
- safe error states
- minimum-information display

### Client engineering concerns

Treat mobile as a client of the cloud system, not as a reason to redesign the backend.

Implement:

- API client
- token management
- error handling
- loading states
- retry behavior
- offline considerations
- push notification integration

The mobile phase should consume the Phase 1 API and infrastructure rather than becoming the center of the architecture.

---

# Recommended implementation cadence

Work in small vertical increments.

For each capability:

1. **Design** the access pattern and trust boundary.
2. **Implement** the smallest useful code path.
3. **Provision** its AWS infrastructure with CDK.
4. **Secure** the workload with least-privilege IAM.
5. **Test** normal and failure behavior.
6. **Instrument** logs, metrics, and alarms.
7. **Document** important decisions and operational behavior.
8. **Deploy** to the appropriate environment.
9. **Exercise** the capability under controlled failure.
10. **Record evidence** in the tracking guide.
11. Only then move to the next capability.

Avoid implementing the entire application first and adding cloud concerns afterward.

---

# Suggested commit/PR progression

A practical implementation sequence is:

```text
1. chore: bootstrap TypeScript and CDK foundation
2. feat: add AWS account and environment configuration
3. feat: provision IAM roles and deployment permissions
4. feat: provision DynamoDB access-pattern foundation
5. feat: add Cognito and API Gateway
6. feat: implement visit domain and lifecycle
7. feat: add public visitor endpoint and web delivery
8. feat: add concurrency-safe visit validation
9. feat: add SQS notification pipeline and DLQ
10. feat: add scheduled visit expiration
11. feat: add structured observability and alarms
12. test: add integration and end-to-end coverage
13. ci: add GitHub Actions deployment pipeline
14. test: add failure laboratory scenarios
15. docs: complete security and cost review
```

Each PR should ideally represent one coherent capability or infrastructure boundary. Keep changes small enough that architecture, security, tests, and operational behavior can be reviewed together.

---

# Completion model

A capability should progress through these states:

```text
Pending
   ↓
In Progress
   ↓
Implemented
   ↓
Understood
   ↓
Operable
   ↓
Reproducible
```

The final state is the target.

A capability that only reaches **Implemented** is functional.

A capability that reaches **Reproducible** is evidence of Cloud Engineering maturity.

---

# Relationship with the tracking guide

Use the two documents together:

| Document | Purpose |
|---|---|
| `CLOUD_ENGINEERING_TRACKING.md` | What must be demonstrated |
| `CLOUD_ENGINEERING_IMPLEMENTATION_PLAN.md` | How and in what order to implement it |
| ADRs | Why important architectural decisions were made |
| Failure-lab records | What happens when the system fails |
| Runbooks | How an operator diagnoses and recovers |
| CI/CD workflows | How the system is reproduced and deployed |

The implementation plan should evolve only when the architecture or learning sequence changes. The tracking guide remains the source of truth for capability completion.
