import { readContract } from "@wagmi/core";
import { type Address, encodeFunctionData } from "viem";
import multiSendCallOnlyAbi from "../abis/MultiSendCallOnly.json";
import safeAbi from "../abis/Safe.json";
import type { Transaction } from "../context/types";
import { config } from "../wagmi";
import { encodeMultiSend } from "./multisend";
import { SafeOperation, type SafeTransactionParams } from "./utils";

export type SafeTxSettings = Pick<
  SafeTransactionParams,
  "nonce" | "safeTxGas" | "baseGas" | "gasPrice" | "gasToken" | "refundReceiver"
>;

/** The one Safe transaction for a batch: a direct call for one action, MultiSendCallOnly for several. */
export const buildSafeTransaction = (
  transactions: Transaction[],
  settings: SafeTxSettings,
  multiSendCallOnly: Address | undefined,
): SafeTransactionParams => {
  if (transactions.length === 0) throw new Error("No actions in the batch");
  if (transactions.length === 1) {
    const [only] = transactions;
    return { to: only.to, value: BigInt(only.value), data: only.data, operation: SafeOperation.CALL, ...settings };
  }
  if (!multiSendCallOnly) throw new Error("No MultiSendCallOnly address is known for this network");

  const calls = transactions.map((tx) => ({
    to: tx.to,
    value: BigInt(tx.value),
    data: tx.data,
    operation: SafeOperation.CALL,
  }));
  const data = encodeFunctionData({
    abi: multiSendCallOnlyAbi,
    functionName: "multiSend",
    args: [encodeMultiSend(calls)],
  });
  return { to: multiSendCallOnly, value: 0n, data, operation: SafeOperation.DELEGATE_CALL, ...settings };
};

/** A nonce below the Safe's current one can never execute; it also covers a nonce still loading as 0. */
export const resolveNonce = (chosen: bigint, onChain: bigint) => (chosen < onChain ? onChain : chosen);

export const readSafeNonce = async (safeAccount: Address) =>
  (await readContract(config, { abi: safeAbi, address: safeAccount, functionName: "nonce" })) as bigint;

export const readSafeTransactionHash = async (safeAccount: Address, tx: SafeTransactionParams) =>
  (await readContract(config, {
    abi: safeAbi,
    address: safeAccount,
    functionName: "getTransactionHash",
    args: [
      tx.to,
      tx.value,
      tx.data,
      tx.operation,
      tx.safeTxGas,
      tx.baseGas,
      tx.gasPrice,
      tx.gasToken,
      tx.refundReceiver,
      tx.nonce,
    ],
  })) as `0x${string}`;

/** Builds the batch's Safe transaction with a usable nonce and asks the Safe for its hash. */
export const prepareSafeTransaction = async (
  safeAccount: Address,
  transactions: Transaction[],
  settings: SafeTxSettings,
  multiSendCallOnly: Address | undefined,
) => {
  const nonce = resolveNonce(settings.nonce, await readSafeNonce(safeAccount));
  const safeTx = buildSafeTransaction(transactions, { ...settings, nonce }, multiSendCallOnly);
  return { safeTx, safeTxHash: await readSafeTransactionHash(safeAccount, safeTx) };
};
