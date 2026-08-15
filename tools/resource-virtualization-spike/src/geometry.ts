export interface SnappedPlacement {
  readonly start: number;
  readonly size: number;
}

export function snapToDevicePixel(value: number, devicePixelRatio: number): number {
  const scale = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0 ? devicePixelRatio : 1;
  return Math.round(value * scale) / scale;
}

export function snapPlacement(
  start: number,
  size: number,
  devicePixelRatio: number,
): SnappedPlacement {
  const snappedStart = snapToDevicePixel(start, devicePixelRatio);
  const snappedEnd = snapToDevicePixel(start + size, devicePixelRatio);
  return Object.freeze({
    start: snappedStart,
    size: Math.max(0, snappedEnd - snappedStart),
  });
}

export interface ScrollOffsets {
  readonly inline: number;
  readonly block: number;
}

export type InlineDirection = "ltr" | "rtl";

export function logicalInlineOffset(nativeScrollLeft: number, direction: InlineDirection): number {
  const logicalOffset = direction === "rtl" ? -nativeScrollLeft : nativeScrollLeft;
  return Math.max(0, logicalOffset);
}

export function nativeInlineOffset(logicalOffset: number, direction: InlineDirection): number {
  const clampedOffset = Math.max(0, logicalOffset);
  return direction === "rtl" ? -clampedOffset : clampedOffset;
}

export interface AxisScrollTargets {
  readonly timeAxis: Pick<HTMLElement, "scrollLeft">;
  readonly resourceAxis: Pick<HTMLElement, "scrollTop">;
}

export function synchronizeAxes(targets: AxisScrollTargets, offsets: ScrollOffsets): number {
  targets.timeAxis.scrollLeft = offsets.inline;
  targets.resourceAxis.scrollTop = offsets.block;
  return 2;
}

export function devicePixelError(value: number, devicePixelRatio: number): number {
  const scale = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0 ? devicePixelRatio : 1;
  return Math.abs(value * scale - Math.round(value * scale));
}
