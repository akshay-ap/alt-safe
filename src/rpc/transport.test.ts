import { createPublicClient } from "viem";
import { sepolia } from "viem/chains";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setRpcUrl } from "./rpcStore";
import { chainRpcTransport } from "./transport";

const firstUrl = "https://first.example.org/rpc";
const secondUrl = "https://second.example.org/rpc";

const normalize = (url: string) => new URL(url).href;
const requestedUrls = () => vi.mocked(fetch).mock.calls.map(([input]) => normalize(String(input)));

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify({ jsonrpc: "2.0", id: 0, result: "0x10" }), { status: 200 })),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("chainRpcTransport", () => {
  it("falls back to the chain's default public RPC when none is stored", async () => {
    const client = createPublicClient({ chain: sepolia, transport: chainRpcTransport(sepolia.id) });
    await client.getBlockNumber({ cacheTime: 0 });
    expect(requestedUrls()).toEqual([normalize(sepolia.rpcUrls.default.http[0])]);
  });

  it("uses the stored URL and follows later changes without recreating the client", async () => {
    setRpcUrl(sepolia.id, firstUrl);
    const client = createPublicClient({ chain: sepolia, transport: chainRpcTransport(sepolia.id) });

    await client.getBlockNumber({ cacheTime: 0 });
    setRpcUrl(sepolia.id, secondUrl);
    await client.getBlockNumber({ cacheTime: 0 });

    expect(requestedUrls()).toEqual([normalize(firstUrl), normalize(secondUrl)]);
  });
});
