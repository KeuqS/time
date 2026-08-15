# ADR 0002: Non-empty half-open event intervals

- Status: Accepted
- Date: 2026-08-15

## Context

Inclusive endpoints make adjacency ambiguous and create different arithmetic for timed and
all-day events. Empty event intervals cannot be rendered or indexed meaningfully.

## Decision

All canonical event and range contracts use `[start, end)`. Validated interval constructors require
`start < end`, preserve the exact Temporal point type, and return either an explicit validation
issue or a branded interval. Timed, all-day, and floating event adapters are validated with their
type-specific comparator. Cursor and selection-anchor types may model zero length separately.

## Consequences

Adjacent events never overlap, a one-day event ends on the following date, and range intersection
uses one consistent rule. Callers crossing an external-data boundary must handle invalid intervals
before projection or indexing.

## Reversal trigger

Revisit only if a supported external standard cannot be mapped losslessly at the adapter boundary;
do not change internal endpoint semantics merely to mirror an external representation.
