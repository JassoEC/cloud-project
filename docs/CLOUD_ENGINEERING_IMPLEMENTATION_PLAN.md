# Cloud Engineering Implementation Checklist

This document is the step-by-step implementation checklist for Proyecto Transversal.

Use it together with [CLOUD_ENGINEERING_TRACKING.md](./CLOUD_ENGINEERING_TRACKING.md):

- `CLOUD_ENGINEERING_TRACKING.md` defines **what capability must be demonstrated**.
- This document defines **the implementation order and the checks we review together**.
- ADRs explain important architectural decisions.
- Failure-lab records explain how the system behaves under failure.
- Runbooks explain how an operator diagnoses and recovers.
- CI/CD workflows provide reproducible delivery evidence.

## How to use this checklist

A checkbox is not complete because the code exists.

For each check, review together:

- **Implemented** — the required code/infrastructure exists.
- **Verified** — the behavior was actually tested.
- **Understood** — the design and tradeoffs can be explained.
- **Operable** — failures can be detected and handled.
- **Reproducible** — the capability can be rebuilt from the repository.

Use this status notation when reviewing:

```text
[ ] Pending
[x] Verified
[~] Implemented but evidence/review is still missing
```

Do not mark a capability complete until the relevant checks and evidence have been reviewed.

---

# Phase 1 — Cloud and Backend

## 1. Engineering baseline

### Repository and tooling

- [ ] Repository structure is intentional and documented.
- [ ] Node.js version is pinned or otherwise reproducible.
- [ ] TypeScript configuration is reproducible.
- [ ] Package manager and lockfile are defined.
- [ ] Formatting command exists.
- [ ] Linting command exists.
- [ ] Type-check command exists.
- [ ] Unit-test command exists.
- [ ] Integration-test command exists.
- [ ] Build command exists.
- [ ] CDK synth command exists.
- [ ] Required local tools are documented.
- [ ] No AWS credentials or secrets are committed.

### Review together

- [ ] A clean checkout can install dependencies.
- [ ] A clean checkout can run the complete local validation suite.
- [ ] The CDK application can load without requiring undocumented local configuration.

**Evidence:** scripts, configuration files, clean-checkout test.

---

## 2. AWS account foundation

### Account safety

- [ ] Root account MFA is enabled.
- [ ] Normal development does not use the root account.
- [ ] The intended AWS identity can be verified with `aws sts get-caller-identity`.
- [ ] Primary AWS region is documented.
- [ ] Development/staging/production environment strategy is documented.
- [ ] Billing visibility is configured.
- [ ] Cost alerts/budgets appropriate for the project are configured.
- [ ] Disposable-resource cleanup procedure is defined.
- [ ] AWS account identifiers are not unnecessarily committed to source control.

### Review together

- [ ] We can explain which AWS identity is used for each operation.
- [ ] We can intentionally create and destroy a disposable resource.
- [ ] We know how to detect unexpected project spending.

**Evidence:** AWS configuration, CLI identity, billing controls, environment documentation.

---

## 3. CDK / Infrastructure as Code foundation

### Infrastructure

- [ ] CDK application is bootstrapped where required.
- [ ] Stack/environment boundaries are defined.
- [ ] Environment configuration is explicit.
- [ ] Resource naming convention exists.
- [ ] Resource tags are defined.
- [ ] Outputs are defined where useful.
- [ ] Removal policies are intentional.
- [ ] `cdk synth` succeeds.
- [ ] Generated CloudFormation has been inspected.
- [ ] `cdk diff` is understood before deployment.
- [ ] Deployment is possible from the repository.
- [ ] Destruction behavior is understood for disposable environments.

### Review together

- [ ] We can explain what CDK creates.
- [ ] We can identify resources that must survive stack deletion.
- [ ] We can identify resources that are safe to destroy.
- [ ] We can reproduce the infrastructure without manual console configuration.

