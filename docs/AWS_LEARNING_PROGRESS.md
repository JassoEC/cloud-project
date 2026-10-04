# AWS Learning Progress Tracker

This document records the learner's reviewed progress through the AWS learning path.

## Review protocol

- The learner completes the task independently.
- The learner provides evidence.
- The reviewer evaluates the evidence and response quality.
- The task is marked **ACCEPTED** or **REJECTED**.
- A rejected task is corrected and reviewed again before advancing.

Scores measure learning quality and are separate from the ACCEPTED/REJECTED gate.

## Scoring rubric

- **10/10** — Complete evidence, accurate explanation, strong security/cost awareness, and independent diagnosis where applicable.
- **8–9/10** — Accepted with minor omissions or small guidance needed.
- **6–7/10** — Partial understanding; significant guidance or evidence is still required.
- **0–5/10** — Task not yet demonstrated.

## Summary

| Task | Status | Score |
|---|---|---:|
| 0.1 Prepare the AWS sandbox | **ACCEPTED** | **9/10** |
| 0.2 IAM basics | **ACCEPTED** | **9/10** |
| 1.1 First Lambda | **ACCEPTED** | **9/10** |
| 1.2 Lambda with application code | **ACCEPTED** | **10/10** |
| 1.3 Break and diagnose Lambda | **ACCEPTED** | **10/10** |

## Detailed reviews

### 0.1 — Prepare the AWS sandbox

**Status:** 🟢 ACCEPTED  
**Score:** 9/10

**Evidence demonstrated**

- AWS CLI 2.37.5 installed and working on Ubuntu.
- AWS region verified as `mx-central-1`.
- STS confirmed the active IAM identity as `cloud-learning`.
- Monthly cost budget created with a $2 USD limit.
- Cleanup rules explicitly defined.

**Response quality**

Good final understanding after iteration. The learner initially omitted several evidence fields, then independently completed CLI/STS setup and articulated explicit cost-control rules.

**Strengths**

- Used an IAM user rather than root credentials for CLI access.
- Verified identity with STS instead of assuming configuration worked.
- Recognized the difference between a budget alert and cleanup responsibility.
- Defined explicit rules for ephemeral resources and documented-purpose exceptions.

**Improvement noted**

Terraform/IaC cleanup was mentioned as a future practice. It is not yet part of the current stack, so this was treated as a future intention rather than demonstrated evidence.

**Reviewer decision:** 0.1 accepted; 0.2 may begin.


### 0.2 — IAM Basics

**Status:** 🟢 ACCEPTED  
**Score:** 9/10

**Evidence demonstrated**

- Started with the `cloud-learning` group intentionally having no permissions.
- Executed `aws s3 ls` and captured the expected `AccessDenied`.
- Identified the required action: `s3:ListAllMyBuckets`.
- Initially tested `AmazonS3ReadOnlyAccess`, then recognized it was broader than necessary.
- Replaced the broad managed policy with a custom policy granting only `s3:ListAllMyBuckets`.
- Re-ran `aws s3 ls` successfully; an empty result was correctly interpreted as “no buckets exist,” not as a permission failure.

**Response quality**

The learner correctly explained that the absence of a group policy meant there was no identity-based policy allowing the requested S3 action. The learner also understood why the narrower policy better demonstrates least privilege.

**Key learning**

`s3:ListAllMyBuckets` answers the account-level question “which buckets exist?” It does not grant permission to inspect objects or bucket contents. Those operations require separate permissions such as `s3:ListBucket` and `s3:GetObject`.

Also clarified that `"Resource": "*"` is not being used because the account currently has no buckets. This action is account-level and uses `*` as its resource scope even when buckets exist.

**Improvement noted**

The first solution used `AmazonS3ReadOnlyAccess`, which was unnecessarily broad for the stated objective. Correcting it to a single required action demonstrated the intended least-privilege practice.

**Reviewer decision:** 0.2 accepted; 1.1 may begin.


### 1.1 — First Lambda

**Status:** 🟢 ACCEPTED  
**Score:** 9/10

**Evidence demonstrated**

