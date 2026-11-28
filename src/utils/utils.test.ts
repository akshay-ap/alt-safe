import { concat, getAddress, keccak256, maxUint256, toHex, zeroAddress } from "viem";
import { describe, expect, it } from "vitest";
import { encodeMultiSend } from "./multisend";
import { calculateSafeTransactionHash, getShortAddress, parseSalt, SafeOperation, safeTxHashParts } from "./utils";

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

describe("parseSalt", () => {
  it("accepts digits up to the uint256 maximum, with empty meaning 0", () => {
    expect(parseSalt("")).toBe(0n);
    expect(parseSalt("42")).toBe(42n);
    expect(parseSalt(maxUint256.toString())).toBe(maxUint256);
  });

  it("rejects values above uint256, which would crash the address prediction", () => {
    expect(parseSalt((maxUint256 + 1n).toString())).toBeUndefined();
  });

  it("rejects anything that isn't plain digits", () => {
    for (const value of ["-1", "1.5", "1e5", "0x10", " 1"]) expect(parseSalt(value)).toBeUndefined();
  });
});

describe("safeTxHashParts", () => {
  it("combines into the same safeTxHash the Safe contract computes", () => {
    const safe = getAddress(keccak256(toHex("safe")).slice(0, 42));
    const tx = {
      to: getAddress(keccak256(toHex("to")).slice(0, 42)),
      value: 10n ** 18n,
      data: "0xa9059cbb" as const,
      operation: SafeOperation.CALL,
      safeTxGas: 1n,
      baseGas: 2n,
      gasPrice: 3n,
      gasToken: zeroAddress,
      refundReceiver: zeroAddress,
      nonce: 7n,
    };
    const { domainHash, messageHash } = safeTxHashParts(tx, 11155111, safe);
    const safeTxHash = calculateSafeTransactionHash(tx, safe, 11155111);
    expect(keccak256(concat(["0x1901", domainHash, messageHash]))).toBe(safeTxHash);
  });
});
