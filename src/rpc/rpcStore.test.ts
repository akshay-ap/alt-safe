import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getRpcUrl,
  isValidRpcUrl,
  RPC_URLS_KEY,
  readRpcUrls,
  removeRpcUrl,
  setRpcUrl,
  subscribeRpcUrls,
} from "./rpcStore";

const SEPOLIA = 11155111;
const MAINNET = 1;
const randomUrl = () => `https://rpc-${Math.random().toString(36).slice(2)}.example.org/v1`;

afterEach(() => localStorage.clear());

describe("isValidRpcUrl", () => {
  it.each(["https://rpc.example.org", "http://localhost:8545", "https://a.b/c?key=1"])("accepts %s", (url) => {
    expect(isValidRpcUrl(url)).toBe(true);
  });

  it.each(["", "   ", "rpc.example.org", "ftp://rpc.example.org", "wss://rpc.example.org", "javascript:alert(1)"])(
    "rejects %j",
    (url) => {
      expect(isValidRpcUrl(url)).toBe(false);
    },
  );
});

describe("per-chain RPC URLs", () => {
  it("returns undefined for a chain without a stored URL", () => {
    expect(getRpcUrl(SEPOLIA)).toBeUndefined();
  });

  it("stores URLs independently per chain", () => {
    const [sepoliaUrl, mainnetUrl] = [randomUrl(), randomUrl()];
    setRpcUrl(SEPOLIA, sepoliaUrl);
    setRpcUrl(MAINNET, mainnetUrl);

    expect(getRpcUrl(SEPOLIA)).toBe(sepoliaUrl);
    expect(getRpcUrl(MAINNET)).toBe(mainnetUrl);
    expect(readRpcUrls()).toEqual({ [SEPOLIA]: sepoliaUrl, [MAINNET]: mainnetUrl });
  });

  it("trims URLs before storing them", () => {
    const url = randomUrl();
    setRpcUrl(SEPOLIA, `  ${url} `);
    expect(getRpcUrl(SEPOLIA)).toBe(url);
  });

  it("refuses to store an invalid URL", () => {
    expect(() => setRpcUrl(SEPOLIA, "not a url")).toThrow();
    expect(getRpcUrl(SEPOLIA)).toBeUndefined();
  });

  it("removes a single chain's URL", () => {
    const url = randomUrl();
    setRpcUrl(SEPOLIA, url);
    setRpcUrl(MAINNET, url);
    removeRpcUrl(SEPOLIA);

    expect(getRpcUrl(SEPOLIA)).toBeUndefined();
    expect(getRpcUrl(MAINNET)).toBe(url);
  });

  it("ignores corrupted storage instead of throwing", () => {
    localStorage.setItem(RPC_URLS_KEY, "{not json");
    expect(readRpcUrls()).toEqual({});
  });

  it("drops stored entries that are not valid URLs", () => {
    localStorage.setItem(RPC_URLS_KEY, JSON.stringify({ [SEPOLIA]: "nope", [MAINNET]: "https://ok.example.org" }));
    expect(readRpcUrls()).toEqual({ [MAINNET]: "https://ok.example.org" });
  });
});

describe("subscribeRpcUrls", () => {
  it("notifies listeners on change until unsubscribed", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeRpcUrls(listener);

    setRpcUrl(SEPOLIA, randomUrl());
    removeRpcUrl(SEPOLIA);
    unsubscribe();
    setRpcUrl(SEPOLIA, randomUrl());

    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("notifies listeners when another tab changes the URLs", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeRpcUrls(listener);

    window.dispatchEvent(new StorageEvent("storage", { key: RPC_URLS_KEY }));
    window.dispatchEvent(new StorageEvent("storage", { key: "unrelated" }));
    unsubscribe();

    expect(listener).toHaveBeenCalledTimes(1);
  });
});
