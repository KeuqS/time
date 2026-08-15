import { afterEach } from "vite-plus/test";

Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", {
  configurable: true,
  value: true,
});

class TestResizeObserver implements ResizeObserver {
  disconnect() {}

  observe() {}

  unobserve() {}
}

Object.defineProperty(globalThis, "ResizeObserver", {
  configurable: true,
  value: TestResizeObserver,
});

Object.defineProperty(globalThis, "requestAnimationFrame", {
  configurable: true,
  value: (callback: FrameRequestCallback) =>
    setTimeout(() => callback(performance.now()), 0) as unknown as number,
});

Object.defineProperty(globalThis, "cancelAnimationFrame", {
  configurable: true,
  value: (handle: number) => clearTimeout(handle),
});

Object.defineProperty(HTMLElement.prototype, "scrollTo", {
  configurable: true,
  value(this: HTMLElement, options: ScrollToOptions) {
    this.scrollLeft = options.left ?? this.scrollLeft;
    this.scrollTop = options.top ?? this.scrollTop;
    this.dispatchEvent(new Event("scroll"));
  },
});

afterEach(() => {
  delete window.__resourceTimelineSpike;
  document.body.replaceChildren();
});
