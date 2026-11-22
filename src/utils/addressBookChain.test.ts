import { describe, expect, it } from "vitest";
import type { AddressBookEntry } from "../context/AddressBookContext";
import { ALL_CHAINS, entriesForChain } from "./addressBookChain";

const alice = "0x00000000000000000000000000000000000000A1";
const bob = "0x00000000000000000000000000000000000000B0";

const book: AddressBookEntry[] = [
  { address: alice, name: "Alice (all)", chainId: ALL_CHAINS },
  { address: alice.toLowerCase() as `0x${string}`, name: "Alice on Sepolia", chainId: 11155111 },
  { address: bob, name: "Bob mainnet", chainId: 1 },
];

describe("entriesForChain", () => {
  it("offers all-chain entries on every chain", () => {
    expect(entriesForChain(book, 1).map((e) => e.name)).toEqual(["Bob mainnet", "Alice (all)"]);
  });

  it("lets a chain-specific entry hide the all-chain one for the same address", () => {
    expect(entriesForChain(book, 11155111).map((e) => e.name)).toEqual(["Alice on Sepolia"]);
  });

  it("hides entries saved for other chains", () => {
    expect(entriesForChain(book, 137).map((e) => e.name)).toEqual(["Alice (all)"]);
  });
});