**Evidence:** CDK code, synthesized template, deployment/destroy test.

---

## 4. IAM and security foundation

### Workload identities

- [ ] API/business Lambda has its own runtime permissions.
- [ ] Public visitor workload has only required permissions.
- [ ] Expiration workload has only required permissions.
- [ ] Notification worker has only required permissions.
- [ ] Deployment identity is separate from runtime identities.
- [ ] Runtime workloads do not use `AdministratorAccess`.
- [ ] Wildcard actions are avoided where practical.
- [ ] Wildcard resources are avoided where practical.
- [ ] CI/CD does not require long-lived AWS access keys.
- [ ] Secrets are not embedded in source code or infrastructure definitions.

### Review each role

- [ ] We know who assumes the role.
- [ ] We know every AWS action it can perform.
- [ ] We know every resource it can access.
- [ ] We have considered the impact of role compromise.
- [ ] We have tested at least one meaningful denied operation.

**Evidence:** CDK IAM definitions, policy review, authorization tests.

---

## 5. DynamoDB access-pattern design

### Access patterns

- [ ] Get visit by access code is defined.
- [ ] List resident visits is defined.
- [ ] Find expected visits by time window is defined.
- [ ] Search visitor by name/unit is defined.
- [ ] Find resident by condominium/unit is defined.
- [ ] Find guard by condominium is defined.
- [ ] Validate visit is defined.
- [ ] Expire visit is defined.
- [ ] Validation/history retrieval is defined where required.

### Physical model

- [ ] Every access pattern maps to a concrete DynamoDB operation.
- [ ] Partition keys are intentional.
- [ ] Sort keys are intentional.
- [ ] GSIs are justified by access patterns.
- [ ] Cardinality is understood.
- [ ] Consistency requirements are understood.
- [ ] Pagination behavior is defined.
- [ ] Query vs. scan behavior is understood.
- [ ] Conditional writes are used where state integrity requires them.
- [ ] Transaction requirements are identified.
- [ ] Idempotency requirements are identified.
- [ ] Expected read/write cost is understood.
- [ ] Authorization boundaries are reflected in the data-access design.

### Review together

- [ ] We can explain why every table/index exists.
- [ ] We can explain what happens as traffic grows.
- [ ] We can identify any query that could accidentally become an unbounded scan.

**Evidence:** access-pattern table, CDK model, integration tests, ADR.

---

## 6. Cognito and API Gateway

### Authentication

- [ ] Cognito user pool is defined.
- [ ] Registration flow is defined.
- [ ] Authentication flow is tested.
- [ ] Invalid credentials are handled safely.
- [ ] Token validation is enforced at the API boundary.
- [ ] Token claims used for authorization are understood.

### API

- [ ] `POST /auth/register` is defined.
- [ ] `POST /visits` is defined.
- [ ] `GET /visits` is defined.
- [ ] `DELETE /visits/:id` is defined.
- [ ] `POST /visits/validate` is defined.
- [ ] `GET /visits/expected` is defined.
- [ ] `POST /visits/search` is defined.
- [ ] `GET /public/visits/:code` is defined.
- [ ] Authenticated and public routes are explicitly separated.
- [ ] CORS behavior is intentional.
- [ ] API throttling/rate limiting strategy is defined.
- [ ] API error responses are consistent.
- [ ] Sensitive information is not returned unnecessarily.

### Authorization review

- [ ] Resident can access only permitted visits.
- [ ] Guard can access only permitted condominium data.
- [ ] Administrator scope is explicit.
- [ ] Public visitor receives only minimum required information.
- [ ] Cross-resident access test exists.
- [ ] Cross-condominium access test exists.

**Evidence:** Cognito/CDK configuration, API tests, authorization tests.

---

## 7. Visit domain and state machine

### Domain

- [ ] Visit creation is implemented.
- [ ] Access-code generation is implemented.
- [ ] Expected visit time is stored.
- [ ] Expiration time is stored.
- [ ] Ownership rules are implemented.
- [ ] Cancellation is implemented.
- [ ] Terminal states are enforced.

### State transitions

- [ ] `PENDING -> VALIDATED` is valid.
- [ ] `PENDING -> REJECTED` is valid.
- [ ] `PENDING -> CANCELLED` is valid.
- [ ] `PENDING -> EXPIRED` is valid.
- [ ] Invalid state transitions are rejected.
- [ ] Terminal states cannot be modified incorrectly.
- [ ] Boundary conditions around expected/expiration time are tested.

### Review together

- [ ] We can explain every state.
- [ ] We can explain who is allowed to trigger every transition.
- [ ] We can explain what happens when two operations target the same visit.

**Evidence:** domain code, unit tests, integration tests, state documentation.

---

## 8. Public visitor flow

### Visitor endpoint

- [ ] Valid access code returns the intended minimum information.
- [ ] Invalid access code is handled safely.
- [ ] Expired access code is handled safely.
- [ ] Malformed access code is handled safely.
- [ ] Public response contains no secrets.
- [ ] Public response contains no unnecessary PII.
- [ ] Internal identifiers are not exposed unnecessarily.
- [ ] Access code has sufficient unpredictability.
- [ ] Public endpoint abuse protection is defined.

### Visitor web

- [ ] Static assets are deployed to S3.
- [ ] CloudFront distribution is defined.
- [ ] HTTPS is enabled.
- [ ] Cache behavior is intentional.
- [ ] QR code is displayed correctly.
- [ ] Invalid/expired states are user-visible.
- [ ] Basic responsive behavior is verified.

### Review together

- [ ] We can explain why the access code acts as a bearer capability.
- [ ] We can explain what an attacker can do with a leaked code.
- [ ] We can explain what information remains protected even with a leaked code.

**Evidence:** public API tests, S3/CloudFront deployment, security review.

---

## 9. Concurrency-safe visit validation

### Validation

- [ ] Guard authorization is verified.
- [ ] Visit eligibility is verified.
- [ ] State transition is atomic.
- [ ] Conditional write or transaction is used where required.
- [ ] Duplicate validation cannot corrupt state.
- [ ] Repeated validation has deterministic behavior.
- [ ] Validation record creation is consistent with the chosen design.
- [ ] Validation/expiration race is handled safely.

### Review together

- [ ] Two validation requests sent nearly simultaneously have a defined outcome.
- [ ] We have an automated test for repeated/concurrent validation.
- [ ] We can explain the DynamoDB consistency mechanism being used.

**Evidence:** conditional expression/transaction, concurrency test, failure behavior documentation.

---

## 10. SQS, worker, and DLQ

### Queue architecture

- [ ] Validation does not depend on notification delivery completing synchronously.
- [ ] SQS queue exists through CDK.
- [ ] Visibility timeout is intentional.
- [ ] Retry behavior is intentional.
- [ ] DLQ exists.
- [ ] Redrive behavior is understood.
- [ ] Worker has least-privilege permissions.
- [ ] Worker is idempotent.
- [ ] Message schema is explicit.
- [ ] Malformed messages have defined behavior.

### Failure checks

- [ ] Worker failure causes retry.
- [ ] Repeated failure eventually reaches DLQ.
- [ ] Duplicate message does not create duplicate side effects.
- [ ] Transient provider failure is retried.
- [ ] Permanent failure is handled without infinite retry.
- [ ] DLQ produces an observable signal.
- [ ] Redrive procedure is documented.

### Review together

- [ ] We can explain at-least-once delivery implications.
- [ ] We can explain why the worker must be idempotent.
- [ ] We can recover a failed message.

**Evidence:** SQS/DLQ CDK, worker tests, failure experiment, runbook.

---

## 11. EventBridge Scheduler and expiration

### Scheduling

