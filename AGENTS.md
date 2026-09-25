# AGENTS.md

## Repo state

Documentation-only, design phase: no code, no manifests, no build/test tooling yet. Not a git repository. Do not invent commands or assume a scaffold exists.

## Files

- `README.md` (English): problem statement, architecture diagram, AWS service justifications with trade-offs, phased roadmap.
- `docs/SPECIFICATIONS.md` (Spanish): data model, API endpoints, business rules (RB-01…RB-07), security, testing/deployment/monitoring strategy. Keep new spec content in Spanish to match.
- `docs/adr/` is referenced in the README but does not exist yet.

## Planned stack (when code lands)

- Backend: TypeScript + NestJS, deployed to AWS Lambda behind API Gateway.
- Infra: AWS CDK (TypeScript), local dev against LocalStack.
- Data: DynamoDB, explicitly single-table design with GSIs.
- Visitor web: plain HTML/CSS/JS + qrcode.js on S3/CloudFront (no framework).
- Mobile (Phase 2): React Native (Expo) — do not start it during Phase 1 work.

## Conventions

- Architecture decisions in the README follow a "why / alternatives considered / trade-off" pattern; mirror it in ADRs.
- Business rules are numbered RB-XX in the spec — reference these IDs rather than restating rules.
- Cost constraint matters: designs are expected to stay within AWS free tier.
