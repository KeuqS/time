import type { ReactNode } from "react";

export type CalendarEntityId = string | number;
export type CalendarInteractionInput = "pointer" | "touch" | "keyboard";
export type CalendarChangeCause = "move" | "keyboard";

export interface CalendarEventPlacement<TResourceId extends CalendarEntityId = string> {
  readonly startMinute: number;
  readonly endMinute: number;
  readonly resourceId: TResourceId;
}

export interface CalendarValidationResult {
  readonly status: "valid" | "invalid";
  readonly reasons: readonly string[];
}

/**
 * Spike-local approximation of the architecture's semantic change contract.
 * Issue #35 owns the canonical production type.
 */
export interface CalendarEventChange<TEvent, TResourceId extends CalendarEntityId = string> {
  readonly id: string;
  readonly cause: CalendarChangeCause;
  readonly input: CalendarInteractionInput;
  readonly event: TEvent;
  readonly original: CalendarEventPlacement<TResourceId>;
  readonly proposed: CalendarEventPlacement<TResourceId>;
  readonly validation: CalendarValidationResult;
  readonly sourceView: string;
}

export interface CalendarDragSource<TEvent, TResourceId extends CalendarEntityId = string> {
  readonly eventId: CalendarEntityId;
  readonly title: string;
  readonly event: TEvent;
  readonly placement: CalendarEventPlacement<TResourceId>;
  readonly sourceView: string;
}

export interface CalendarAnnouncementContext<
  TEvent,
  TResourceId extends CalendarEntityId = string,
> {
  readonly source: CalendarDragSource<TEvent, TResourceId>;
  readonly change: CalendarEventChange<TEvent, TResourceId> | null;
}

export interface CalendarDragMessages<TEvent, TResourceId extends CalendarEntityId = string> {
  readonly instructions: string;
  started(context: CalendarAnnouncementContext<TEvent, TResourceId>): string;
  moved(context: CalendarAnnouncementContext<TEvent, TResourceId>): string;
  completed(context: CalendarAnnouncementContext<TEvent, TResourceId>): string;
  canceled(context: CalendarAnnouncementContext<TEvent, TResourceId>): string;
}

export interface CalendarPointerActivation {
  readonly mouseDistance: number;
  readonly touchDelayMs: number;
  readonly touchTolerance: number;
}

export interface CalendarAutoScrollConfiguration {
  readonly edgeThreshold: number;
  readonly maximumPixelsPerFrame: number;
}

export interface CalendarDragConfiguration {
  readonly pointer: CalendarPointerActivation;
  readonly autoScroll: CalendarAutoScrollConfiguration;
}

export interface CalendarDraggableRenderProps {
  readonly ref: (element: Element | null) => void;
  readonly handleRef: (element: Element | null) => void;
}

export interface CalendarDragOverlayRenderProps<
  TEvent,
  TResourceId extends CalendarEntityId = string,
> {
  readonly source: CalendarDragSource<TEvent, TResourceId>;
}

export type CalendarDragOverlayRenderer<TEvent, TResourceId extends CalendarEntityId = string> = (
  props: CalendarDragOverlayRenderProps<TEvent, TResourceId>,
) => ReactNode;

export const defaultCalendarDragConfiguration: CalendarDragConfiguration = {
  pointer: {
    mouseDistance: 4,
    touchDelayMs: 180,
    touchTolerance: 8,
  },
  autoScroll: {
    edgeThreshold: 48,
    maximumPixelsPerFrame: 18,
  },
};
