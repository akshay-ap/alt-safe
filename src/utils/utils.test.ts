import { getAddress, keccak256, toHex } from "viem";
import { describe, expect, it } from "vitest";
import { encodeMultiSend } from "./multisend";
import { getShortAddress, SafeOperation } from "./utils";

const randomAddress = () => getAddress(keccak256(toHex(Math.random().toString())).slice(0, 42));

describe("getShortAddress", () => {
  it("keeps the 0x prefix with four leading and four trailing characters", () => {
    const address = randomAddress();
    expect(getShortAddress(address)).toBe(`${address.slice(0, 6)}...${address.slice(-4)}`);
  });
});

describe("encodeMultiSend", () => {
  it("packs operation, to, value, byte length and data for each transaction", () => {
    const to = randomAddress();
    const packed = encodeMultiSend([{ operation: SafeOperation.CALL, to, value: 1n, data: "0xabcd" }]);

    expect(packed.slice(2, 4)).toBe("00");
    expect(packed.slice(4, 44)).toBe(to.slice(2).toLowerCase());
    expect(BigInt(`0x${packed.slice(44, 108)}`)).toBe(1n);
    expect(BigInt(`0x${packed.slice(108, 172)}`)).toBe(2n);
    expect(packed.slice(172)).toBe("abcd");
  });

  it("concatenates transactions in order", () => {
    const [first, second] = [randomAddress(), randomAddress()];
    const packed = encodeMultiSend([
      { operation: SafeOperation.CALL, to: first, value: 0n, data: "0x" },
      { operation: SafeOperation.CALL, to: second, value: 0n, data: "0x" },
    ]);
    const entryLength = 2 + 40 + 64 + 64;

    expect(packed.length).toBe(2 + entryLength * 2);
    expect(packed.slice(2 + entryLength + 2, 2 + entryLength + 42)).toBe(second.slice(2).toLowerCase());
  });
});
