# Semantic dnd-kit adapter spike

This private workspace is the disposable experiment for issue #19. It pins the current dnd-kit 0.x line and tests a replaceable adapter; it is not a production package or a competing package topology.

## What it proves

- `CalendarDragProvider` owns provider setup, pointer/touch/keyboard activation, restriction, overlay, accessibility announcements, and cancellation.
- `CalendarViewRegion` registers one droppable surface for a whole view.
- `CalendarViewRegionGeometry` maps pointer and keyboard input into the same snapped placement without scanning slots or resources.
- `CalendarSemanticDragSession` keeps pointer movement out of React state and emits one calendar-owned change only on a successful drop.
- `CalendarRafAutoScroller` collapses pointer bursts to one rAF and one geometry read per frame.
- No exported module type mentions dnd-kit.

## Reproduce

From the repository root:

```sh
vp install
vp run @moltenship/dnd-adapter-spike#test
vp run @moltenship/dnd-adapter-spike#trace
vp run @moltenship/dnd-adapter-spike#build
vp check
```

The trace prints an `INTERACTION_TRACE` JSON record. The checked-in result and machine metadata are in [`artifacts/interaction-trace.json`](./artifacts/interaction-trace.json).

## Evidence boundary

The integration trace uses React 19's Profiler and dnd-kit's real manager/plugins in happy-dom. Its timing is useful for relative regression detection but is not a production browser frame measurement. Web Animations and individual CSS transform properties are shimmed because happy-dom does not implement them. Issue #37 must add production-browser pointer, touch, keyboard, focus, and assistive-technology evidence before the phase gate.
