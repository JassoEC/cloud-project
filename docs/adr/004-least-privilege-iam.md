# ADR-004: Least-Privilege IAM

## Context

Serverless systems often become insecure when multiple functions share broad execution roles.

This project is specifically intended to demonstrate AWS security fundamentals.

## Decision

Create IAM permissions per workload and integration.

Application roles must:

- grant only required actions
- scope resources where practical
- avoid administrative managed policies
- separate read and write capabilities when useful
- keep infrastructure deployment permissions separate from runtime permissions

IAM policy changes are reviewed as application changes.

## Consequences

Positive:

- reduced blast radius
- clearer security boundaries
- easier audit and review

Negative:

- more policies to maintain
- permissions may need adjustment as access patterns evolve

## Reconsider when

A managed service integration provides a safer and sufficiently scoped alternative to custom policy composition.
