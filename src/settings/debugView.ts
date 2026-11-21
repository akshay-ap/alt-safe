import { useSyncExternalStore } from "react";
import { STORAGE_KEY, WALLET_STORAGE_KEY } from "../constants";

// Same `<prefix>.<key>` + JSON layout as the app's other settings, so "Clear app data" resets it.
export const SHOW_DEBUG_VIEW_KEY = `${WALLET_STORAGE_KEY}.${STORAGE_KEY.SHOW_DEBUG_VIEW}`;

const listeners = new Set<() => void>();

/** Off unless the user turned it on; anything unreadable counts as off. */
export const readShowDebugView = (): boolean => {
  try {
    return JSON.parse(localStorage.getItem(SHOW_DEBUG_VIEW_KEY) ?? "false") === true;
  } catch {
    return false;
  }
};

export const writeShowDebugView = (show: boolean) => {
  localStorage.setItem(SHOW_DEBUG_VIEW_KEY, JSON.stringify(show));
  for (const listener of listeners) listener();
};

export const subscribeShowDebugView = (listener: () => void) => {
  const onStorage = (event: StorageEvent) => {
    if (event.key === SHOW_DEBUG_VIEW_KEY || event.key === null) listener();
  };
  listeners.add(listener);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
};

export const useShowDebugView = () => useSyncExternalStore(subscribeShowDebugView, readShowDebugView);
