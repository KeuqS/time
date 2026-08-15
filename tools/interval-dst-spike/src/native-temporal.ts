interface NativeInstant {
  readonly epochNanoseconds: bigint;
  toString(): string;
}

interface NativePlainDateTime {
  add(duration: { readonly minutes: number }): NativePlainDateTime;
  equals(other: NativePlainDateTime): boolean;
  toString(options?: { readonly smallestUnit: "minute" }): string;
  toZonedDateTime(
    timeZone: string,
    options: { readonly disambiguation: "compatible" | "earlier" | "later" | "reject" },
  ): NativeZonedDateTime;
}

interface NativeZonedDateTime {
  readonly offset: string;
  toInstant(): NativeInstant;
  toPlainDateTime(): NativePlainDateTime;
}

interface NativeTemporalNamespace {
  readonly PlainDateTime: {
    from(value: string): NativePlainDateTime;
  };
}

const { Temporal } = globalThis as unknown as { readonly Temporal: NativeTemporalNamespace };

export type WallTimeKind = "unique" | "gap" | "fold";

export interface WallTimeOccurrence {
  readonly instant: string;
  readonly epochNanoseconds: string;
  readonly offset: string;
}

export interface WallTimeResolution {
  readonly kind: WallTimeKind;
  readonly occurrences: readonly WallTimeOccurrence[];
  readonly shiftedEarlier?: {
    readonly instant: string;
    readonly wallTime: string;
    readonly offset: string;
  };
  readonly shiftedLater?: {
    readonly instant: string;
    readonly wallTime: string;
    readonly offset: string;
  };
}

export interface ZonedWallSlot extends WallTimeResolution {
  readonly wallStart: string;
  readonly wallEnd: string;
  readonly startMinute: number;
  readonly endMinute: number;
}

export interface ZonedDayGeometry {
  readonly date: string;
  readonly timeZone: string;
  readonly slotMinutes: number;
  readonly physicalMinutes: number;
  readonly slots: readonly ZonedWallSlot[];
}

function occurrence(zoned: NativeZonedDateTime): WallTimeOccurrence {
  const instant = zoned.toInstant();

  return {
    instant: instant.toString(),
    epochNanoseconds: instant.epochNanoseconds.toString(),
    offset: zoned.offset,
  };
}

function shifted(zoned: NativeZonedDateTime): {
  readonly instant: string;
  readonly wallTime: string;
  readonly offset: string;
} {
  return {
    instant: zoned.toInstant().toString(),
    wallTime: zoned.toPlainDateTime().toString({ smallestUnit: "minute" }),
    offset: zoned.offset,
  };
}

/**
 * Resolves wall-time cardinality using only current public Temporal operations.
 * This intentionally avoids the removed Temporal.TimeZone type: round-tripping
 * `earlier` and `later` distinguishes gaps (neither matches), unique times
 * (both map to one instant), and folds (both match distinct instants).
 */
export function resolveWallTime(
  wallTime: NativePlainDateTime,
  timeZone: string,
): WallTimeResolution {
  const earlier = wallTime.toZonedDateTime(timeZone, { disambiguation: "earlier" });
  const later = wallTime.toZonedDateTime(timeZone, { disambiguation: "later" });
  const earlierRoundTrips = earlier.toPlainDateTime().equals(wallTime);
  const laterRoundTrips = later.toPlainDateTime().equals(wallTime);

  if (!earlierRoundTrips && !laterRoundTrips) {
    return {
      kind: "gap",
      occurrences: [],
      shiftedEarlier: shifted(earlier),
      shiftedLater: shifted(later),
    };
  }

  const earlierOccurrence = occurrence(earlier);
  const laterOccurrence = occurrence(later);

  if (earlierOccurrence.epochNanoseconds !== laterOccurrence.epochNanoseconds) {
    return {
      kind: "fold",
      occurrences: [earlierOccurrence, laterOccurrence],
    };
  }

  return { kind: "unique", occurrences: [earlierOccurrence] };
}

export function buildZonedDayGeometry(
  date: string,
  timeZone: string,
  slotMinutes = 30,
): ZonedDayGeometry {
  if (!Number.isInteger(slotMinutes) || slotMinutes <= 0 || 1_440 % slotMinutes !== 0) {
    throw new RangeError("slotMinutes must be a positive integer divisor of 1,440");
  }

  const dayStart = Temporal.PlainDateTime.from(`${date}T00:00`);
  const nextDayStart = dayStart.add({ minutes: 1_440 });
  const startInstant = dayStart
    .toZonedDateTime(timeZone, { disambiguation: "compatible" })
    .toInstant();
  const endInstant = nextDayStart
    .toZonedDateTime(timeZone, { disambiguation: "compatible" })
    .toInstant();
  const slots: ZonedWallSlot[] = [];

  for (let startMinute = 0; startMinute < 1_440; startMinute += slotMinutes) {
    const wallStart = dayStart.add({ minutes: startMinute });
    const wallEnd = wallStart.add({ minutes: slotMinutes });

    slots.push({
      wallStart: wallStart.toString({ smallestUnit: "minute" }),
      wallEnd: wallEnd.toString({ smallestUnit: "minute" }),
      startMinute,
      endMinute: startMinute + slotMinutes,
      ...resolveWallTime(wallStart, timeZone),
    });
  }

  return {
    date,
    timeZone,
    slotMinutes,
    physicalMinutes: Number(
      (endInstant.epochNanoseconds - startInstant.epochNanoseconds) / 60_000_000_000n,
    ),
    slots,
  };
}
