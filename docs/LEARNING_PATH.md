# AWS Learning Path

> Canonical intent: [TRAINING_INTENT.md](./TRAINING_INTENT.md). This document turns that intent into the active learning sequence.

This document defines the active learning strategy for `cloud-project`.

The critical path is the **AWS Developer Core**. The Udemy DVA-C02 course provides breadth; this path selects where that breadth becomes hands-on evidence. Infrastructure topics such as EC2, Linux, networking, and containers remain supporting/contrast labs unless a task explicitly promotes them into the application.

It intentionally separates **current learning scope** from the project's eventual architecture.

## Operating rule

A service is not added to the project merely because it appears in the course or target architecture. It must either develop a relevant Developer capability or be better handled as a focused/contrast lab.

One milestone should be small enough to finish without turning cloud training into a second full-time project.

For each milestone:

1. Study the relevant AWS concept.
2. Build the smallest useful example.
3. Inspect the AWS resources created.
4. Break one important assumption or permission.
5. Diagnose the failure with AWS tooling.
6. Fix it.
7. Record the lesson.
8. Destroy or clean up anything that is no longer needed.

## Milestone sequence

| # | Focus | Core AWS services | Main question |
|---|---|---|---|
| 0 | Foundations | IAM, CloudWatch, Billing | Can I operate AWS safely? |
| 1 | Compute | Lambda | How does serverless execution actually work? |
| 2 | HTTP | API Gateway + Lambda | How does an API reach serverless compute? |
| 3 | Data | DynamoDB | How do access patterns shape NoSQL design? |
| 4 | Identity | Cognito + IAM | Who can perform each operation? |
| 5 | Storage | S3 + CloudFront | How do I store and serve static/public content safely? |
| 6 | Async | SQS | How do retries and failure isolation work? |
| 7 | Scheduling | EventBridge Scheduler | How do delayed state transitions work? |
| 8 | IaC | CDK | How do I reproduce what I built? |
| 9 | Operations | CloudWatch | How do I troubleshoot a running system? |
| 10 | Delivery | GitHub Actions | How do I automate a deployment I already understand? |

## Scope control

The following rules prevent scope creep:

- Do not implement a future AWS service just because it appears in the target architecture.
- Do not introduce a second frontend while backend/cloud concepts are still being learned.
- Do not add production infrastructure before the corresponding AWS concept has been practiced.
- Prefer a focused lab over adding another application feature.
- Prefer deleting resources after an experiment over keeping a large idle environment.
- When a milestone becomes too large, split it instead of expanding the definition of done.

## What counts as practical experience?

For the main path, target progressive depth: L1 Explain → L2 Build → L3 Integrate → L4 Diagnose. Core Developer capabilities should reach L3/L4 where appropriate. Supporting topics can intentionally stop at L1/L2.



For each service, the repository should eventually contain evidence of four things:

### 1. Build

A working example using the service.

### 2. Break

A deliberate failure that demonstrates an important behavior.

### 3. Diagnose

Evidence from logs, metrics, CLI output, or AWS configuration that explains the failure.

### 4. Explain

A short note describing:

- what the service does,
- why it is used here,
- the security boundary,
- the important cost consideration,
- what surprised me.

This is more valuable for the learning goal than maximizing feature count.

## Future architecture

The existing product architecture remains a useful destination:

```
API Gateway
  ├── Lambda
  │    └── DynamoDB
  ├── SQS → Lambda → notification provider
  └── Scheduler → Lambda → DynamoDB

Visitor web
  └── S3 + CloudFront

Cross-cutting
  └── IAM + CloudWatch + CDK + CI/CD
```

It should be implemented incrementally, only as each part becomes relevant to the learning path.

## Exercise classification

Each course topic is classified as one of:

- **Project** — integrated into `cloud-project` and backed by repository evidence.
- **Focus Lab** — isolated AWS experiment before integration or when integration is unnecessary.
- **Contrast Lab** — compare architectural alternatives such as Lambda vs EC2 vs containers.
- **Conceptual / Exam Practice** — study for breadth and DVA-C02 scenarios without adding project complexity.

## DVA study loop

For each course section:

```
Learn
  ↓
Lab
  ↓
Apply
  ↓
Break
  ↓
Fix
  ↓
Document
  ↓
Practice questions
```

The course remains the source of breadth. The repository provides depth through direct experimentation.
