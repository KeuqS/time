# Native Temporal wall-time fixture map

The JSON companion is the exact data fixture. This table is its review surface.

| Case                         | Wall slots                            | Instant identity                       | Physical day |
| ---------------------------- | ------------------------------------- | -------------------------------------- | -----------: |
| New York spring gap          | `02:00`, `02:30` unavailable          | zero instants                          |    1,380 min |
| New York fall fold           | `01:00`, `01:30` repeated             | two instants and offsets per wall slot |    1,500 min |
| Lord Howe 30-minute gap      | `02:00` unavailable                   | zero instants                          |    1,410 min |
| Santiago midnight transition | `00:00`, `00:30` unavailable          | zero instants                          |    1,380 min |

Rendering implication: the wall axis stays a nominal 1,440-minute coordinate
space. Gap segments are visibly unavailable. Fold occurrences share a wall
coordinate but must use `epochNanoseconds` (plus event identity) as their stable
render/edit key; `PlainDateTime` equality is not instant equality.

Disambiguation implication: `compatible` behaves like `later` for a gap and
like `earlier` for a fold. Automatic gap shifts therefore need to remain part
of the proposed transaction and accessibility announcement; `reject` remains
an explicit policy option.
