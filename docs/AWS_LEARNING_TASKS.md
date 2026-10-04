# AWS Learning Task Checklist

## Purpose

This checklist is the linear execution plan for the AWS learning path.

The project is treated as a hands-on AWS learning lab, not as a product that must be completed all at once.

The active rule is:

> One task at a time. Build it, break it, diagnose it, explain it, clean it up, and only then move forward.

## Review protocol

ChatGPT acts as the reviewer for this learning path.

For every task:

1. The learner completes the task independently.
2. The learner reports the task as ready for review and provides evidence.
3. The reviewer checks the evidence against the acceptance criteria.
4. The task is marked **ACCEPTED** or **REJECTED**.
5. A rejected task must be corrected and reviewed again.
6. The next task does not start until the current task is accepted.

The reviewer should not solve the task for the learner. When a task is rejected, the reviewer explains what is missing or incorrect and what needs to be demonstrated, without simply providing the complete solution.

## Definition of done

A task is normally accepted only when the learner can demonstrate:

- **Build** — the AWS resource or integration was actually created and used.
- **Break** — a meaningful failure or invalid case was intentionally reproduced when applicable.
- **Diagnose** — the failure was located and its cause identified.
- **Explain** — the learner can explain what is happening and why.
- **Cost** — the learner knows the main cost consideration when applicable.
- **Cleanup** — disposable resources can be removed after the lab.

Not every criterion applies identically to every task, but the learning objective must be demonstrated rather than merely described.

---

# Phase 0 — Foundations

## 0.1 — Prepare the AWS sandbox

- [ ] Identify the AWS region used for training.
- [ ] Configure the AWS CLI.
- [ ] Verify the active AWS identity with STS.
- [ ] Understand account, region, credentials, and identity.
- [ ] Create a budget/cost alert.
- [ ] Document cleanup rules for disposable resources.

**Acceptance:** Explain how authentication works for the sandbox, which account/region is being used, and how costs will be controlled.

## 0.2 — IAM basics

- [ ] Understand User, Role, and Policy.
- [ ] Create/use a minimal policy.
- [ ] Create/use an IAM Role.
- [ ] Identify the permissions required by a service.
- [ ] Demonstrate an allowed action.
- [ ] Demonstrate a denied action.

**Acceptance:** Explain who can perform an action, what grants the permission, and why the permission exists.

---

# Phase 1 — Lambda

## 1.1 — First Lambda

- [x] Create a minimal Lambda.
- [x] Invoke it.
- [x] Pass an event.
- [x] Inspect the result.
- [x] Inspect CloudWatch Logs.
- [x] Remove the disposable resource.

**Acceptance:** Explain the problem Lambda solves and what happens from invocation to completion.

**Review:** ACCEPTED — 9/10. Demonstrated creation, invocation, execution role, CloudWatch logs, intentional failure, diagnosis, restoration, and verification.

## 1.2 — Lambda with application code

- [x] Add a Lambda to the repository.
- [x] Use a familiar runtime.
- [x] Receive JSON input.
- [x] Validate input.
- [x] Return a response.
- [x] Handle errors.
- [x] Produce useful logs.

**Acceptance:** The Lambda behaves as a small backend component rather than a Hello World example.

**Review:** ACCEPTED — 10/10. Demonstrated mock JSON input, validation, processing, structured JSON output, positive/negative tests, CloudWatch logs, and request ID correlation.

## 1.3 — Break and diagnose Lambda

- [x] Intentionally cause a Lambda failure.
- [x] Find the failure in CloudWatch.
- [x] Identify the root cause.
- [x] Fix it.
- [x] Verify the corrected execution.

**Acceptance:** Diagnose a failing Lambda without being given the location of the problem.

**Review:** ACCEPTED — 10/10. Demonstrated syntax failure, runtime failure, controlled validation failures, diagnosis from status/stack/logs, restoration, and final verification. Troubleshooting findings were documented in the lab README.

---

# Phase 2 — API Gateway

## 2.1 — HTTP to Lambda

- [x] Create an API Gateway endpoint.
- [x] Create a GET route.
- [x] Connect it to Lambda.
- [x] Invoke it through HTTP.
- [x] Inspect the logs.

**Acceptance:** Explain the flow:

