import { describe, expect, it } from "vitest";
import type { SafeAccount } from "../context/types";
import { upsertSafeAccount } from "./safeAccounts";

const SAFE = "0xC2928299072B9918a6d62a2309b18b71b0c2Fbe5";
const OTHER = "0x3C46Bd45eB70E441aedeefE568C0322CFA4fE17A";
const SEPOLIA = 11155111;
const MAINNET = 1;

const saved = (overrides: Partial<SafeAccount> = {}): SafeAccount => ({
  address: SAFE,
  chainIds: [SEPOLIA],
  name: "Treasury",
  labels: ["ops"],
  ...overrides,
});

describe("upsertSafeAccount", () => {
  it("adds a new Safe", () => {
    const result = upsertSafeAccount([], { address: SAFE, chainId: SEPOLIA, name: "Treasury", labels: [] });
    expect(result).toEqual({
      status: "added",
      accounts: [{ address: SAFE, chainIds: [SEPOLIA], name: "Treasury", labels: [] }],
    });
  });

  it("adds the network to a Safe saved on another network, keeping its position", () => {
    const other = saved({ address: OTHER });
    const result = upsertSafeAccount([saved(), other], { address: SAFE, chainId: MAINNET, name: "", labels: [] });

    expect(result.status).toBe("network-added");
    expect(result.accounts).toEqual([saved({ chainIds: [SEPOLIA, MAINNET] }), other]);
  });

  it("replaces name and labels when new ones are given for an added network", () => {
    const result = upsertSafeAccount([saved()], { address: SAFE, chainId: MAINNET, name: "Main", labels: ["x"] });
    expect(result.accounts[0]).toMatchObject({ name: "Main", labels: ["x"] });
  });

  it("matches addresses regardless of letter case", () => {
    const result = upsertSafeAccount([saved()], {
      address: SAFE.toLowerCase() as `0x${string}`,
      chainId: SEPOLIA,
      name: "",
      labels: [],
    });
    expect(result.status).toBe("exists");
  });

  it("leaves the list unchanged when the Safe is already saved for the network", () => {
    const accounts = [saved()];
    const result = upsertSafeAccount(accounts, { address: SAFE, chainId: SEPOLIA, name: "New", labels: [] });
    expect(result).toEqual({ status: "exists", accounts });
  });
});
