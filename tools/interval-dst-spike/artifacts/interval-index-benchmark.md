# Interval-index benchmark evidence

- Dataset: 10,000 seeded intervals over 365 days
- Queries: 3,000 seeded warm queries per duration
- Runtime: v24.19.0 / V8 13.6.233.17-node.51
- Host: Apple M1 Pro, darwin arm64 25.5.0
- Native Temporal flag used by the spike task: `--harmony-temporal (required; Temporal is absent without it on this runtime)`

| Implementation  | Build p50 (ms) | Build p95 (ms) | Warm query p95 (ms) | Retained heap delta |
| --------------- | -------------: | -------------: | ------------------: | ------------------: |
| scan             |          0.173 |          1.064 |                   — |            1.23 MiB |
| tree             |          8.615 |         11.060 |                   — |            5.44 MiB |
| scan (1d query)  |              — |              — |              0.0651 |                   — |
| tree (1d query)  |              — |              — |              0.0091 |                   — |
| scan (7d query)  |              — |              — |              0.0678 |                   — |
| tree (7d query)  |              — |              — |              0.0327 |                   — |

Checksums and matched-value counts agree for scan and tree in both query workloads: yes.

Decision gate: **retain the candidate behind the replaceable seam**. The gate requires exact reference agreement, indexed p95 below 1 ms, and the tree to beat the scan p95 for both one-day and seven-day visible ranges.

This is one local evidence run, not a portable device threshold. Issue #24 must
repeat it in the production benchmark harness and on the recorded reference
environment.
