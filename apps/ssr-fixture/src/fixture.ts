"use client";

import "@moltenship/calendar";

import { createElement, useId, useState, type ReactNode } from "react";

export interface CalendarFixtureEnvironment {
  readonly locale: string;
  readonly timeZone: string;
  readonly weekStartsOn: 1;
  readonly now: string;
  readonly anchorDate: string;
  readonly identifierPrefix: string;
}

export const deterministicEnvironment: CalendarFixtureEnvironment = {
  locale: "en-GB",
  timeZone: "Asia/Tbilisi",
  weekStartsOn: 1,
  now: "2026-08-15T08:30:00Z",
  anchorDate: "2026-08-15",
  identifierPrefix: "time-ssr-fixture-",
};

export interface DeterministicCalendarFixtureProps {
  readonly environment: CalendarFixtureEnvironment;
}

export function DeterministicCalendarFixture({
  environment,
}: DeterministicCalendarFixtureProps): ReactNode {
  const interactionDescriptionId = useId();
  const [interactionCount, setInteractionCount] = useState(0);

  return createElement(
    "main",
    {
      "data-anchor-date": environment.anchorDate,
      "data-locale": environment.locale,
      "data-time-zone": environment.timeZone,
      "data-week-starts-on": environment.weekStartsOn,
    },
    createElement("h1", null, "Moltenship Time SSR fixture"),
    createElement("span", { "data-environment-locale": true }, environment.locale),
    createElement("time", { dateTime: environment.now }, environment.now),
    createElement("p", { id: interactionDescriptionId }, "Deterministic interaction count"),
    createElement(
      "output",
      { "aria-describedby": interactionDescriptionId, "data-interaction-count": true },
      interactionCount,
    ),
    createElement(
      "button",
      { type: "button", onClick: () => setInteractionCount((count) => count + 1) },
      "Interact",
    ),
  );
}
