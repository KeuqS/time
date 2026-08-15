# ADR 0003: Application-owned event state

- Status: Accepted
- Date: 2026-08-15

## Context

Calendars commonly sit above application databases, caches, and collaboration layers. A second
calendar-owned event model creates synchronization ambiguity and weakens optimistic-update
semantics.

## Decision

Application event and resource snapshots remain authoritative. Adapters project native records
into canonical contracts without requiring duplicate consumer records or casts. Calendar UI slices
may be independently controlled or uncontrolled, while pending changes are semantic transactions
in a small overlay rather than mutations of the external snapshot.

## Consequences

Persistence, conflicts, and revision ownership remain explicit. The integration layer must maintain
stable adapter and snapshot identities, and optimistic confirmation is observed through later
external snapshots instead of silently rewriting source records.

## Reversal trigger

Revisit if measured integrations cannot achieve required update throughput with immutable snapshots
and the advanced event-source contract; any alternative must retain one authoritative owner.
