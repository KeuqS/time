import type { ComponentType, ReactNode } from "react";

export interface StateChangeDetail {
  readonly source: "action";
  readonly previous: string;
  readonly controlled: boolean;
}

export interface CalendarPublicState {
  readonly view: string;
  readonly anchorDate: string;
}

export interface CalendarActions<TEvent, TResource> {
  setView(next: string): void;
  setAnchorDate(next: string): void;
  inspectEvent(event: TEvent): void;
  inspectResource(resource: TResource): void;
}

export interface CalendarMeta<TEvent, TResource> {
  readonly instanceId: string;
  readonly events: readonly TEvent[];
  readonly resources: readonly TResource[];
  readonly availableViews: readonly string[];
}

export interface CalendarContextValue<TEvent, TResource> {
  readonly state: CalendarPublicState;
  readonly actions: CalendarActions<TEvent, TResource>;
  readonly meta: CalendarMeta<TEvent, TResource>;
}

export interface CalendarViewProps<TEvent, TResource> {
  readonly calendar: CalendarContextValue<TEvent, TResource>;
}

export type CalendarViewComponent<TEvent, TResource> = ComponentType<
  CalendarViewProps<TEvent, TResource>
>;

export interface CalendarRootProps<TEvent, TResource> {
  readonly children?: ReactNode;
  readonly events: readonly TEvent[];
  readonly resources: readonly TResource[];
  readonly view?: string;
  readonly defaultView?: string;
  readonly onViewChange?: (next: string, detail: StateChangeDetail) => void;
  readonly anchorDate?: string;
  readonly defaultAnchorDate?: string;
  readonly onAnchorDateChange?: (next: string, detail: StateChangeDetail) => void;
  readonly onEventInspect?: (event: TEvent) => void;
  readonly onResourceInspect?: (resource: TResource) => void;
}

export interface CalendarCustomViewProps<TEvent, TResource> {
  readonly view: CalendarViewComponent<TEvent, TResource>;
}

export interface CalendarEventRenderValue<TEvent, TResource> {
  readonly event: TEvent;
  readonly resource: TResource | undefined;
  readonly state: CalendarPublicState;
  readonly actions: CalendarActions<TEvent, TResource>;
}

export interface CalendarEventProps<TEvent, TResource> {
  readonly eventIndex: number;
  readonly resourceIndex?: number;
  readonly children: (value: CalendarEventRenderValue<TEvent, TResource>) => ReactNode;
}

export interface CreateCalendarOptions<TEvent, TResource> {
  readonly views?: Readonly<Record<string, CalendarViewComponent<TEvent, TResource>>>;
}

export interface CalendarFactory<TEvent, TResource> {
  readonly Root: ComponentType<CalendarRootProps<TEvent, TResource>>;
  readonly Frame: ComponentType<{ readonly children?: ReactNode }>;
  readonly Toolbar: ComponentType<{ readonly children?: ReactNode }>;
  readonly Viewport: ComponentType<{ readonly children?: ReactNode }>;
  readonly Title: ComponentType;
  readonly ActiveView: ComponentType;
  readonly CustomView: ComponentType<CalendarCustomViewProps<TEvent, TResource>>;
  readonly Event: ComponentType<CalendarEventProps<TEvent, TResource>>;
  readonly defineView: (
    view: CalendarViewComponent<TEvent, TResource>,
  ) => CalendarViewComponent<TEvent, TResource>;
  readonly useCalendar: () => CalendarContextValue<TEvent, TResource>;
}
