import { describe, expect, test } from "vite-plus/test";

import { generateBenchmarkFixtures } from "fixtures";

import type { BenchmarkEngine } from "../shared/contracts.ts";
import {
  benchmarkExitCode,
  compareCandidateToReference,
  runBenchmark,
  summarizeSamples,
} from "../shared/protocol.ts";
import { referenceEngine, type ReferenceSnapshot } from "../shared/reference.ts";

describe("benchmark protocol", () => {
  test("reports nearest-rank p50 and p95 after warmup", () => {
    expect(summarizeSamples([9, 1, 7, 3, 5], 2)).toEqual({
      iterations: 5,
      maximumMs: 9,
      minimumMs: 1,
      p50Ms: 5,
      p95Ms: 9,
      warmupIterations: 2,
    });
  });

  test("compares a candidate against the simple reference", () => {
    const fixtures = generateBenchmarkFixtures({
      eventCount: 80,
      resourceCount: 20,
      visibleFragmentCount: 40,
    });
    const equivalentCandidate: BenchmarkEngine<ReferenceSnapshot> = {
      ...referenceEngine,
      name: "equivalent-candidate",
    };
    const invalidCandidate: BenchmarkEngine<ReferenceSnapshot> = {
      ...referenceEngine,
      name: "invalid-candidate",
      query: () => [],
    };

    expect(compareCandidateToReference(equivalentCandidate, fixtures)).toMatchObject({
      differences: [],
      matchesReference: true,
    });
    expect(compareCandidateToReference(invalidCandidate, fixtures)).toMatchObject({
      differences: ["query"],
      matchesReference: false,
    });
  });

  test("returns nonzero in gated mode when a threshold fails", () => {
    const report = runBenchmark(
      referenceEngine,
      generateBenchmarkFixtures({
        eventCount: 50,
        resourceCount: 10,
        visibleFragmentCount: 20,
      }),
      {
        mode: "smoke",
        stages: ["query"],
        suite: "intentional-gate-failure",
        thresholdScale: -1,
      },
    );

    expect(report.stages[0]?.status).toBe("fail");
    expect(benchmarkExitCode(report, true)).toBe(1);
    expect(benchmarkExitCode(report, false)).toBe(0);
  });
});
