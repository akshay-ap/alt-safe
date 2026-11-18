import { decodeFunctionData, getAddress, keccak256, toHex, zeroAddress } from "viem";
import { describe, expect, it } from "vitest";
import multiSendCallOnlyAbi from "../abis/MultiSendCallOnly.json";
import { type Transaction, TransactionType } from "../context/types";
import { encodeMultiSend } from "./multisend";
import { buildSafeTransaction, nonceWarning, type SafeTxSettings } from "./safeTransaction";
import { SafeOperation } from "./utils";

const address = (seed: string) => getAddress(keccak256(toHex(seed)).slice(0, 42));
const MULTI_SEND = address("multisend");

const action = (seed: string, value = "0", data: `0x${string}` = "0x"): Transaction => ({
  type: TransactionType.CONTRACT_CALL,
  groupName: "Test",
  actionName: seed,
  to: address(seed),
  value,
  data,
});

const settings: SafeTxSettings = {
  nonce: 7n,
  safeTxGas: 1n,
  baseGas: 2n,
  gasPrice: 3n,
  gasToken: zeroAddress,
  refundReceiver: address("refund"),
};

describe("buildSafeTransaction", () => {
  it("calls a single action directly and keeps the settings", () => {
    const only = action("a", "5", "0xabcd");
    expect(buildSafeTransaction([only], settings, MULTI_SEND)).toEqual({
      to: only.to,
      value: 5n,
      data: "0xabcd",
      operation: SafeOperation.CALL,
      ...settings,
    });
  });

  it("delegatecalls MultiSendCallOnly for a batch, encoding every action in order", () => {
    const batch = [action("a", "1"), action("b", "0", "0x1234")];
    const safeTx = buildSafeTransaction(batch, settings, MULTI_SEND);

    expect(safeTx).toMatchObject({ to: MULTI_SEND, value: 0n, operation: SafeOperation.DELEGATE_CALL, nonce: 7n });
    const { args } = decodeFunctionData({ abi: multiSendCallOnlyAbi, data: safeTx.data });
    expect(args?.[0]).toBe(
      encodeMultiSend(
        batch.map((tx) => ({ to: tx.to, value: BigInt(tx.value), data: tx.data, operation: SafeOperation.CALL })),
      ),
    );
  });

  it("rejects an empty batch", () => {
    expect(() => buildSafeTransaction([], settings, MULTI_SEND)).toThrow("No actions");
  });

  it("rejects a batch when no MultiSendCallOnly address is known", () => {
    expect(() => buildSafeTransaction([action("a"), action("b")], settings, undefined)).toThrow("MultiSendCallOnly");
  });
});

describe("buildSafeTransaction nonce", () => {
  it("keeps a chosen nonce below the on-chain one instead of replacing it", () => {
    expect(buildSafeTransaction([action("a")], { ...settings, nonce: 2n }, undefined).nonce).toBe(2n);
  });
});

describe("nonceWarning", () => {
  it("warns only when the chosen nonce is below the on-chain nonce", () => {
    expect(nonceWarning(4n, 5n)).toContain("below the Safe's current nonce 5");
    expect(nonceWarning(5n, 5n)).toBeUndefined();
    expect(nonceWarning(9n, 5n)).toBeUndefined();
  });

  it("stays quiet while the on-chain nonce is unknown", () => {
    expect(nonceWarning(0n, undefined)).toBeUndefined();
  });
});
