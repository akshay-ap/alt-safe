import { afterEach, describe, expect, it, vi } from "vitest";
import { ADDRESS_FORMAT_KEY, readAddressFormat, subscribeAddressFormat, writeAddressFormat } from "./addressFormat";

afterEach(() => localStorage.clear());

describe("address format setting", () => {
  it("groups addresses by default", () => {
    expect(readAddressFormat()).toBe("grouped");
  });

  it("remembers the chosen format", () => {
    writeAddressFormat("plain");
    expect(readAddressFormat()).toBe("plain");
    writeAddressFormat("grouped");
    expect(readAddressFormat()).toBe("grouped");
  });

  it("falls back to grouped for anything unexpected in storage", () => {
    localStorage.setItem(ADDRESS_FORMAT_KEY, "{broken");
    expect(readAddressFormat()).toBe("grouped");
    localStorage.setItem(ADDRESS_FORMAT_KEY, JSON.stringify("spaced"));
    expect(readAddressFormat()).toBe("grouped");
  });

  it("notifies subscribers of changes here and in other tabs until unsubscribed", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeAddressFormat(listener);

    writeAddressFormat("plain");
    window.dispatchEvent(new StorageEvent("storage", { key: ADDRESS_FORMAT_KEY }));
    window.dispatchEvent(new StorageEvent("storage", { key: "unrelated" }));
    unsubscribe();
    writeAddressFormat("grouped");

    expect(listener).toHaveBeenCalledTimes(2);
  });
});