- [ ] One-time schedule is created for each expiration.
- [ ] Schedule target is explicit.
- [ ] Schedule execution permissions are least privilege.
- [ ] Expiration operation verifies current state.
- [ ] Expiration uses an atomic/conditional transition where required.
- [ ] Delayed execution is safe.
- [ ] Duplicate execution is safe.
- [ ] Validated visits are not incorrectly expired.
- [ ] Cancelled/rejected visits are not incorrectly expired.
- [ ] Schedule cleanup is defined.
- [ ] Schedule failures are observable.

### Review together

- [ ] We can explain why Scheduler is used instead of application polling.
- [ ] We can explain why DynamoDB TTL is not being used as the business-state transition mechanism.
- [ ] We can explain what happens if expiration runs late.

**Evidence:** Scheduler CDK, expiration Lambda, race tests, failure experiment.

---

## 12. Observability

### Logging

- [ ] Logs are structured JSON.
- [ ] Request ID is available.
- [ ] Correlation ID is available where needed.
- [ ] Operation ID is available where useful.
- [ ] Function/workload identity is available.
- [ ] Outcome is recorded.
- [ ] Duration is recorded where relevant.
- [ ] Error category is recorded.
- [ ] Credentials are never logged.
- [ ] Tokens are never logged.
- [ ] Secrets are never logged.
- [ ] Unnecessary PII is not logged.

### Metrics

- [ ] Visits created metric exists.
- [ ] Visits validated metric exists.
- [ ] Visits rejected metric exists.
- [ ] Visits expired metric exists.
- [ ] Validation latency is measurable.
- [ ] API latency is measurable.
- [ ] API 5xx is measurable.
- [ ] Lambda errors are measurable.
- [ ] Lambda duration is measurable.
- [ ] Lambda throttles are measurable.
- [ ] SQS processing failures are measurable.
- [ ] DLQ messages are measurable.

### Operations

- [ ] Technical dashboard exists.
- [ ] Business dashboard exists where useful.
- [ ] Actionable alarms exist.
- [ ] Alarm thresholds are intentional.
- [ ] Alarm behavior has been tested.

### Review together

- [ ] We can investigate a failed request from logs.
- [ ] We can connect related operations using correlation information.
- [ ] We can distinguish technical failure from expected business rejection.
- [ ] We can identify when the system recovered.

**Evidence:** logs, metrics, dashboards, alarms, incident investigation.

---

## 13. Automated testing

### Unit

- [ ] Domain rules are tested.
- [ ] State transitions are tested.
- [ ] Access-code generation is tested.
- [ ] Authorization decisions are tested.
- [ ] Validation rules are tested.

### Integration

- [ ] DynamoDB persistence is tested.
- [ ] Conditional writes are tested.
- [ ] SQS behavior is tested.
- [ ] Worker processing is tested.
- [ ] Relevant Cognito/API behavior is tested.

### End-to-end

- [ ] Resident creates visit.
- [ ] Visitor opens public URL.
- [ ] Guard validates visit.
- [ ] Notification is queued.
- [ ] Worker processes notification.
- [ ] Expiration occurs when applicable.

### Security

- [ ] Invalid JWT is rejected.
- [ ] Cross-resident access is rejected.
- [ ] Cross-condominium access is rejected.
- [ ] Invalid public code is handled.
- [ ] Expired public code is handled.
- [ ] Duplicate validation is safe.
- [ ] Concurrent validation is safe.

### AWS compatibility

- [ ] LocalStack is used only where useful.
- [ ] Important AWS-specific behavior is tested against real AWS.
- [ ] Tests do not create false confidence by mocking every AWS behavior.

**Evidence:** test suites, CI results, coverage, AWS staging validation.

---

## 14. CI/CD

### Pull request validation

- [ ] Formatting check runs.
- [ ] Lint runs.
- [ ] Type check runs.
- [ ] Unit tests run.
- [ ] Integration tests run where appropriate.
- [ ] Build runs.
- [ ] CDK synth runs.

