import { describe, expect, expectTypeOf, test } from "vite-plus/test";

import type { CalendarClock, Temporal } from "@moltenship/calendar-temporal";

import {
  createCanonicalEventAdapter,
  defineEventAdapter,
  isEventId,
  isResourceId,
  validateCalendarEventInterval,
  type AllDayCalendarEvent,
  type CalendarEnvironment,
  type CalendarEnvironmentBase,
  type CalendarEvent,
  type CalendarEventIntervalComparators,
  type CalendarEventIntervalOf,
  type CalendarPolicy,
  type CalendarResource,
  type CalendarViewDefinition,
  type EventAdapter,
  type FloatingCalendarEvent,
  type TimedCalendarEvent,
} from "../src/index.ts";

declare const apiEventIdBrand: unique symbol;
declare const roomIdBrand: unique symbol;

type ApiEventId = string & { readonly [apiEventIdBrand]: "ApiEventId" };
type RoomId = number & { readonly [roomIdBrand]: "RoomId" };

interface ApiEvent {
  readonly endsAt: Temporal.Instant;
  readonly id: ApiEventId;
  readonly revision: number;
  readonly roomIds: readonly RoomId[];
  readonly startsAt: Temporal.Instant;
  readonly summary: string;
  readonly timeZone: string;
}

interface Room {
  readonly capacity: number;
  readonly id: RoomId;
  readonly name: string;
}

const applicationEventAdapter = defineEventAdapter<ApiEvent>()({
  getId: (event) => event.id,
  getInterval: (event) => ({
    end: event.endsAt,
    kind: "timed",
    sourceTimeZone: event.timeZone,
    start: event.startsAt,
  }),
  getResourceIds: (event) => event.roomIds,
  getRevision: (event) => event.revision,
  getTitle: (event) => event.summary,
});

const numericComparators: CalendarEventIntervalComparators<number, number, number> = {
  instant: (left, right) => left - right,
  plainDate: (left, right) => left - right,
  plainDateTime: (left, right) => left - right,
};

function validateNumericInterval<TInterval extends CalendarEventIntervalOf<number, number, number>>(
  interval: TInterval,
) {
  return validateCalendarEventInterval(interval, numericComparators);
}

describe("canonical contracts", () => {
  test("allows non-empty string and finite numeric IDs, including branded IDs", () => {
    expect(isEventId("event-1")).toBe(true);
    expect(isEventId(0)).toBe(true);
    expect(isResourceId("room-1")).toBe(true);
    expect(isResourceId(12)).toBe(true);

    expect(isEventId("")).toBe(false);
    expect(isEventId(Number.NaN)).toBe(false);
    expect(isResourceId(Number.POSITIVE_INFINITY)).toBe(false);
    expect(isResourceId(false)).toBe(false);

    expectTypeOf<ApiEventId>().toExtend<string>();
    expectTypeOf<RoomId>().toExtend<number>();
  });

  test("preserves application-native event and resource generics", () => {
    expectTypeOf(applicationEventAdapter).toEqualTypeOf<
      EventAdapter<ApiEvent, ApiEventId, RoomId>
    >();
    expectTypeOf<CalendarResource<Room, RoomId>["id"]>().toEqualTypeOf<RoomId>();
    expectTypeOf<CalendarPolicy<ApiEvent, Room, RoomId>>().toBeFunction();
  });

  test("provides an identity adapter for every canonical event variant", () => {
    type EventData = { readonly color: string };
    type CanonicalEvent = CalendarEvent<EventData, ApiEventId, RoomId>;

    expectTypeOf<
      ReturnType<typeof createCanonicalEventAdapter<EventData, ApiEventId, RoomId>>
    >().toEqualTypeOf<EventAdapter<CanonicalEvent, ApiEventId, RoomId>>();
    expectTypeOf<Extract<CanonicalEvent, { kind: "timed" }>>().toEqualTypeOf<
      TimedCalendarEvent<EventData, ApiEventId, RoomId>
    >();
    expectTypeOf<Extract<CanonicalEvent, { kind: "all-day" }>>().toEqualTypeOf<
      AllDayCalendarEvent<EventData, ApiEventId, RoomId>
    >();
    expectTypeOf<Extract<CanonicalEvent, { kind: "floating" }>>().toEqualTypeOf<
      FloatingCalendarEvent<EventData, ApiEventId, RoomId>
    >();
  });

  test("validates non-empty intervals for all three event variants", () => {
    const timed = validateNumericInterval({ end: 2, kind: "timed", start: 1 });

    expect(timed).toMatchObject({ valid: true });
    if (timed.valid) {
      expectTypeOf(timed.value.kind).toEqualTypeOf<"timed">();
    }
    expect(validateNumericInterval({ end: 2, kind: "all-day", start: 1 })).toMatchObject({
      valid: true,
    });
    expect(validateNumericInterval({ end: 2, kind: "floating", start: 1 })).toMatchObject({
      valid: true,
    });
  });

  test("reports empty and reversed event intervals explicitly", () => {
    expect(validateNumericInterval({ end: 1, kind: "timed", start: 1 })).toEqual({
      issues: [{ code: "start-not-before-end", kind: "timed" }],
      valid: false,
    });
    expect(validateNumericInterval({ end: 2, kind: "all-day", start: 3 })).toEqual({
      issues: [{ code: "start-not-before-end", kind: "all-day" }],
      valid: false,
    });
    expect(validateNumericInterval({ end: 4, kind: "floating", start: 4 })).toEqual({
      issues: [{ code: "start-not-before-end", kind: "floating" }],
      valid: false,
    });
  });

  test("keeps environment now sources mutually exclusive", () => {
    type InvalidNowSources = CalendarEnvironmentBase & {
      readonly clock: CalendarClock;
      readonly now: Temporal.Instant;
    };
    type BothSourcesAreRejected = InvalidNowSources extends CalendarEnvironment ? false : true;

    expectTypeOf<BothSourcesAreRejected>().toEqualTypeOf<true>();
  });

  test("keeps renderer ownership generic and framework independent", () => {
    interface RenderBoundary {
      render(): unknown;
    }
    type Definition = CalendarViewDefinition<
      "week",
      { readonly days: number },
      { readonly revision: number },
      { readonly columns: number },
      { readonly current: string },
      { readonly next: string },
      { readonly x: number },
      { readonly column: number },
      RenderBoundary
    >;

    expectTypeOf<Definition["Renderer"]>().toEqualTypeOf<RenderBoundary>();
    expectTypeOf<Definition["strategy"]["name"]>().toEqualTypeOf<"week">();
  });
});
