# Learning Exercises and Tracking Model

> Canonical intent: [TRAINING_INTENT.md](./TRAINING_INTENT.md).

This document defines how exercises, evidence, reviews, and capability progress relate to each other.

## Single unit of work

The **Task ID** is the unique unit of work in the learning system.

A task represents one bounded learning objective. It may be a Project, Focus Lab, Contrast Lab, or Conceptual / Exam Practice exercise.

The relationship is:

```
Task ID
  |
  +--> exercise definition
  |
  +--> evidence
  |
  +--> review
  |      |
  |      +--> ACCEPTED / REJECTED
  |      +--> score
  |
  +--> capability evidence
  |
  +--> accumulated Developer depth
```

A capability may be demonstrated by more than one task, but a task must have only one canonical identity.

## Source of truth by question

| Question | Canonical document |
|---|---|
| Why does this training exist? | `TRAINING_INTENT.md` |
| What should we learn next? | `LEARNING_PATH.md` |
| What exactly is the exercise? | `AWS_LEARNING_TASKS.md` |
| Was the exercise accepted and with what score? | `AWS_LEARNING_PROGRESS.md` |
| What capability does the evidence accumulate toward? | `CLOUD_ENGINEERING_TRACKING.md` |
| What implementation/reproducibility checks remain? | `CLOUD_ENGINEERING_IMPLEMENTATION_PLAN.md` |

No document should create a second independent status for the same Task ID.

## Task contract

Every significant task should define:

- **Task ID** — stable identifier, such as `3.1`.
- **Capability** — AWS Developer capability being trained.
- **Learning type** — Project, Focus Lab, Contrast Lab, or Conceptual / Exam Practice.
- **Course connection** — relevant Udemy topic or study area.
- **Depth target** — L1 Explain, L2 Build, L3 Integrate, or L4 Diagnose.
- **Exercise** — bounded work to perform.
- **Acceptance** — observable criteria for review.
- **Evidence** — what the learner must provide.
- **Failure scenario** — when failure/diagnosis is part of the objective.
- **Cleanup** — disposable resources or configuration to remove.

The task definition lives in `AWS_LEARNING_TASKS.md`.

## Task lifecycle

A task moves through this lifecycle:

```
PLANNED
  ↓
IN PROGRESS
  ↓
READY FOR REVIEW
  ↓
ACCEPTED ──────────────┐
  ↑                    |
  └── REJECTED ←───────┘
```

Only the review result is authoritative for completion.

A checked implementation item is not, by itself, an accepted learning task.

## Evidence flow

When a task is reviewed:

1. The learner provides the evidence.
2. The reviewer evaluates the evidence against the task acceptance criteria.
3. The review result is recorded in `AWS_LEARNING_PROGRESS.md`.
4. Accepted evidence contributes to the relevant capability in `CLOUD_ENGINEERING_TRACKING.md`.
5. The task may then unlock the next task according to `LEARNING_PATH.md`.

This means capability progress is **derived from accepted task evidence**, not independently checked because a related implementation happens to exist.

## Historical progress

`AWS_LEARNING_PROGRESS.md` is the historical record.

Its accepted reviews should not be rewritten merely to match a later taxonomy, ordering, or wording change.

If the training model changes:

- preserve the original Task ID;
- preserve the original acceptance and score;
- add new interpretation only when necessary;
- do not manufacture new evidence retroactively.

## Capability tracking

`CLOUD_ENGINEERING_TRACKING.md` is a capability view, not a second exercise checklist.

It should answer:

> What can the learner now demonstrate?

rather than:

> Which tasks have checkboxes?

Capability progress should use the shared depth model:

- **L1 Explain** — can explain the service/pattern and when to use it.
- **L2 Build** — can build a working example.
- **L3 Integrate** — can integrate it correctly into the application.
- **L4 Diagnose** — can diagnose and recover from a meaningful failure.

Where useful, the capability view can also summarize:

- Build;
- Understand;
- Operate;
- Reproduce.

These are dimensions of demonstrated capability, not replacements for Task IDs.

## Avoiding duplicate exercises

Before adding a task:

1. Search `AWS_LEARNING_TASKS.md` for an existing Task ID or equivalent capability.
2. Check whether accepted evidence already demonstrates the proposed objective.
3. If the objective is already demonstrated, extend the existing task or create a clearly distinct deeper task.
4. Do not create a new task only to repeat the same HTTP/API/Lambda flow with different wording.

Example:

```
2.1 HTTP to Lambda
      ↓
accepted evidence already demonstrates
      ↓
2.2 First useful endpoint
```

If 2.1 already satisfies the complete acceptance criteria of 2.2, 2.2 should not require duplicate implementation. The accepted record should explain the overlap.

## Supporting labs

Focus and Contrast Labs use the same Task ID and evidence model.

They do not need to become permanent application components.

For example:

```
Contrast Lab
Lambda vs EC2
     ↓
Build + Explain + Operate
     ↓
evidence
     ↓
Developer / infrastructure literacy capability
```

The lab can be complete without changing the production architecture of `cloud-project`.

## Review and status conventions

Use these conventions consistently:

- **[ ]** — work not demonstrated.
- **[x]** — the task item has been demonstrated or completed as part of the exercise.
- **ACCEPTED** — the reviewer accepted the task as a learning gate.
- **REJECTED** — the evidence did not satisfy the acceptance criteria.
- **Score** — learning-quality assessment; it does not replace ACCEPTED/REJECTED.

A task should not be marked ACCEPTED solely because all implementation checkboxes are checked.

## Current mapping

The already accepted work remains valid:

| Task ID | Canonical task | Review |
|---|---|---|
| 0.1 | Prepare the AWS sandbox | ACCEPTED — 9/10 |
| 0.2 | IAM basics | ACCEPTED — 9/10 |
| 1.1 | First Lambda | ACCEPTED — 9/10 |
| 1.2 | Lambda with application code | ACCEPTED — 10/10 |
| 1.3 | Break and diagnose Lambda | ACCEPTED — 10/10 |
| 2.1 | HTTP to Lambda | ACCEPTED — 10/10 |
| 2.2 | First useful endpoint | ACCEPTED — 10/10 |

These records remain historical evidence. Future tasks should follow the same Task ID → Evidence → Review → Capability flow.

## Change rule

When adding or modifying a learning exercise:

1. Define or update the Task ID in `AWS_LEARNING_TASKS.md`.
2. Define its capability, type, course connection, depth, acceptance, evidence, failure scenario, and cleanup.
3. Execute the exercise.
4. Review the evidence.
5. Record the review in `AWS_LEARNING_PROGRESS.md`.
6. Update the corresponding capability summary in `CLOUD_ENGINEERING_TRACKING.md`.
7. Update `LEARNING_PATH.md` only when the sequence or dependency changes.

Do not update several documents independently with different interpretations of the same task.

## Result

The repository therefore has one learning object with several useful views:

```
                 TRAINING_INTENT
                       |
                  LEARNING_PATH
                       |
                    TASK ID
                       |
          +------------+------------+
          |                         |
     Task definition            Evidence
          |                         |
          |                       Review
          |                         |
          +------------+------------+
                       |
                Capability progress
                       |
              CLOUD_ENGINEERING_TRACKING
```

The objective is not to eliminate the documents. It is to eliminate conflicting meanings between them.