### Deployment

- [ ] CI/CD authenticates using short-lived AWS credentials.
- [ ] GitHub Actions OIDC is used where appropriate.
- [ ] Deployment permissions are separated from runtime permissions.
- [ ] Environment selection is explicit.
- [ ] Infrastructure is synthesized during deployment.
- [ ] Deployment outputs are captured.
- [ ] Post-deployment validation exists.
- [ ] Rollback procedure is documented.
- [ ] No AWS access keys are stored in the repository.

### Review together

- [ ] A new environment can be created without hidden manual configuration.
- [ ] We can identify exactly which Git commit produced a deployment.
- [ ] We can recover from a failed deployment.

**Evidence:** workflows, OIDC configuration, deployment logs, rollback test.

---

## 15. Failure laboratory

For each experiment, do not mark the check complete until we can answer:

**Failure → Detection → Impact → Recovery → Prevention**

### Experiments

- [ ] Lambda execution failure.
- [ ] SQS consumer failure.
- [ ] DLQ routing.
- [ ] Duplicate SQS message.
- [ ] Duplicate visit validation.
- [ ] Validation/expiration race.
- [ ] API throttling.
- [ ] Invalid JWT.
- [ ] DynamoDB conditional-write failure.
- [ ] Partial notification failure.
- [ ] External notification dependency unavailable.

### Review together

For every experiment:

- [ ] Failure was intentionally reproduced.
- [ ] Failure was observable.
- [ ] Impact was understood.
- [ ] Recovery was performed.
- [ ] Prevention or mitigation was identified.
- [ ] Evidence was recorded.
- [ ] Architecture was changed if the experiment exposed a design flaw.

**Evidence:** failure-lab records, CloudWatch evidence, runbooks, tests.

---

## 16. Threat model and security review

### Threat model

- [ ] Assets are identified.
- [ ] Actors are identified.
- [ ] Trust boundaries are identified.
- [ ] Public attack surfaces are identified.
- [ ] Authentication boundaries are identified.
- [ ] Authorization boundaries are identified.
- [ ] Access-code abuse is considered.
- [ ] QR-code abuse is considered.
- [ ] API abuse is considered.
- [ ] PII exposure is considered.
- [ ] Log exposure is considered.
- [ ] CI/CD permissions are reviewed.
- [ ] AWS credential exposure is reviewed.
- [ ] Dependency risks are considered.

### Review together

- [ ] Every important threat has a mitigation.
- [ ] Detection is defined where appropriate.
- [ ] Residual risk is documented.
- [ ] Security assumptions are reflected in tests.

**Evidence:** threat model, IAM review, security tests, ADRs.

---

## 17. Cost engineering

### Service review

- [ ] DynamoDB cost drivers are understood.
- [ ] Lambda cost drivers are understood.
- [ ] API Gateway cost drivers are understood.
- [ ] SQS cost drivers are understood.
- [ ] S3 cost drivers are understood.
- [ ] CloudFront cost drivers are understood.
- [ ] CloudWatch log costs are understood.
- [ ] Notification delivery costs are understood.
- [ ] Environment-specific costs are understood.
- [ ] Scaling assumptions are documented.
- [ ] Logging retention is intentional.
- [ ] Current AWS pricing assumptions are verified when making real decisions.
- [ ] Free Tier assumptions are not treated as permanent guarantees.

### Review together

- [ ] We can explain what would make the project more expensive.
- [ ] We can identify the first likely cost drivers at higher traffic.
- [ ] We can explain relevant architectural cost tradeoffs.

**Evidence:** cost notes, billing alerts, Cost Explorer observations, scaling scenarios.

---

# Phase 1 Release Gate

Do not start React Native Phase 2 until all applicable checks below have been reviewed.

## Infrastructure

- [ ] Infrastructure is deployable from CDK.
- [ ] Infrastructure can be reproduced from the repository.
- [ ] Environment configuration is explicit.
- [ ] Destruction behavior is understood.

