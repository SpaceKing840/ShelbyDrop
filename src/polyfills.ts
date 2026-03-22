import { Buffer } from "buffer";

(window as unknown as Record<string, unknown>).Buffer = Buffer;
(globalThis as unknown as Record<string, unknown>).Buffer = Buffer;

// Polyfill process for Node.js dependencies used in the browser
if (typeof globalThis.process === "undefined") {
  (globalThis as unknown as Record<string, unknown>).process = {
    env: {},
    version: "",
    nextTick: (fn: () => void) => setTimeout(fn, 0),
  };
}
