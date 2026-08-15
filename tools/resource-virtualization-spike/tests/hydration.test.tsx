// @vitest-environment jsdom

import { StrictMode, act } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, expect, test, vi } from "vite-plus/test";

import { ResourceTimeline } from "../src/ResourceTimeline.tsx";
import "./setup.ts";

let root: Root | undefined;

afterEach(async () => {
  if (root !== undefined) {
    await act(async () => root?.unmount());
    root = undefined;
  }
  vi.restoreAllMocks();
});

test("initial server geometry hydrates without recovery and exposes bounded diagnostics", async () => {
  const serverMarkup = renderToString(<ResourceTimeline />);
  const container = document.createElement("div");
  container.innerHTML = serverMarkup;
  document.body.append(container);
  const markupBeforeHydration = container.innerHTML;
  const recoverableErrors: unknown[] = [];
  const consoleErrors = vi.spyOn(console, "error").mockImplementation(() => undefined);

  await act(async () => {
    root = hydrateRoot(
      container,
      <StrictMode>
        <ResourceTimeline />
      </StrictMode>,
      {
        onRecoverableError(error) {
          recoverableErrors.push(error);
        },
      },
    );
  });

  expect(container.innerHTML).toBe(markupBeforeHydration);
  expect(recoverableErrors).toEqual([]);
  expect(consoleErrors).not.toHaveBeenCalled();
  const evidence = window.__resourceTimelineSpike?.readEvidence();
  expect(evidence?.renderedResourceRows).toBeGreaterThan(0);
  expect(evidence?.renderedResourceRows).toBeLessThan(40);
  expect(evidence?.renderedTimeHeaders).toBeLessThan(24);
  expect(evidence?.axesOutsideVirtualCanvas).toBe(true);
  expect(evidence?.maxDevicePixelError).toBe(0);
});

test("RTL and focus identity survive virtualization away from and back to the row", async () => {
  const container = document.createElement("div");
  container.innerHTML = renderToString(<ResourceTimeline />);
  document.body.append(container);

  await act(async () => {
    root = hydrateRoot(container, <ResourceTimeline />);
  });

  await act(async () => {
    await window.__resourceTimelineSpike?.setDirection("rtl");
  });
  let evidence = window.__resourceTimelineSpike?.readEvidence();
  expect(evidence?.direction).toBe("rtl");
  const viewport = container.querySelector<HTMLElement>(".timeline-viewport");
  expect(viewport).not.toBeNull();
  if (viewport !== null) {
    Object.defineProperties(viewport, {
      clientHeight: { configurable: true, value: 520 },
      scrollHeight: { configurable: true, value: 19_250 },
    });
  }

  await act(async () => {
    await window.__resourceTimelineSpike?.focusResource(239);
  });
  evidence = window.__resourceTimelineSpike?.readEvidence();
  expect(viewport?.scrollTop).toBeGreaterThan(8_000);
  expect(
    [...container.querySelectorAll<HTMLElement>("[data-resource-id]")].map(
      (element) => element.dataset.resourceId,
    ),
  ).toContain("resource-240");
  expect(evidence?.focusedResourceId).toBe("resource-240");

  await act(async () => {
    if (viewport !== null) {
      viewport.scrollTop = 16_000;
      viewport.dispatchEvent(new Event("scroll", { bubbles: true }));
    }
    await new Promise((resolve) => setTimeout(resolve, 5));
  });
  expect(document.activeElement).toBe(document.body);

  await act(async () => {
    if (viewport !== null) {
      viewport.scrollTop = 8_980;
      viewport.dispatchEvent(new Event("scroll", { bubbles: true }));
    }
    await new Promise((resolve) => setTimeout(resolve, 5));
  });
  evidence = window.__resourceTimelineSpike?.readEvidence();
  expect(evidence?.focusedResourceId).toBe("resource-240");
});
