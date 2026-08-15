# Performance harness

This workspace is a production-bundle benchmark protocol, not a product performance claim. Until
the indexed core and React integration land, the committed baseline measures the deliberately simple
reference implementation and validates the harness itself.

## First-class tasks

Run from the repository root:

```sh
vp run benchmark#smoke
vp run benchmark#core
vp run benchmark#react
vp run benchmark#gated
```

Every task first builds the benchmark and its workspace dependencies, then executes files from
`benchmarks/dist`. Benchmark tasks disable Vite Task caching so timings always describe the current
process and machine. `smoke` uses the full 10k/1k/500 fixture with two warmups and eight samples per
stage; full tasks use ten warmups and fifty samples.

## Separately reported stages

| Stage | Reference work measured now | Initial p95 gate |
| --- | --- | --- |
| `build` | Construct the reference snapshot and ID lookup from 10k events | 25 ms |
| `query` | Simple linear range-query correctness oracle | 1 ms |
| `projection` | Materialize the exact 1k visible fragment inputs | Report only |
| `layout` | Deterministic overlap lane assignment for 1k fragments | 8 ms |
| `render` | Materialize framework-neutral render models | Report only |
| `pointer-frame` | Reference hit-test scripting for one pointer frame | 4 ms |

The query baseline is intentionally linear and is not evidence that the future indexed engine meets
the architecture. Render excludes React commits, browser style/layout, and paint. Pointer-frame
excludes event delivery and browser paint. Those claims require the later engine, React, and browser
gates.

## Protocol

- Use the fixed default seed and record fixture counts in every report.
- Warm up each stage before collecting independent samples.
- Use Node's monotonic high-resolution timer and nearest-rank p50/p95.
- Consume each result so the operation cannot be discarded as unused.
- Sample process memory before and after the suite, outside timed loops.
- Record Node, OS/release, architecture, CPU, logical concurrency, and installed memory.
- Apply only architecture-approved thresholds. Projection and render remain report-only until their
  owning engine/browser issues establish audited budgets.
- In gated mode, any threshold failure sets a nonzero process exit status.

## Candidate comparison

Future engines implement the generic `BenchmarkEngine<TSnapshot>` seam and are checked against
`referenceEngine` before their timings are accepted:

```ts
import { compareCandidateToReference } from "./core/index.ts";
import { generateBenchmarkFixtures } from "fixtures";

const comparison = compareCandidateToReference(candidateEngine, generateBenchmarkFixtures());
```

The comparison checks range-query IDs, projection, layout, render models, and pointer hit-test output.
A candidate with different semantics must fail correctness before its faster number is relevant.

For an intentional local gating proof, build the benchmark and run the production bundle with a
negative threshold scale. The report must say `gate=fail` and the process must exit nonzero:

```sh
node benchmarks/dist/run.mjs --mode=smoke --gated --threshold-scale=-1
```