HTTP request -> API Gateway -> Lambda -> HTTP response

**Review:** ACCEPTED — 10/10. Created an API Gateway HTTP API with `GET /visitors`, connected it to the existing Lambda through proxy integration, deployed and invoked it through the generated `execute-api` URL, verified query-string propagation, tested successful/missing/not-found cases, and correlated HTTP requests with Lambda Request IDs and CloudWatch Logs.
## 2.2 — First useful endpoint

Build a small endpoint related to the visitor-management domain, initially without DynamoDB.

Example:

GET /visitors

- [ ] Request handling.
- [ ] Lambda execution.
- [ ] JSON response.
- [ ] Appropriate status codes.
- [ ] Error handling.

**Acceptance:** The endpoint works end-to-end and its behavior can be explained.

## 2.3 — Break the API

- [ ] Cause a Lambda error.
- [ ] Send invalid input.
- [ ] Call a nonexistent endpoint.
- [ ] Inspect HTTP responses.
- [ ] Inspect logs.
- [ ] Diagnose and correct the failures.

**Acceptance:** Explain where each failure occurs and how it propagates to the client.

---

# Phase 3 — DynamoDB

## 3.1 — DynamoDB fundamentals

- [ ] Create a table.
- [ ] Define the partition key.
- [ ] Insert items.
- [ ] Read items.
- [ ] Query items.
- [ ] Delete items.
- [ ] Remove the table.

**Acceptance:** Explain the partition key and the basic access pattern being exercised.

## 3.2 — Lambda + DynamoDB

Build:

HTTP -> API Gateway -> Lambda -> DynamoDB

Implement a minimal visitor flow, for example:

- [ ] POST /visitors
- [ ] GET /visitors/{id}

**Acceptance:** Explain the complete request path and the responsibility of each service.

## 3.3 — DynamoDB failures

- [ ] Test a missing item.
- [ ] Test an incorrect key.
- [ ] Test insufficient IAM permissions.
- [ ] Compare Query and Scan.
- [ ] Inspect logs.
- [ ] Diagnose and correct failures.

**Acceptance:** Explain the observed behavior and why the selected access pattern is appropriate.

---

# Phase 4 — Cognito and security

## 4.1 — Cognito fundamentals

- [ ] Create a User Pool.
- [ ] Create a user.
- [ ] Authenticate.
- [ ] Obtain a token.
- [ ] Inspect the JWT.
- [ ] Explain the main token claims relevant to the API.

**Acceptance:** Explain what Cognito is doing and what the token represents.

## 4.2 — Protect the API

Move from:

User -> HTTP -> Lambda

to:

User -> Cognito -> API Gateway -> Lambda -> DynamoDB

- [ ] Require authentication.
- [ ] Verify authenticated requests.
- [ ] Test an unauthenticated request.
- [ ] Test an authenticated request.

**Acceptance:** Demonstrate and explain the authentication boundary.

## 4.3 — Least privilege

- [ ] Review the IAM permissions used so far.
- [ ] Remove unnecessary permissions.
- [ ] Test allowed access.
- [ ] Test denied access.

**Acceptance:** Explain why each remaining permission is required.

---

# Phase 5 — S3 and CloudFront

## 5.1 — S3 fundamentals

- [ ] Create a bucket.
- [ ] Upload an object.
- [ ] Read the object.
- [ ] Inspect permissions.
- [ ] Remove the disposable bucket/resources.

**Acceptance:** Explain object storage versus the database use cases already explored.

## 5.2 — Static delivery

- [ ] Serve a static application.
- [ ] Introduce CloudFront.
- [ ] Configure a distribution.
- [ ] Understand caching behavior.

**Acceptance:** Explain the role of S3 and CloudFront in the delivery path.

## 5.3 — S3 security

- [ ] Examine public versus private access.
- [ ] Identify an unsafe configuration.
- [ ] Correct it.
- [ ] Verify the resulting access behavior.

**Acceptance:** Explain the security boundary and why the corrected configuration is safer.

---

# Phase 6 — SQS

## 6.1 — Queue fundamentals

- [ ] Create a queue.
- [ ] Send a message.
- [ ] Receive a message.
- [ ] Delete a message.
- [ ] Observe message lifecycle.

