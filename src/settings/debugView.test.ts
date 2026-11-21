import { afterEach, describe, expect, it, vi } from "vitest";
import { readShowDebugView, SHOW_DEBUG_VIEW_KEY, subscribeShowDebugView, writeShowDebugView } from "./debugView";

afterEach(() => localStorage.clear());

describe("debug view setting", () => {
  it("is off by default", () => {
    expect(readShowDebugView()).toBe(false);
  });

  it("remembers the choice", () => {
    writeShowDebugView(true);
    expect(readShowDebugView()).toBe(true);
    writeShowDebugView(false);
    expect(readShowDebugView()).toBe(false);
  });

  it("stays off for anything unexpected in storage", () => {
    localStorage.setItem(SHOW_DEBUG_VIEW_KEY, "{broken");
    expect(readShowDebugView()).toBe(false);
    localStorage.setItem(SHOW_DEBUG_VIEW_KEY, JSON.stringify("true"));
    expect(readShowDebugView()).toBe(false);
  });

  it("notifies subscribers of changes here and in other tabs until unsubscribed", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeShowDebugView(listener);

    writeShowDebugView(true);
    window.dispatchEvent(new StorageEvent("storage", { key: SHOW_DEBUG_VIEW_KEY }));
    window.dispatchEvent(new StorageEvent("storage", { key: "unrelated" }));
    unsubscribe();
    writeShowDebugView(false);

    expect(listener).toHaveBeenCalledTimes(2);
  });
});
