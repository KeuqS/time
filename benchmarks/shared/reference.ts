import type { BenchmarkFixtureSet, FixtureEvent, FixtureFragment } from "fixtures";

import type {
  BenchmarkEngine,
  BenchmarkLayout,
  BenchmarkProjection,
  BenchmarkQuery,
  BenchmarkRenderModel,
} from "./contracts.ts";

export interface ReferenceSnapshot {
  readonly byId: ReadonlyMap<string, FixtureEvent>;
  readonly events: readonly FixtureEvent[];
}

function buildReference(fixtures: BenchmarkFixtureSet): ReferenceSnapshot {
  return {
    byId: new Map(fixtures.events.map((event) => [event.id, event])),
    events: fixtures.events,
  };
}

function queryReference(snapshot: ReferenceSnapshot, query: BenchmarkQuery): readonly string[] {
  const ids: string[] = [];

  for (const event of snapshot.events) {
    if (
      event.data.startUnit < query.endUnit &&
      event.data.endUnit > query.startUnit &&
      (query.resourceIds === undefined ||
        event.resourceIds?.some((resourceId) => query.resourceIds?.has(resourceId)))
    ) {
      ids.push(event.id);
    }
  }

  return ids;
}

function projectReference(
  snapshot: ReferenceSnapshot,
  fragments: readonly FixtureFragment[],
): readonly BenchmarkProjection[] {
  const projection: BenchmarkProjection[] = [];

  for (const fragment of fragments) {
    if (snapshot.byId.has(fragment.eventId)) {
      projection.push({
        endUnit: fragment.endUnit,
        eventId: fragment.eventId,
        key: fragment.id,
        resourceId: fragment.resourceId,
        startUnit: fragment.startUnit,
      });
    }
  }

  return projection;
}

function layoutReference(projection: readonly BenchmarkProjection[]): readonly BenchmarkLayout[] {
  const ordered = [...projection].sort(
    (left, right) =>
      left.resourceId.localeCompare(right.resourceId) ||
      left.startUnit - right.startUnit ||
      left.endUnit - right.endUnit ||
      left.key.localeCompare(right.key),
  );
  const laneEnds = new Map<string, number[]>();
  const provisional: Array<BenchmarkProjection & { lane: number }> = [];

  for (const item of ordered) {
    const resourceLaneEnds = laneEnds.get(item.resourceId) ?? [];
    let lane = resourceLaneEnds.findIndex((endUnit) => endUnit <= item.startUnit);
    if (lane === -1) {
      lane = resourceLaneEnds.length;
    }
    resourceLaneEnds[lane] = item.endUnit;
    laneEnds.set(item.resourceId, resourceLaneEnds);
    provisional.push({ ...item, lane });
  }

  return provisional.map((item) => ({
    ...item,
    laneCount: laneEnds.get(item.resourceId)?.length ?? 1,
  }));
}

function renderReference(layout: readonly BenchmarkLayout[]): readonly BenchmarkRenderModel[] {
  return layout.map((item) => ({
    height: Math.max(1, item.endUnit - item.startUnit),
    key: item.key,
    lane: item.lane,
    resourceId: item.resourceId,
    top: item.startUnit,
  }));
}

function pointerFrameReference(layout: readonly BenchmarkLayout[], frame: number): string | null {
  const targetUnit = 8 * 60 + ((frame * 17) % (12 * 60));
  const targetResource = `resource-${String(frame % 500).padStart(3, "0")}`;

  for (const item of layout) {
    if (
      item.resourceId === targetResource &&
      item.startUnit <= targetUnit &&
      item.endUnit > targetUnit
    ) {
      return item.key;
    }
  }

  return null;
}

export const referenceEngine: BenchmarkEngine<ReferenceSnapshot> = Object.freeze({
  name: "simple-reference",
  build: buildReference,
  layout: layoutReference,
  pointerFrame: pointerFrameReference,
  project: projectReference,
  query: queryReference,
  render: renderReference,
});
