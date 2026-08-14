## Outcome

Closes #

Parent epic: #

Describe the user-, consumer-, or maintainer-visible outcome in two or three sentences.

## Contract and scope

- Public API or behavior changed:
- Packages/apps/registry items affected:
- Explicitly out of scope:
- ADR added or updated, if required:

## Acceptance criteria

- [ ] The linked issue's acceptance criteria are checked and satisfied.
- [ ] The PR closes one primary implementation task.
- [ ] Native blocker relationships still match the real merge order.
- [ ] Public source is imported through package entry points; there are no deep imports.

## Evidence

- [ ] `vp check`
- [ ] Affected tests
- [ ] Affected production builds
- [ ] SSR/hydration evidence, or N/A with reason
- [ ] Performance evidence, or N/A with reason
- [ ] Browser/visual evidence, or N/A with reason
- [ ] Accessibility/keyboard evidence, or N/A with reason
- [ ] Registry/consumer-install evidence, or N/A with reason

Link artifacts, benchmark reports, recordings, or focused test output here.

## Architecture invariants

- [ ] External event data remains authoritative.
- [ ] Time intervals remain explicitly typed and half-open.
- [ ] No host timezone/current time is read implicitly during render.
- [ ] Core remains React, DOM, Jotai, dnd-kit, Tailwind, and application independent.
- [ ] The change adds no total-event/resource scan inside render, scroll, or pointer frames.
- [ ] Pointer capabilities retain keyboard and explicit-action equivalents.
- [ ] Controlled state is not mirrored through an effect.
- [ ] Custom views need no internal imports.
- [ ] SSR output is deterministic or the client enhancement is explicit.
- [ ] No god file or structural boolean-prop matrix was introduced.

## Risk and rollout

- Main risk:
- Safe rollback/reversal:
- Follow-up work that is genuinely outside this issue:
