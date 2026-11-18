import { describe, expect, it } from "vitest";
import { orderChainsForRpcList } from "./rpcListOrder";

const chains = [{ id: 1 }, { id: 10 }, { id: 100 }, { id: 11155111 }, { id: 8453 }];

describe("orderChainsForRpcList", () => {
  it("lists the current network, then networks with a saved RPC, then the rest, each in original order", () => {
    const ordered = orderChainsForRpcList(chains, new Set([8453, 10]), 11155111);
    expect(ordered.map((chain) => chain.id)).toEqual([11155111, 10, 8453, 1, 100]);
  });

  it("does not repeat the current network when it also has a saved RPC", () => {
    const ordered = orderChainsForRpcList(chains, new Set([11155111]), 11155111);
    expect(ordered.map((chain) => chain.id)).toEqual([11155111, 1, 10, 100, 8453]);
  });

  it("keeps every network exactly once", () => {
    expect(orderChainsForRpcList(chains, new Set([1, 100]), 999)).toHaveLength(chains.length);
  });
});
