# ADR-002: DynamoDB Access-Pattern-First Modeling

## Context

The domain model contains residents, guards, visits, and validations. A relational representation is useful for communicating the domain, but DynamoDB requires physical modeling around access patterns.

## Decision

Design the physical model from the required queries and mutations.

Initial access patterns include:

1. get visit by access code
2. list visits for a resident ordered by expected date
3. find pending visits in the guard's time window
4. find visits by visitor name/unit within the guard's search window
5. retrieve condominium-scoped resident/guard data
6. validate a visit atomically
7. expire a visit safely
8. retrieve administrative visit history

The final PK/SK/GSI layout will be documented before implementation.

## Consequences

Positive:

- predictable query cost
- queries match actual workflows
- avoids accidental scans
- makes DynamoDB trade-offs explicit

Negative:

- data may be duplicated
- access patterns constrain future queries
- the model requires more design work before coding

## Reconsider when

Access patterns become substantially more relational, ad-hoc analytics dominate, or the workload requires capabilities better served by a relational database.
