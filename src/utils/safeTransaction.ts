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

export const NONCE_LOADING_ERROR = "The Safe's current nonce is still loading. Try again in a moment.";

/**
 * The chosen nonce is always used as is. One below the Safe's current nonce can still be signed but can never
 * execute, so it only gets a warning.
 */
export const nonceWarning = (chosen: bigint, onChain: bigint | undefined): string | undefined =>
  onChain !== undefined && chosen < onChain
    ? `Nonce ${chosen} is below the Safe's current nonce ${onChain}. You can sign this transaction, but it will fail to execute.`
    : undefined;

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

/** Builds the batch's Safe transaction with the chosen settings and asks the Safe for its hash. */
export const prepareSafeTransaction = async (
  safeAccount: Address,
  transactions: Transaction[],
  settings: SafeTxSettings,
  multiSendCallOnly: Address | undefined,
) => {
  const safeTx = buildSafeTransaction(transactions, settings, multiSendCallOnly);
  return { safeTx, safeTxHash: await readSafeTransactionHash(safeAccount, safeTx) };
};

/** Readable JSON for sharing a Safe transaction; numbers are decimal strings so nothing loses precision. */
export const safeTransactionToJson = (tx: SafeTransactionParams, safeTransactionHash: `0x${string}`) =>
  JSON.stringify(
    {
      to: tx.to,
      value: tx.value.toString(),
      data: tx.data,
      operation: tx.operation,
      safeTxGas: tx.safeTxGas.toString(),
      baseGas: tx.baseGas.toString(),
      gasPrice: tx.gasPrice.toString(),
      gasToken: tx.gasToken,
      refundReceiver: tx.refundReceiver,
      nonce: tx.nonce.toString(),
      safeTransactionHash,
    },
    null,
    2,
  );
