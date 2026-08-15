export const RESOURCE_COUNT = 500;
export const TIME_SLOT_COUNT = 14 * 24;
export const ROW_HEIGHT = 38.5;
export const TIME_SLOT_WIDTH = 96.25;
export const RESOURCE_AXIS_WIDTH = 200;
export const TIME_AXIS_HEIGHT = 52;
export const INITIAL_VIEWPORT_RECT = Object.freeze({ width: 900, height: 520 });

export interface LabResource {
  readonly id: string;
  readonly title: string;
  readonly zone: string;
}

export interface TimeSlot {
  readonly id: string;
  readonly label: string;
  readonly day: number;
  readonly hour: number;
}

export function createResources(count = RESOURCE_COUNT): readonly LabResource[] {
  return Object.freeze(
    Array.from({ length: count }, (_, index) => {
      const number = index + 1;
      return Object.freeze({
        id: `resource-${number.toString().padStart(3, "0")}`,
        title: `Bay ${number.toString().padStart(3, "0")}`,
        zone: `Z${(index % 8) + 1}`,
      });
    }),
  );
}

export function createTimeSlots(count = TIME_SLOT_COUNT): readonly TimeSlot[] {
  return Object.freeze(
    Array.from({ length: count }, (_, index) => {
      const day = Math.floor(index / 24) + 1;
      const hour = index % 24;
      return Object.freeze({
        id: `slot-${index.toString().padStart(3, "0")}`,
        label: `D${day.toString().padStart(2, "0")} · ${hour.toString().padStart(2, "0")}:00`,
        day,
        hour,
      });
    }),
  );
}

export const LAB_RESOURCES = createResources();
export const LAB_TIME_SLOTS = createTimeSlots();
