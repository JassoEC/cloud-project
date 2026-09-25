# ADR-007: Reproducible Environments and CI/CD

## Context

The project should demonstrate that cloud infrastructure can be reproduced without relying on manual console configuration.

## Decision

Use GitHub Actions and CDK to establish an automated delivery path.

Pull requests run:

- formatting/linting
- unit tests
- integration tests where practical
- TypeScript build
- CDK synth

Environment deployment is separated into development, staging, and production as the project matures.

Production deployment requires an explicit controlled step rather than every pull request deploying directly to production.

## Consequences

Positive:

- repeatable delivery
- infrastructure drift becomes visible
- changes are validated before deployment

Negative:

- CI configuration and credentials become part of the system
- environment management adds complexity

## Reconsider when

The project adopts a different CI platform or requires a multi-account AWS organization with a more advanced deployment pipeline.