## Security

- [ ] Authentication works.
- [ ] Authorization boundaries are tested.
- [ ] IAM follows least privilege.
- [ ] Public endpoint exposes minimum information.
- [ ] Secrets are protected.
- [ ] Threat model has been reviewed.

## Backend

- [ ] DynamoDB access patterns are implemented.
- [ ] Visit lifecycle is implemented.
- [ ] Validation is concurrency-safe.
- [ ] Expiration is concurrency-safe.
- [ ] Notifications are asynchronous.
- [ ] Retry/DLQ behavior works.

## Operations

- [ ] Structured logging works.
- [ ] Metrics exist.
- [ ] Dashboards exist where appropriate.
- [ ] Alarms are actionable.
- [ ] Failure experiments have been executed.
- [ ] Recovery procedures are documented.

## Quality

- [ ] Unit tests pass.
- [ ] Integration tests pass.
- [ ] End-to-end path passes.
- [ ] Security tests pass.
- [ ] Important AWS-specific behavior has been tested on AWS.

## Delivery

- [ ] CI validates pull requests.
- [ ] CI/CD can deploy the system.
- [ ] Deployment uses short-lived credentials.
- [ ] Rollback procedure is documented.
- [ ] Deployment is traceable to a Git commit.

## Cost

- [ ] Main service cost drivers are understood.
- [ ] Billing controls exist.
- [ ] Scaling assumptions are documented.

### Final Phase 1 review

- [ ] Another engineer could clone the repository and understand the architecture.
- [ ] Another engineer could provision the infrastructure.
- [ ] Another engineer could deploy the system.
- [ ] Another engineer could exercise the main workflow.
- [ ] Another engineer could investigate a failure.
- [ ] Another engineer could explain the main security decisions.
- [ ] Another engineer could explain the main reliability decisions.
- [ ] Another engineer could explain the main cost drivers.

---

# Phase 2 — React Native / Expo

Phase 2 begins only after the Phase 1 release gate is satisfied.

## Resident application

- [ ] Cognito authentication is integrated.
- [ ] Token lifecycle is implemented.
- [ ] Visit creation is integrated.
- [ ] Visit listing is integrated.
- [ ] Visit history is integrated.
- [ ] Visit sharing is integrated.
- [ ] QR display is integrated.
- [ ] Push notification handling is integrated.
- [ ] API errors are handled.
- [ ] Loading states are handled.
- [ ] Retry behavior is defined.
- [ ] Offline behavior is intentionally defined.

## Guard application

- [ ] Cognito authentication is integrated.
- [ ] QR scanning is integrated.
- [ ] Visit validation is integrated.
- [ ] Manual visitor search is integrated.
- [ ] Approval/rejection flow is integrated.
- [ ] Safe error states are implemented.
- [ ] Minimum-information display is preserved.
- [ ] API errors are handled.
- [ ] Retry behavior is defined.
- [ ] Offline behavior is intentionally defined.

### Phase 2 review

- [ ] Mobile consumes the existing Phase 1 API.
- [ ] Mobile does not introduce unnecessary backend coupling.
- [ ] Client-side security assumptions are not used as server-side authorization.
- [ ] Cloud/backend observability remains sufficient to diagnose mobile-originated requests.

---

# Review rule

For every implementation step, use this sequence during review:

```text
1. Show the implementation.
2. Show the infrastructure.
3. Show the tests.
4. Show the security boundary.
5. Show the observability.
6. Reproduce the important failure case.
7. Explain the design decision.
8. Explain the tradeoff.
9. Confirm the evidence.
10. Mark the checklist.
```

A feature is not considered complete merely because its happy path works.

The goal is to reach:

```text
Implemented
    ↓
Understood
    ↓
Operable
    ↓
Reproducible
```

That final state is the actual completion criterion for the Cloud Engineering phase.
