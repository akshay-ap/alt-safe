import { getAddress, keccak256, toHex, zeroAddress } from "viem";
import { describe, expect, it } from "vitest";
import { type ImportSignedData, type SafeTransactionDraft, TransactionType } from "../context/types";
import { SafeOperation } from "../utils/utils";
import { exportSignedTransactionToHex, importTransactionsFromHex, isDraftFor } from "./api";

const address = (seed: string) => getAddress(keccak256(toHex(seed)).slice(0, 42));

const signed: ImportSignedData = {
  transactions: [
    {
      type: TransactionType.ETH_TRANSFER,
      groupName: "Native",
      actionName: "ETH Transfer",
      to: address("to"),
      value: "1",
      data: "0x",
    },
  ],
  safeAccount: address("safe"),
  safeTransaction: {
    to: address("to"),
    value: 123456789012345678901234567890n,
    data: "0x",
    operation: SafeOperation.CALL,
    safeTxGas: 0n,
    baseGas: 0n,
    gasPrice: 0n,
    gasToken: zeroAddress,
    refundReceiver: zeroAddress,
    nonce: 2n,
  },
  safeTransactionHash: keccak256(toHex("hash")),
  signature: { signer: address("owner"), data: keccak256(toHex("sig")) },
};

describe("exportSignedTransactionToHex", () => {
  it("produces hex that the signature importer reads back, signature included", () => {
    const hex = exportSignedTransactionToHex(signed);
    expect(hex).toMatch(/^0x[0-9a-f]+$/);

    const imported = importTransactionsFromHex(hex as `0x${string}`) as unknown as ImportSignedData;
    expect(imported.signature).toEqual(signed.signature);
    expect(imported.safeTransactionHash).toBe(signed.safeTransactionHash);
    expect(imported.transactions).toEqual(signed.transactions);
  });

  it("writes large amounts as exact decimal strings", () => {
    const imported = importTransactionsFromHex(exportSignedTransactionToHex(signed) as `0x${string}`);
    expect(imported.safeTransaction.value).toBe("123456789012345678901234567890");
    expect(imported.safeTransaction.nonce).toBe("2");
  });
});

describe("isDraftFor", () => {
  const safe = address("safe");
  const draft = { safeAccount: safe, chainId: 1 } as SafeTransactionDraft;

  it("matches the same Safe (any address case) on the same chain only", () => {
    expect(isDraftFor(draft, safe.toLowerCase() as `0x${string}`, 1)).toBe(true);
    expect(isDraftFor(draft, safe, 11155111)).toBe(false);
    expect(isDraftFor(draft, address("other"), 1)).toBe(false);
    expect(isDraftFor(draft, undefined, 1)).toBe(false);
  });

  it("keeps drafts saved without a chain id loadable", () => {
    expect(isDraftFor({ ...draft, chainId: undefined }, safe, 11155111)).toBe(true);
  });
});
