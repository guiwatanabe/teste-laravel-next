import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Radix UI primitives (Select, Dialog, etc.) call these APIs which jsdom does not implement.
Element.prototype.scrollIntoView = () => {};
Element.prototype.hasPointerCapture = () => false;
Element.prototype.releasePointerCapture = () => {};

if (!window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

afterEach(() => {
  cleanup();
});
