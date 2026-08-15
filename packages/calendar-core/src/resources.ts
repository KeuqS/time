import type { ResourceId } from "./ids.ts";

export interface CalendarResource<TData = unknown, TResourceId extends ResourceId = string> {
  readonly data: TData;
  readonly id: TResourceId;
  readonly parentId?: TResourceId;
  readonly title: string;
}
