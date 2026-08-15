export const TREE_BUILD_P95_LIMIT_MS = 25;
export const TREE_QUERY_P95_LIMIT_MS = 1;

export interface CandidateVerdictInput {
  readonly referenceAgreement: boolean;
  readonly treeBuildP95: number;
  readonly queries: Readonly<Record<"1d" | "7d", QueryComparison>>;
}

interface QueryComparison {
  readonly scanP95: number;
  readonly treeP95: number;
}

export function candidateSurvivesBenchmark(input: CandidateVerdictInput): boolean {
  return (
    input.referenceAgreement &&
    input.treeBuildP95 < TREE_BUILD_P95_LIMIT_MS &&
    (Object.values(input.queries) as readonly QueryComparison[]).every(
      ({ scanP95, treeP95 }) => treeP95 < TREE_QUERY_P95_LIMIT_MS && treeP95 < scanP95,
    )
  );
}