**Acceptance:** Explain why a queue is useful compared with direct synchronous invocation.

## 6.2 — Lambda + SQS

Build:

API -> Lambda -> SQS -> Lambda -> DynamoDB

- [ ] Produce a message.
- [ ] Consume it with Lambda.
- [ ] Persist the resulting data.
- [ ] Inspect logs.

**Acceptance:** Explain the asynchronous flow and the responsibility of each component.

## 6.3 — Failure handling

- [ ] Make the consumer fail.
- [ ] Observe retry behavior.
- [ ] Understand visibility timeout.
- [ ] Configure/observe a DLQ.
- [ ] Recover from the failure.

**Acceptance:** Explain why the message was retried and what happens when processing continues to fail.

---

# Phase 7 — EventBridge Scheduler

- [ ] Create a scheduled invocation.
- [ ] Invoke a Lambda periodically.
- [ ] Record and inspect executions.
- [ ] Model a small visitor-expiration task.
- [ ] Distinguish scheduled execution from event-driven processing.

**Acceptance:** Explain when Scheduler is appropriate and how it differs from the event/queue patterns already learned.

---

# Phase 8 — CDK

## 8.1 — CDK fundamentals

- [ ] Configure CDK.
- [ ] Create a stack.
- [ ] Run cdk synth.
- [ ] Inspect generated CloudFormation.
- [ ] Run cdk deploy.
- [ ] Run cdk destroy.

**Acceptance:** Explain the relationship between CDK and CloudFormation.

## 8.2 — Recreate the backend with CDK

Recreate:

API Gateway -> Lambda -> DynamoDB

- [ ] Define resources in CDK.
- [ ] Define integrations.
- [ ] Define IAM permissions.
- [ ] Deploy.
- [ ] Verify behavior.
- [ ] Destroy the stack.

**Acceptance:** Explain what CDK created and which CloudFormation resources represent it.

## 8.3 — IAM with CDK

- [ ] Define roles.
- [ ] Define policies.
- [ ] Apply least privilege.
- [ ] Verify permissions.

**Acceptance:** Explain the permissions as infrastructure code rather than relying on manually configured permissions.

---

# Phase 9 — Observability and debugging

- [ ] Inspect CloudWatch Logs.
- [ ] Inspect metrics.
- [ ] Create an alarm.
- [ ] Add useful request/correlation identifiers.
- [ ] Diagnose Lambda failures.
- [ ] Diagnose API failures.
- [ ] Diagnose DynamoDB failures.
- [ ] Diagnose an end-to-end failure.

**Acceptance:** Given a broken request path, identify where it failed, why it failed, and what evidence supports the diagnosis.

---

# Phase 10 — CI/CD

Build:

GitHub -> GitHub Actions -> CDK -> AWS

- [ ] Create a pipeline.
- [ ] Run tests.
- [ ] Run cdk synth.
- [ ] Deploy through the pipeline.
- [ ] Configure required secrets/credentials securely.
- [ ] Use appropriate IAM permissions for deployment.
- [ ] Intentionally break the pipeline.
- [ ] Diagnose and correct it.
- [ ] Understand deployment recovery/rollback behavior.

**Acceptance:** Explain the complete path from repository change to AWS deployment and the security boundary of the deployment identity.

---

# Progress rule

The checklist is intentionally linear.

Do not skip ahead because a later service looks more interesting.

If a task becomes too large, split the task into smaller tasks rather than expanding its definition of done.

The goal is not to finish the architecture as quickly as possible. The goal is to accumulate demonstrated AWS understanding through progressively connected labs.

## Study loop

DVA course -> Lab -> Apply -> Break -> Diagnose -> Fix -> Document -> Practice questions

## Deferred scope

The following remain future work unless a learning task explicitly introduces them:

- Full production visitor lifecycle.
- Advanced DynamoDB access patterns and GSIs.
- Guard/resident production workflows.
- External notification providers.
- Production-grade expiration orchestration.
- Production observability hardening.
- Staging/production environments.
- Route53/ACM.
- Production GitHub Actions deployment architecture.
- React Native/mobile clients.
- Full threat-modeling and portfolio hardening.

These are not rejected ideas. They are deliberately deferred so that they do not interrupt the linear AWS learning path.
