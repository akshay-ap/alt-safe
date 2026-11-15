import { STORAGE_KEY, WALLET_STORAGE_KEY } from "../constants";

export type RpcUrls = Record<number, string>;

// Same `<prefix>.<key>` + JSON layout as wagmi's createStorage, so "Clear app state" removes it too.
export const RPC_URLS_KEY = `${WALLET_STORAGE_KEY}.${STORAGE_KEY.RPC_URLS}`;

const listeners = new Set<() => void>();

export const isValidRpcUrl = (url: string): boolean => {
  try {
    const { protocol } = new URL(url.trim());
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
};

const parseJson = (raw: string | null): unknown => {
  if (raw === null) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
};

export const readRpcUrls = (): RpcUrls => {
  const stored = parseJson(localStorage.getItem(RPC_URLS_KEY));
  if (!stored || typeof stored !== "object") return {};
  const entries = Object.entries(stored).filter(
    (entry): entry is [string, string] => typeof entry[1] === "string" && isValidRpcUrl(entry[1]),
  );
  return Object.fromEntries(entries.map(([chainId, url]) => [Number(chainId), url]));
};

const writeRpcUrls = (urls: RpcUrls) => {
  localStorage.setItem(RPC_URLS_KEY, JSON.stringify(urls));
  for (const listener of listeners) listener();
};

export const getRpcUrl = (chainId: number): string | undefined => readRpcUrls()[chainId];

export const setRpcUrl = (chainId: number, url: string) => {
  if (!isValidRpcUrl(url)) throw new Error(`Invalid RPC URL: ${url}`);
  writeRpcUrls({ ...readRpcUrls(), [chainId]: url.trim() });
};

export const removeRpcUrl = (chainId: number) => {
  const { [chainId]: _removed, ...rest } = readRpcUrls();
  writeRpcUrls(rest);
};

export const subscribeRpcUrls = (listener: () => void): (() => void) => {
  const onStorage = (event: StorageEvent) => {
    if (event.key === RPC_URLS_KEY || event.key === null) listener();
  };
  listeners.add(listener);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
};
