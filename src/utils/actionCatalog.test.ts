import { describe, expect, it } from "vitest";
import bundledSpecs from "../context/TransactionSpecs";
import type { TransactionGroupSpec, TransactionSpec } from "../context/types";
import { availableQuickActions, buildActionCatalog, ENCODE_FUNCTION_CALL, QUICK_ACTIONS } from "./actionCatalog";

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

describe("availableQuickActions", () => {
  it("offers only quick actions whose template is available", () => {
    const sections = buildActionCatalog(SPECS, SEPOLIA, "");
    expect(availableQuickActions(sections).map((quick) => quick.title)).toEqual([
      "Send native token",
      "Send tokens",
      "Call a contract",
    ]);
    expect(availableQuickActions([ENCODE_FUNCTION_CALL]).map((quick) => quick.title)).toEqual(["Call a contract"]);
  });

  it("matches the bundled templates, so renaming a template cannot silently hide a tile", () => {
    const sections = buildActionCatalog(bundledSpecs, SEPOLIA, "");
    expect(availableQuickActions(sections)).toEqual(QUICK_ACTIONS);
  });
});
