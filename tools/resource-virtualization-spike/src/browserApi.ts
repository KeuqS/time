import { useCallback, useEffect, type RefObject } from "react";

import { devicePixelError } from "./geometry.ts";
import type { TimelineMetrics, TimelineMetricsSnapshot } from "./metrics.ts";

export type TimelineDirection = "ltr" | "rtl";

export interface BrowserEvidence {
  readonly direction: TimelineDirection;
  readonly placementScale: number;
  readonly browserDevicePixelRatio: number;
  readonly renderedResourceRows: number;
  readonly renderedResourceLabels: number;
  readonly renderedTimeHeaders: number;
  readonly renderedGridCells: number;
  readonly totalTimelineElements: number;
  readonly resourceAxisDeltaCssPx: number | null;
  readonly timeAxisDeltaCssPx: number | null;
  readonly maxDevicePixelError: number;
  readonly axesOutsideVirtualCanvas: boolean;
  readonly focusedResourceId: string | null;
  readonly metrics: TimelineMetricsSnapshot;
}

export interface ResourceTimelineBrowserApi {
  readonly readEvidence: () => BrowserEvidence;
  readonly setDirection: (direction: TimelineDirection) => Promise<BrowserEvidence>;
  readonly focusResource: (index: number) => Promise<BrowserEvidence>;
  readonly runScrollProbe: (options?: {
    readonly top?: number;
    readonly inline?: number;
    readonly steps?: number;
  }) => Promise<BrowserEvidence>;
}

declare global {
  interface Window {
    __resourceTimelineSpike?: ResourceTimelineBrowserApi;
  }
}

interface BrowserApiOptions {
  readonly direction: TimelineDirection;
  readonly focusResource: (index: number) => void;
  readonly metrics: TimelineMetrics;
  readonly placementScale: number;
  readonly resourceAxisRef: RefObject<HTMLDivElement | null>;
  readonly setDirection: (direction: TimelineDirection) => void;
  readonly shellRef: RefObject<HTMLDivElement | null>;
  readonly timeAxisRef: RefObject<HTMLDivElement | null>;
  readonly viewportRef: RefObject<HTMLDivElement | null>;
  readonly virtualCanvasRef: RefObject<HTMLDivElement | null>;
}

const nextFrame = () =>
  new Promise<void>((resolve) => {
    let settled = false;
    let animationFrameId = 0;
    let timeoutId = 0;
    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeoutId);
      resolve();
    };
    animationFrameId = requestAnimationFrame(finish);
    timeoutId = window.setTimeout(finish, 32);
  });

export function useResourceTimelineBrowserApi({
  direction,
  focusResource,
  metrics,
  placementScale,
  resourceAxisRef,
  setDirection,
  shellRef,
  timeAxisRef,
  viewportRef,
  virtualCanvasRef,
}: BrowserApiOptions) {
  const readEvidence = useCallback((): BrowserEvidence => {
    const shell = shellRef.current;
    const canvas = virtualCanvasRef.current;
    const resourceLabels = [
      ...(shell?.querySelectorAll<HTMLElement>("[data-resource-label]") ?? []),
    ];
    const resourceRows = [...(shell?.querySelectorAll<HTMLElement>("[data-resource-row]") ?? [])];
    const timeHeaders = [...(shell?.querySelectorAll<HTMLElement>("[data-slot-header]") ?? [])];
    const gridCells = [...(shell?.querySelectorAll<HTMLElement>("[data-slot-cell]") ?? [])];
    const firstLabel = resourceLabels[0];
    const matchingRow =
      firstLabel === undefined
        ? undefined
        : resourceRows.find((row) => row.dataset.resourceRow === firstLabel.dataset.resourceLabel);
    const firstHeader = timeHeaders[0];
    const matchingCell =
      firstHeader === undefined
        ? undefined
        : gridCells.find((cell) => cell.dataset.slotCell === firstHeader.dataset.slotHeader);
    const positionedElements = [...resourceRows, ...resourceLabels, ...timeHeaders, ...gridCells];
    let maxPlacementError = 0;
    for (const element of positionedElements) {
      const snappedStart = Number(element.dataset.snappedStart ?? "0");
      maxPlacementError = Math.max(
        maxPlacementError,
        devicePixelError(snappedStart, placementScale),
      );
    }

    const focusedResourceId =
      document.activeElement instanceof HTMLElement
        ? (document.activeElement.dataset.resourceId ?? null)
        : null;
    return Object.freeze({
      direction,
      placementScale,
      browserDevicePixelRatio: window.devicePixelRatio,
      renderedResourceRows: resourceRows.length,
      renderedResourceLabels: resourceLabels.length,
      renderedTimeHeaders: timeHeaders.length,
      renderedGridCells: gridCells.length,
      totalTimelineElements: shell?.querySelectorAll("*").length ?? 0,
      resourceAxisDeltaCssPx:
        firstLabel === undefined || matchingRow === undefined
          ? null
          : Math.abs(
              firstLabel.getBoundingClientRect().top - matchingRow.getBoundingClientRect().top,
            ),
      timeAxisDeltaCssPx:
        firstHeader === undefined || matchingCell === undefined
          ? null
          : Math.abs(
              firstHeader.getBoundingClientRect().left - matchingCell.getBoundingClientRect().left,
            ),
      maxDevicePixelError: maxPlacementError,
      axesOutsideVirtualCanvas:
        canvas !== null &&
        timeAxisRef.current !== null &&
        resourceAxisRef.current !== null &&
        !canvas.contains(timeAxisRef.current) &&
        !canvas.contains(resourceAxisRef.current),
      focusedResourceId,
      metrics: metrics.snapshot(),
    });
  }, [
    direction,
    metrics,
    placementScale,
    resourceAxisRef,
    shellRef,
    timeAxisRef,
    virtualCanvasRef,
  ]);

  useEffect(() => {
    const api: ResourceTimelineBrowserApi = Object.freeze({
      readEvidence,
      async setDirection(nextDirection: TimelineDirection) {
        setDirection(nextDirection);
        await nextFrame();
        await nextFrame();
        return window.__resourceTimelineSpike?.readEvidence() ?? readEvidence();
      },
      async focusResource(index: number) {
        focusResource(index);
        await nextFrame();
        await nextFrame();
        return window.__resourceTimelineSpike?.readEvidence() ?? readEvidence();
      },
      async runScrollProbe({ top = 14_000, inline = 12_000, steps = 24 } = {}) {
        const viewport = viewportRef.current;
        if (viewport === null) {
          return readEvidence();
        }

        metrics.beginFrameProbe();
        const targetInline = direction === "rtl" ? -Math.abs(inline) : Math.abs(inline);
        for (let step = 1; step <= steps; step += 1) {
          const progress = step / steps;
          viewport.scrollTop = top * progress;
          viewport.scrollLeft = targetInline * progress;
          viewport.dispatchEvent(new Event("scroll", { bubbles: true }));
          await nextFrame();
        }
        await nextFrame();
        return window.__resourceTimelineSpike?.readEvidence() ?? readEvidence();
      },
    });
    window.__resourceTimelineSpike = api;
    return () => {
      if (window.__resourceTimelineSpike === api) {
        delete window.__resourceTimelineSpike;
      }
    };
  }, [direction, focusResource, metrics, readEvidence, setDirection, viewportRef]);
}
