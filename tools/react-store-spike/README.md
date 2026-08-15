# React store spike

This disposable Phase 0 experiment retires the controlled-state, hydration, root-isolation, and generic-factory risks tracked by GitHub issue #18. It deliberately lives under `tools/` and does not establish the future `calendar-react` production package topology owned by issue #13.

Run the evidence locally:

```sh
vp run @moltenship/react-store-spike#check
vp run @moltenship/react-store-spike#test
vp run @moltenship/react-store-spike#test:ssr
vp run @moltenship/react-store-spike#build
```

The public experiment entry point is `src/index.ts`. Jotai atoms and its vanilla store are private to `src/store.ts`; consumers and custom views receive only the calendar-owned `{ state, actions, meta }` contract. The production build fails if its emitted declaration names Jotai, `any`, or `unknown`, or if the typed consumer proof introduces a cast.
