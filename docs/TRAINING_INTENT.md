# Cloud Training Intent

## Purpose

This repository is a hands-on AWS Developer Associate training laboratory.

The objective is not to collect AWS services or to reproduce a production system for its own sake. The objective is to develop and demonstrate practical cloud-engineering capability by progressively building, securing, observing, deploying, breaking, diagnosing, and reproducing a distributed application on AWS.

The project uses three complementary sources of learning:

- **Udemy DVA-C02 course** — breadth of AWS Developer knowledge and exam-oriented study.
- **cloud-project** — depth through implementation, integration, evidence, and troubleshooting.
- **Focused exercises** — isolated practice for capabilities that are useful to understand before integrating them, or that are better learned as contrasts rather than permanent application components.

The target outcome is practical readiness for the **AWS Certified Developer – Associate (DVA-C02)** level, not specialization as a systems administrator, network engineer, or infrastructure administrator.

## Learning model

The training loop is:

```
Learn
  ↓
Build
  ↓
Apply
  ↓
Break
  ↓
Diagnose
  ↓
Fix
  ↓
Document
  ↓
Practice questions
```

The course supplies breadth. The repository supplies evidence and depth.

## What the project is optimizing for

The main path develops these developer capabilities:

1. AWS identity and secure operation.
2. HTTP/API development with serverless compute.
3. Data persistence and access-pattern-driven DynamoDB design.
4. Authentication and authorization.
5. Object storage and content delivery.
6. Asynchronous processing and event-driven integration.
7. Scheduling and state transitions.
8. Observability and operational troubleshooting.
9. Infrastructure as code.
10. Automated testing and CI/CD.
11. Reliability, failure handling, and recovery.
12. Cost and security awareness.
13. Architectural reasoning and trade-offs.

The application is the vehicle for integrating these capabilities; it is not the goal by itself.

## Tracks

### Track A — AWS Developer Core

This is the critical path.

It contains the capabilities that should reach meaningful hands-on depth and eventually be integrated into the application.

Typical depth target:

- **L1 — Explain:** understand the service/pattern and when to use it.
- **L2 — Build:** create a working example.
- **L3 — Integrate:** use it correctly in the application architecture.
- **L4 — Diagnose:** identify and recover from meaningful failures.

Core capabilities such as Lambda, API Gateway, IAM, DynamoDB, SQS/EventBridge, observability, and IaC should progressively reach L3/L4 where applicable.

### Track B — Cloud Infrastructure Literacy

This is a supporting track, not the critical path.

It covers:

- EC2;
- Linux;
- networking;
- Docker;
- ECS/Fargate;
- VPC fundamentals.

These topics exist to make infrastructure behavior understandable and to provide architectural contrasts. They should not delay the Developer path until a separate systems-administration curriculum is completed.

A focused EC2 exercise, for example, should answer questions such as:

> What does AWS manage for me when I use Lambda, and what would I have to manage myself on EC2?

The existing Linux learning plan may continue independently; only the Linux knowledge required to operate and troubleshoot the AWS exercises is part of the critical path.

### Track C — DVA Coverage

This track ensures that the breadth of the course is not confused with project scope.

For each relevant course section, classify the topic as:

- **Project:** requires integrated hands-on evidence.
- **Focus Lab:** deserves isolated practical experimentation.
- **Conceptual:** study and explain; no project integration required.
- **Exam Practice:** reinforce with questions/scenarios.

Not every AWS service in the course needs to become a permanent component of the application.

## Exercise model

Before starting an exercise, define:

1. **Developer capability** — what skill is being trained?
2. **Learning type** — Project, Focus Lab, or Contrast Lab.
3. **Course connection** — which Udemy topic provides the knowledge?
4. **Evidence** — what proves the capability was actually demonstrated?
5. **Depth target** — L1, L2, L3, or L4.
6. **Failure scenario** — what important assumption will be broken, when applicable?
7. **Cleanup** — what temporary resources must be removed?

An exercise is not justified merely because a service exists.

## Definition of practical completion

For a significant capability, completion means more than successful code.

The expected progression is:

### Build

The capability works.

### Understand

The learner can explain the flow, security boundary, trade-offs, and reasonable alternatives.

### Operate

The learner can observe, break, diagnose, and recover from meaningful failures.

### Reproduce

Infrastructure and deployment can recreate the capability from the repository without undocumented manual configuration.

The project should accumulate evidence across these dimensions rather than maximizing feature count.

## Main application progression

The current application should evolve incrementally:

```
HTTP → Lambda
      ↓
DynamoDB / S3
      ↓
Cognito / IAM
      ↓
SQS / EventBridge
      ↓
CloudWatch / operational troubleshooting
      ↓
CDK / CI-CD
      ↓
reliability / security / cost / failure exercises
      ↓
integrated production-style architecture
```

Future architecture is a destination, not a reason to implement services prematurely.

## Scope control

Do not:

- add an AWS service only because it appears in the target architecture;
- implement a second application when a focused lab is enough;
- delay the Developer path until Linux or networking are "finished";
- mark a capability complete because code exists without evidence;
- turn every Udemy topic into a permanent project dependency;
- retain disposable infrastructure merely because it was used for a lab.

Prefer:

- the smallest useful experiment;
- one capability at a time;
- deliberate failure and diagnosis;
- reproducible infrastructure;
- evidence attached to accepted tasks;
- architectural decisions documented when they matter.

## Relationship between repository documents

- `TRAINING_INTENT.md` — **why the training exists and how the pieces fit together.**
- `LEARNING_PATH.md` — **the active learning sequence.**
- `AWS_LEARNING_TASKS.md` — **the linear exercises and acceptance gates.**
- `AWS_LEARNING_PROGRESS.md` — **historical reviewed evidence and scores.**
- `CLOUD_ENGINEERING_TRACKING.md` — **capability-level progress.**
- `CLOUD_ENGINEERING_IMPLEMENTATION_PLAN.md` — **implementation checks and reproducibility.**
- `ENGINEERING_FOCUS.md` — **engineering scope and architectural principles.**
- `SPECIFICATIONS.md` — **application/domain requirements.**
- `docs/adr/` — **important architectural decisions.**

Historical progress should not be rewritten to make the new intent look cleaner. The new intent governs future work while preserving accepted evidence.

## Current position

The HTTP-to-Lambda capability is already accepted in the learning tracker.

The next main-path work should therefore build on that evidence rather than reproduce the same Lambda/API exercise. The project should progress toward persistence, security, asynchronous integration, observability, IaC, delivery, and failure-oriented operation.

## Success criterion

The project is successful when the learner can take a distributed AWS application and answer, with evidence:

- How is it built?
- Why is it designed this way?
- Who is allowed to do what?
- Where is the data and why is it modeled that way?
- Which work is synchronous or asynchronous and why?
- How is it observed?
- What happens when it fails?
- How is it recovered?
- How is the infrastructure reproduced?
- How is it delivered safely?
- What are the main security and cost trade-offs?

That is the intended bridge from existing software-engineering experience to AWS Developer Associate-level cloud engineering.
