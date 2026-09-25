# AGENTS.md

## Repository purpose

This repository is a cloud engineering portfolio and learning project.

The application domain is residential visitor management, but the primary objective is to demonstrate production-oriented cloud engineering practices on AWS.

The project is intentionally evaluated as an engineering system, not only as an application feature set.

## Current project state

The repository is in the cloud/backend implementation phase.

Phase 1 focuses on AWS infrastructure, backend capabilities, security, reliability, observability, testing, CI/CD, and operational reproducibility.

Phase 2 adds React Native (Expo) clients after the cloud/backend foundation is operational.

Do not assume that a feature is complete because application code exists. Important capabilities must be reviewed against the cloud engineering tracking and implementation checklists.

## Documentation conventions

Repository documentation is written in English.

The language used to interact with the user follows the user's current language.

Relevant documentation includes:

- `README.md`: project purpose, architecture, service choices, trade-offs, and roadmap.
- `docs/ENGINEERING_FOCUS.md`: cloud engineering focus and learning objectives.
- `docs/CLOUD_ENGINEERING_TRACKING.md`: manual capability tracking and evidence model.
- `docs/CLOUD_ENGINEERING_IMPLEMENTATION_PLAN.md`: implementation and review checklist.
- `docs/DOCUMENTATION_GUIDELINES.md`: documentation conventions.
- `docs/adr/`: architecture decision records.
- `specs/`: feature specifications created through the SDD workflow.

Do not reintroduce obsolete documentation references or claim that repository documentation should be written in Spanish.

## Spec-driven development

This repository uses two explicit agent skills:

- `/spec`: clarify a feature and create a human-reviewed specification in `specs/`.
- `/spec-impl`: implement an approved specification step by step, with human review between steps.

The intended workflow is:

```text
/spec
  ↓
Draft specification
  ↓
Human review and approval
  ↓
/spec-impl
  ↓
Implementation step
  ↓
Diff review
  ↓
Optional human-approved commit
  ↓
Next implementation step
```

The SDD skills control feature definition and implementation flow. They do not replace architecture decisions, ADRs, tests, or cloud engineering verification.

## Cloud engineering verification

Cloud engineering compliance is deliberately manual.

Agents must use the tracking and implementation documents as review checklists, but must not automatically:

- mark roadmap items as complete;
- infer that a capability is `Verified`, `Understood`, `Operable`, or `Reproducible`;
- declare a capability complete solely because code or infrastructure exists;
- update progress percentages based on implementation activity.

When reviewing a capability, the agent should surface the relevant checks and evidence that still need human review.

The final determination is made during the engineering review with the user.

The target progression is:

```text
Implemented → Verified → Understood → Operable → Reproducible
```

## Planned and target stack

- Backend: TypeScript + NestJS, deployed to AWS Lambda behind API Gateway.
- Infrastructure: AWS CDK with TypeScript.
- Local development: LocalStack where useful, with important AWS behavior validated on real AWS staging.
- Data: DynamoDB with access-pattern-first design and GSIs.
- Visitor web: plain HTML/CSS/JS served from S3 behind CloudFront.
- Async processing: SQS + DLQ + worker.
- Scheduling: EventBridge Scheduler for one-time expiration workflows.
- Authentication: Amazon Cognito.
- Observability: CloudWatch logs, metrics, dashboards, and alarms.
- Mobile (Phase 2): React Native with Expo.

Do not add AWS services solely to increase the service count. Each service must have a documented purpose and trade-off.

## Architecture and engineering conventions

- Architecture decisions should explain why the decision was made, alternatives considered, and trade-offs.
- Prefer explicit AWS primitives where they are part of the learning objective; avoid abstractions that hide important cloud behavior.
- DynamoDB physical design follows documented access patterns.
- Runtime IAM follows least privilege and workload separation.
- Public endpoints expose minimum necessary information.
- State transitions that can race must be concurrency-safe and idempotent.
- Asynchronous consumers must account for at-least-once delivery.
- Observability must distinguish business outcomes from technical failures.
- Important failure behavior must be intentionally exercised and documented.
- No credentials, secrets, tokens, or unnecessary sensitive data belong in source control or logs.

## Repository rules

- Do not invent files, commands, infrastructure, or project state.
- Inspect the repository before making implementation assumptions.
- Keep Phase 2 mobile work out of Phase 1 unless explicitly requested.
- Do not commit automatically.
- Do not modify the cloud engineering tracking state automatically.