- Created Lambda function `cloud-learning-first-lambda` using Node.js.
- Configured an IAM execution role for Lambda with the Lambda service as the trusted principal.
- Attached `AWSLambdaBasicExecutionRole` for basic CloudWatch Logs permissions.
- Executed the function successfully and received `statusCode: 200` with `Hello from Lambda!`.
- Observed execution logs including Request ID, duration, billed duration, configured memory, and maximum memory used.
- Intentionally introduced `throw new Error("Intentional learning error")` and observed `Status: Failed`.
- Diagnosed the failure as an application-code exception rather than an IAM permission failure.
- Used the stack trace to identify the failure location at `index.mjs:11:9`.
- Restored the function and verified `Status: Succeeded` again.

**Key learning**

The learner correctly connected the Lambda execution role model:

- The IAM Role is the identity Lambda can assume.
- The trust policy determines who can assume the role.
- Permission policies determine what the assumed role can do.
- STS provides the mechanism for temporary role sessions/credentials.
- Lambda manages the role assumption and temporary credentials internally.

The learner also distinguished the function's execution duration from the lifetime of the IAM Role itself.

**Cost awareness**

The learner observed Lambda's reported `Duration`, `Billed Duration`, `Memory Size`, and `Max Memory Used` values during testing.

**Improvement noted**

During diagnosis, the learner initially explained the error correctly but did not explicitly identify `index.mjs:11:9` or clearly separate the test response from the execution logs. After review, the distinction was clarified.

**Reviewer decision:** 1.1 accepted; 1.2 may begin.


### 1.2 — Lambda with application code

**Status:** 🟢 ACCEPTED  
**Score:** 10/10

**Evidence demonstrated**

- Built a Lambda application flow using a JSON test event as input.
- Defined explicit input validation for `name` and `phone`.
- Implemented structured validation errors with field, code, and message.
- Implemented a processing step that produces an ID from `context.awsRequestId` and an ISO timestamp.
- Returned structured JSON for both invalid and valid inputs.
- Tested a negative case with an empty object and correctly received two `REQUIRED` validation errors.
- Tested a positive case and verified `valid: true`, processed data, request ID correlation, and `receivedAt`.
- Verified application logs in CloudWatch without adding external AWS services.

**Response quality**

Excellent. The learner demonstrated the complete path from mock JSON event → validation → processing → JSON response and could explain the role of Lambda as a small backend component without HTTP or persistence.

**Reviewer note**

The stored GitHub commit initially contained a syntax typo in the handler declaration, while the deployed AWS code was correct. The review explicitly distinguished repository evidence from deployed runtime evidence rather than incorrectly treating the deployed function as broken.

**Reviewer decision:** 1.2 accepted; 1.3 may begin.

### 1.3 — Break and diagnose Lambda

**Status:** 🟢 ACCEPTED  
**Score:** 10/10

**Evidence demonstrated**

- Intentionally introduced a syntax error by omitting a comma and observed `Runtime.UserCodeSyntaxError`.
- Identified that the syntax failure occurred during module loading/compilation, before the handler could execute.
- Intentionally introduced a reference to an undefined variable (`evt`) and observed `ReferenceError: evt is not defined`.
- Used the stack trace to locate the failure inside `processVisit`.
- Tested incomplete input (`phone` missing) and correctly observed a controlled validation response with `Status: Succeeded`.
- Tested an invalid type (`phone: true`) and correctly observed `INVALID_TYPE` with `Status: Succeeded`.
- Restored the Lambda code and verified a successful execution with correlated request ID, response data, and CloudWatch log entry.
- Documented the troubleshooting lessons in the lab README.

**Response quality**

Excellent independent diagnosis. The learner distinguished syntax/load failures, runtime exceptions, and application-level validation errors instead of treating all failures as "Lambda errors." The learner also used execution status, stack traces, request IDs, and CloudWatch logs as separate pieces of evidence.

**Quality of exercise**

This exercise provided strong practical value because each failure was deliberately introduced, predicted, observed, diagnosed, corrected, and verified. It also exposed an important operational distinction: an invalid business input can produce a successful Lambda invocation, while a code/runtime failure can produce an actual function error.

**Reviewer decision:** 1.3 accepted; Phase 2 may begin.
