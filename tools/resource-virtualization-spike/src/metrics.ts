export interface FrameSample {
  readonly visibleResources: number;
  readonly visibleTimeSlots: number;
  readonly projectedCells: number;
  readonly axisWrites: number;
  readonly durationMs: number;
}

export interface TimelineMetricsSnapshot {
  readonly totalResources: number;
  readonly totalTimeSlots: number;
  readonly frameCount: number;
  readonly reactCommitCount: number;
  readonly resourceKeyReads: number;
  readonly resourceReads: number;
  readonly maxResourceKeyReadsPerFrame: number;
  readonly maxResourceReadsPerFrame: number;
  readonly maxVisibleResources: number;
  readonly maxVisibleTimeSlots: number;
  readonly maxProjectedCells: number;
  readonly maxAxisWritesPerFrame: number;
  readonly maxFrameDurationMs: number;
  readonly fullResourceFrameScans: number;
}

export interface TimelineMetrics {
  readonly beginFrameProbe: () => void;
  readonly recordResourceKeyRead: () => void;
  readonly recordResourceRead: () => void;
  readonly recordCommit: (
    visibleResources: number,
    visibleTimeSlots: number,
    projectedCells: number,
  ) => void;
  readonly recordFrame: (sample: FrameSample) => void;
  readonly snapshot: () => TimelineMetricsSnapshot;
}

export function createTimelineMetrics(
  totalResources: number,
  totalTimeSlots: number,
): TimelineMetrics {
  let frameCount = 0;
  let reactCommitCount = 0;
  let resourceKeyReads = 0;
  let resourceReads = 0;
  let lastFrameResourceKeyReads: number | null = null;
  let lastFrameResourceReads: number | null = null;
  let maxResourceKeyReadsPerFrame = 0;
  let maxResourceReadsPerFrame = 0;
  let maxVisibleResources = 0;
  let maxVisibleTimeSlots = 0;
  let maxProjectedCells = 0;
  let maxAxisWritesPerFrame = 0;
  let maxFrameDurationMs = 0;
  let fullResourceFrameScans = 0;

  return Object.freeze({
    beginFrameProbe() {
      lastFrameResourceKeyReads = resourceKeyReads;
      lastFrameResourceReads = resourceReads;
    },
    recordResourceKeyRead() {
      resourceKeyReads += 1;
    },
    recordResourceRead() {
      resourceReads += 1;
    },
    recordCommit(visibleResources: number, visibleTimeSlots: number, projectedCells: number) {
      reactCommitCount += 1;
      maxVisibleResources = Math.max(maxVisibleResources, visibleResources);
      maxVisibleTimeSlots = Math.max(maxVisibleTimeSlots, visibleTimeSlots);
      maxProjectedCells = Math.max(maxProjectedCells, projectedCells);
    },
    recordFrame(sample: FrameSample) {
      const keyReadsThisFrame =
        lastFrameResourceKeyReads === null ? 0 : resourceKeyReads - lastFrameResourceKeyReads;
      const resourceReadsThisFrame =
        lastFrameResourceReads === null ? 0 : resourceReads - lastFrameResourceReads;
      lastFrameResourceKeyReads = resourceKeyReads;
      lastFrameResourceReads = resourceReads;
      frameCount += 1;
      maxVisibleResources = Math.max(maxVisibleResources, sample.visibleResources);
      maxVisibleTimeSlots = Math.max(maxVisibleTimeSlots, sample.visibleTimeSlots);
      maxProjectedCells = Math.max(maxProjectedCells, sample.projectedCells);
      maxAxisWritesPerFrame = Math.max(maxAxisWritesPerFrame, sample.axisWrites);
      maxFrameDurationMs = Math.max(maxFrameDurationMs, sample.durationMs);
      maxResourceKeyReadsPerFrame = Math.max(maxResourceKeyReadsPerFrame, keyReadsThisFrame);
      maxResourceReadsPerFrame = Math.max(maxResourceReadsPerFrame, resourceReadsThisFrame);
      if (
        sample.visibleResources >= totalResources ||
        keyReadsThisFrame >= totalResources ||
        resourceReadsThisFrame >= totalResources
      ) {
        fullResourceFrameScans += 1;
      }
    },
    snapshot() {
      return Object.freeze({
        totalResources,
        totalTimeSlots,
        frameCount,
        reactCommitCount,
        resourceKeyReads,
        resourceReads,
        maxResourceKeyReadsPerFrame,
        maxResourceReadsPerFrame,
        maxVisibleResources,
        maxVisibleTimeSlots,
        maxProjectedCells,
        maxAxisWritesPerFrame,
        maxFrameDurationMs,
        fullResourceFrameScans,
      });
    },
  });
}
