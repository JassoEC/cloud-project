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
| 1.1 First Lambda | **IN PROGRESS** | — |

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

**Status:** 🟡 IN PROGRESS  
**Score:** —

**Current progress**

The learner has started Task 1.1 and is currently learning the IAM role model required by Lambda before creating the function.

**Concepts demonstrated so far**

- Distinguished a Lambda **execution role** from the learner's IAM user.
- Understood that the role gives the Lambda function permissions to act against other AWS services.
- Understood that the role is assumed by Lambda rather than using the learner's CLI credentials.
- Identified the two separate IAM concerns:
  - **Trust policy:** who can assume the role.
  - **Permission policies:** what the assumed role can do.
- Recognized the principle of least privilege: the Lambda role should receive only the permissions needed by the function.

**Important clarification**

A Lambda execution role is not what makes the function invokable. It defines the permissions available to the function while it executes.

**Pending evidence**

The learner still needs to:

- Create the first Lambda function.
- Configure its execution role.
- Invoke/test it.
- Verify the execution result.
- Locate and inspect its CloudWatch logs.
- Explain the execution role and invocation flow in their own words.

**Reviewer decision:** 1.1 remains in progress; no score assigned until the task evidence is submitted.
