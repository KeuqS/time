# Reference harness baseline — 2026-08-15

This record calibrates benchmark protocol v1 against the deliberately simple reference algorithms.
It is not evidence for the future indexed engine, React commit behavior, browser rendering, or an
end-user latency claim.

## Reference environment

| Field | Value |
| --- | --- |
| Machine CPU | Apple M1 Pro |
| Available logical CPUs | 10 |
| Installed memory | 32 GiB |
| Platform | macOS (`darwin`, `arm64`) |
| Darwin release | 25.5.0 |
| Node | v24.19.0 |
| Runner | Production ESM bundle from `benchmarks/dist/run.mjs` |
| Measured revision | `41cb9d8b5bcdf2946fff370687b55498a58bd7ca` |
| Fixture seed | `1414090053` (`0x54494d45`) |
| Fixture profile | 10,000 events; 1,000 visible fragments; 500 resources; 5 DST cases |

Command:

```sh
vp run benchmark#gated
```

Each stage used 10 warmup iterations followed by 50 measured samples. Values below are monotonic
wall-clock milliseconds reported with nearest-rank percentiles.

## Results

| Stage | p50 | p95 | Initial p95 threshold | Result |
| --- | ---: | ---: | ---: | --- |
| Build | 0.653 ms | 1.410 ms | 25 ms | Pass |
| Query | 0.123 ms | 0.215 ms | 1 ms | Pass |
| Projection | 0.049 ms | 0.069 ms | Report only | Recorded |
| Layout | 0.363 ms | 0.502 ms | 8 ms | Pass |
| Render-model materialization | 0.016 ms | 0.085 ms | Report only | Recorded |
| Pointer-frame hit test | 0.011 ms | 0.031 ms | 4 ms | Pass |

The process memory snapshots changed by +9.0 MiB heap used and +31.3 MiB RSS across this run. These
are diagnostic deltas, not allocation budgets: Node documents process memory collection as a
point-in-time operation, and garbage collection plus allocator behavior can move either value between
runs.

## Interpretation boundary

- Build, query, projection, and layout currently exercise the simple correctness reference.
- Query is intentionally a linear scan; its timing does not satisfy the architecture's indexed-query
  implementation requirement.
- Render measures framework-neutral model creation, not React reconciliation, DOM work, style/layout,
  or paint.
- Pointer-frame measures reference library scripting only, not browser event delivery or presentation.
- A future candidate result is admissible only after `compareCandidateToReference` reports identical
  semantics for query, projection, layout, render models, and hit testing.
- Compare later numbers only with the same fixture seed, protocol, production-build mode, and an
  equivalent recorded environment.
