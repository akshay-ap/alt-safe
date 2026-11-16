import { describe, expect, it } from "vitest";
import type { TransactionGroupSpec, TransactionSpec } from "../context/types";
import { buildActionCatalog, ENCODE_FUNCTION_CALL } from "./actionCatalog";

const action = (name: string) => ({ name }) as TransactionSpec;
const group = (groupName: string, chainIds: number[], actions: string[]) =>
  ({ groupName, chainIds, actions: actions.map(action) }) as TransactionGroupSpec;

const SPECS = [
  group("Native", [0], ["ETH Transfer"]),
  group("ERC-20", [0], ["Transfer", "Approve"]),
  group("Aave", [1], ["Supply"]),
];
const SEPOLIA = 11155111;

describe("buildActionCatalog", () => {
  it("lists every action of the groups available on the network, then Encode Function Call", () => {
    expect(buildActionCatalog(SPECS, SEPOLIA, "")).toEqual([
      { group: "Native", actions: ["ETH Transfer"] },
      { group: "ERC-20", actions: ["Transfer", "Approve"] },
      ENCODE_FUNCTION_CALL,
    ]);
  });

  it("includes groups limited to the connected chain", () => {
    expect(buildActionCatalog(SPECS, 1, "").map((section) => section.group)).toContain("Aave");
  });

  it("matches a query against action names, case-insensitively", () => {
    expect(buildActionCatalog(SPECS, SEPOLIA, "approve")).toEqual([{ group: "ERC-20", actions: ["Approve"] }]);
  });

  it("keeps all of a group's actions when the query matches the group name", () => {
    expect(buildActionCatalog(SPECS, SEPOLIA, " erc ")).toEqual([
      { group: "ERC-20", actions: ["Transfer", "Approve"] },
    ]);
  });

  it("returns nothing when no group or action matches", () => {
    expect(buildActionCatalog(SPECS, SEPOLIA, "uniswap")).toEqual([]);
  });

  it("treats an unknown chain as one where only all-chain groups apply", () => {
    expect(buildActionCatalog(SPECS, undefined, "").map((section) => section.group)).not.toContain("Aave");
  });
});
