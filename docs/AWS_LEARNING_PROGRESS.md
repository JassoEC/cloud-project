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
| 0.2 IAM basics | Pending | — |

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
