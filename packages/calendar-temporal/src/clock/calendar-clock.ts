import type { Temporal } from "../temporal.ts";

export interface CalendarClock {
  instant(): Temporal.Instant;
}

export function createFixedClock(instant: Temporal.Instant): CalendarClock {
  return Object.freeze({ instant: () => instant });
}

interface NativeTemporalNow {
  readonly Now: {
    instant(): Temporal.Instant;
  };
}

export function createSystemClock(): CalendarClock {
  return Object.freeze({
    instant: () =>
      (globalThis as typeof globalThis & { Temporal: NativeTemporalNow }).Temporal.Now.instant(),
  });
}
