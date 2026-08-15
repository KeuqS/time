export type CalendarEntityId = string | number;
export type EventId = CalendarEntityId;
export type ResourceId = CalendarEntityId;

function isCalendarEntityId(value: unknown): value is CalendarEntityId {
  return (
    (typeof value === "string" && value.length > 0) ||
    (typeof value === "number" && Number.isFinite(value))
  );
}

export function isEventId(value: unknown): value is EventId {
  return isCalendarEntityId(value);
}

export function isResourceId(value: unknown): value is ResourceId {
  return isCalendarEntityId(value);
}
