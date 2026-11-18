import { useSyncExternalStore } from "react";
import { STORAGE_KEY, WALLET_STORAGE_KEY } from "../constants";

/** "grouped" prints 0x1234 5678 …; "plain" prints the raw 0x12345678…. */
export type AddressFormat = "grouped" | "plain";

// Same `<prefix>.<key>` + JSON layout as the app's other settings, so "Clear app data" resets it.
export const ADDRESS_FORMAT_KEY = `${WALLET_STORAGE_KEY}.${STORAGE_KEY.ADDRESS_FORMAT}`;

const listeners = new Set<() => void>();

export const readAddressFormat = (): AddressFormat => {
  try {
    return JSON.parse(localStorage.getItem(ADDRESS_FORMAT_KEY) ?? "null") === "plain" ? "plain" : "grouped";
  } catch {
    return "grouped";
  }
};

export const writeAddressFormat = (format: AddressFormat) => {
  localStorage.setItem(ADDRESS_FORMAT_KEY, JSON.stringify(format));
  for (const listener of listeners) listener();
};

export const subscribeAddressFormat = (listener: () => void) => {
  const onStorage = (event: StorageEvent) => {
    if (event.key === ADDRESS_FORMAT_KEY || event.key === null) listener();
  };
  listeners.add(listener);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
};

export const useAddressFormat = () => useSyncExternalStore(subscribeAddressFormat, readAddressFormat);
