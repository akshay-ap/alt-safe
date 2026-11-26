import { describe, expect, it } from "vitest";
import type { AddressBookEntry } from "../context/AddressBookContext";
import { withoutSeededSamples } from "./addressBookSamples";

const alice = "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B";

describe("withoutSeededSamples", () => {
  it("removes the seeded samples and keeps the user's entries", () => {
    const book: AddressBookEntry[] = [
      { address: "0x1234567890123456789012345678901234567890", name: "Sample Address 1", chainId: 1 },
      { address: alice, name: "Alice", chainId: 1 },
      { address: "0x0987654321098765432109876543210987654321", name: "Test Wallet", chainId: 1 },
      { address: "0xAbCdEf1234567890123456789012345678901234", name: "Demo Safe", chainId: 137 },
    ];
    expect(withoutSeededSamples(book)).toEqual([{ address: alice, name: "Alice", chainId: 1 }]);
  });

  it("keeps a sample address the user renamed or moved to another chain", () => {
    const book: AddressBookEntry[] = [
      { address: "0x1234567890123456789012345678901234567890", name: "Mine now", chainId: 1 },
      { address: "0x0987654321098765432109876543210987654321", name: "Test Wallet", chainId: 137 },
    ];
    expect(withoutSeededSamples(book)).toEqual(book);
  });
});
