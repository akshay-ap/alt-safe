import { decodeFunctionData, getAddress, keccak256, toHex, zeroAddress } from "viem";
import { describe, expect, it } from "vitest";
import multiSendCallOnlyAbi from "../abis/MultiSendCallOnly.json";
import { type Transaction, TransactionType } from "../context/types";
import { encodeMultiSend } from "./multisend";
import { buildSafeTransaction, resolveNonce, type SafeTxSettings } from "./safeTransaction";
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

describe("resolveNonce", () => {
  it("keeps a chosen nonce at or above the on-chain nonce, e.g. to queue or replace", () => {
    expect(resolveNonce(5n, 5n)).toBe(5n);
    expect(resolveNonce(9n, 5n)).toBe(9n);
  });

  it("uses the on-chain nonce when the chosen one is already spent or not loaded yet", () => {
    expect(resolveNonce(0n, 5n)).toBe(5n);
  });
});
