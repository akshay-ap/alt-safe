import { describe, expect, it } from "vitest";
import bundledSpecs from "../context/TransactionSpecs";
import type { TransactionGroupSpec, TransactionSpec } from "../context/types";
import { buildActionCatalog, ENCODE_FUNCTION_CALL, groupProtocols, protocolLabel } from "./actionCatalog";

const action = (name: string) => ({ name }) as TransactionSpec;
const group = (groupName: string, chainIds: number[], actions: string[]) =>
  ({ groupName, chainIds, actions: actions.map(action) }) as TransactionGroupSpec;

const SPECS = [
  group("Native", [0], ["ETH Transfer"]),
  group("ERC-20", [0], ["Transfer", "Approve"]),
  group("Aave", [1], ["Supply"]),
];
const SEPOLIA = 11155111;
const names = (sections: { group: string; actions: string[] }[]) =>
  sections.map(({ group, actions }) => ({ group, actions }));

describe("buildActionCatalog", () => {
  it("lists every action of the groups available on the network, then Encode Function Call", () => {
    expect(names(buildActionCatalog(SPECS, SEPOLIA, ""))).toEqual([
      { group: "Native", actions: ["ETH Transfer"] },
      { group: "ERC-20", actions: ["Transfer", "Approve"] },
      { group: ENCODE_FUNCTION_CALL.group, actions: ENCODE_FUNCTION_CALL.actions },
    ]);
  });

  it("includes groups limited to the connected chain", () => {
    expect(buildActionCatalog(SPECS, 1, "").map((section) => section.group)).toContain("Aave");
  });

  it("matches a query against action names, case-insensitively", () => {
    expect(names(buildActionCatalog(SPECS, SEPOLIA, "approve"))).toEqual([{ group: "ERC-20", actions: ["Approve"] }]);
  });

  it("keeps all of a group's actions when the query matches the group name", () => {
    expect(names(buildActionCatalog(SPECS, SEPOLIA, " erc "))).toEqual([
      { group: "ERC-20", actions: ["Transfer", "Approve"] },
    ]);
  });

  it("matches a query against the label shown on the card, not only the template name", () => {
    const groupsFor = (query: string) =>
      buildActionCatalog(bundledSpecs, SEPOLIA, query).map((section) => section.group);
    expect(groupsFor("Safe settings")).toEqual(["Settings"]);
    expect(groupsFor("native token")).toEqual(["Native"]);
  });

  it("returns nothing when no group or action matches", () => {
    expect(buildActionCatalog(SPECS, SEPOLIA, "uniswap")).toEqual([]);
  });

  it("treats an unknown chain as one where only all-chain groups apply", () => {
    expect(buildActionCatalog(SPECS, undefined, "").map((section) => section.group)).not.toContain("Aave");
  });
});

describe("groupProtocols", () => {
  it("puts the bundled templates under Tokens, DeFi and Safe & advanced, in that order", () => {
    const groups = groupProtocols(buildActionCatalog(bundledSpecs, SEPOLIA, ""));
    expect(groups.map((group) => [group.heading, group.sections.map((section) => section.group)])).toEqual([
      ["Tokens", ["Native", "ERC-20", "WETH"]],
      ["DeFi", ["ERC-4626", "Aave"]],
      ["Safe & advanced", ["Contract call", "Settings", "Custom call"]],
    ]);
  });

  it("keeps templates with an unknown tag instead of dropping them", () => {
    const groups = groupProtocols([{ group: "Lending X", actions: ["Lend"], tag: "Lending" }]);
    expect(groups).toEqual([
      { heading: "Safe & advanced", sections: [{ group: "Lending X", actions: ["Lend"], tag: "Lending" }] },
    ]);
  });

  it("omits empty headings", () => {
    expect(groupProtocols([]).length).toBe(0);
  });

  it("carries the template's logo letter", () => {
    const erc20 = buildActionCatalog(bundledSpecs, SEPOLIA, "").find((section) => section.group === "ERC-20");
    expect(erc20?.logo).toBe("T");
  });
});

describe("protocolLabel", () => {
  it("gives a clearer label to a few templates and keeps the rest", () => {
    expect(protocolLabel("Settings")).toBe("Safe settings");
    expect(protocolLabel("Native")).toBe("Native token");
    expect(protocolLabel("ERC-4626")).toBe("ERC-4626");
  });
});
