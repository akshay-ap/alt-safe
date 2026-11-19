import { type Address, type Hex, isAddress, isAddressEqual, isHex, recoverAddress, size } from "viem";
import { importTransactionsFromHex } from "../api/api";
import type { ImportData, ImportSignedData } from "../context/types";
import { calculateSafeTransactionHash, type SafeSignature } from "./utils";

const NOT_HEX = "Paste a signature or a signed transaction. Both start with 0x.";
const NOT_SHARED = "This is not a signature or a transaction shared from ALT Safe.";
const BAD_SIGNATURE = "A signature does not match this transaction, or was not made by an owner of this Safe.";

// Chat apps wrap long text, so drop whitespace anywhere in the paste.
const clean = (input: string) => input.replace(/\s+/g, "");

// Payloads are JSON written by ALT Safe; anything else in the hex is reported as not shared.
const decode = (value: string): Record<string, unknown> => {
  try {
    const data: unknown = importTransactionsFromHex(value as Hex);
    if (data && typeof data === "object" && !Array.isArray(data)) return data as Record<string, unknown>;
  } catch {}
  throw new Error(NOT_SHARED);
};

/**
 * Reads what an owner pasted back: a raw 65-byte signature or a shared signed transaction.
 * Each signer is recovered from the signature itself, so it cannot land on the wrong owner.
 */
export const parseSignatures = async (
  input: string,
  safeTransactionHash: Hex,
  owners: readonly Address[],
): Promise<SafeSignature[]> => {
  const value = clean(input);
  if (!isHex(value) || value === "0x") throw new Error(NOT_HEX);
  const candidates = size(value) === 65 ? [value] : signaturesIn(decode(value), safeTransactionHash);

  return Promise.all(
    candidates.map(async (data) => {
      const signer =
        typeof data === "string" && isHex(data) && size(data) === 65
          ? await recoverAddress({ hash: safeTransactionHash, signature: data }).catch(() => undefined)
          : undefined;
      if (!signer || !owners.some((owner) => isAddressEqual(owner, signer))) throw new Error(BAD_SIGNATURE);
      return { signer, data: data as string };
    }),
  );
};

const signaturesIn = (shared: Partial<ImportSignedData>, safeTransactionHash: Hex): unknown[] => {
  if (shared.safeTransactionHash !== safeTransactionHash)
    throw new Error("This was signed for a different transaction.");
  const list: unknown = shared.signatures ?? (shared.signature ? [shared.signature] : []);
  if (!Array.isArray(list)) throw new Error(NOT_SHARED);
  if (list.length === 0) throw new Error("This transaction has no signatures yet.");
  return list.map((entry) => (entry as SafeSignature | null)?.data);
};

const isUint = (value: unknown) => typeof value === "string" && /^\d+$/.test(value);

/**
 * Validates a pasted shared transaction for this Safe and returns it with bigint amounts.
 * The hash is recomputed, because it is what owners sign; only user-facing errors are thrown.
 */
export const parseSharedTransaction = (
  input: string,
  safe: { address: Address; chainId: number; nonce: bigint },
): ImportData => {
  const value = clean(input);
  if (!isHex(value) || value === "0x")
    throw new Error("Paste the transaction another owner shared. It starts with 0x.");
  const data = decode(value) as Partial<ImportData>;
  const tx = data.safeTransaction as Record<string, unknown> | undefined;
  const amounts = ["value", "safeTxGas", "baseGas", "gasPrice", "nonce"] as const;
  if (!tx || typeof data.safeTransactionHash !== "string" || !amounts.every((key) => isUint(tx[key]))) {
    throw new Error(NOT_SHARED);
  }
  // The batch summary is rendered as-is, so reject entries the summary cannot display.
  const summaryOk =
    Array.isArray(data.transactions) &&
    data.transactions.every((t) => t && isAddress(String(t.to)) && isUint(t.value) && isHex(t.data));
  if (!summaryOk) throw new Error(NOT_SHARED);
  if (
    typeof data.safeAccount !== "string" ||
    !isAddress(data.safeAccount) ||
    !isAddressEqual(data.safeAccount, safe.address)
  ) {
    throw new Error("This transaction is for a different Safe.");
  }

  const safeTransaction = {
    ...data.safeTransaction,
    ...Object.fromEntries(amounts.map((key) => [key, BigInt(tx[key] as string)])),
  } as ImportData["safeTransaction"];
  let hash: Hex | undefined;
  try {
    hash = calculateSafeTransactionHash(safeTransaction, safe.address, safe.chainId);
  } catch {}
  if (hash !== data.safeTransactionHash) {
    throw new Error("The transaction details do not match its hash, or it was made for another network.");
  }
  if (safeTransaction.nonce < safe.nonce)
    throw new Error("This transaction's nonce has already been used by the Safe.");
  return { ...(data as ImportData), safeTransaction };
};

/** Adds signatures, keeping one per signer. */
export const mergeSignatures = (current: SafeSignature[], added: SafeSignature[]): SafeSignature[] =>
  [...current, ...added].filter(
    (sig, i, all) => all.findIndex((other) => other.signer.toLowerCase() === sig.signer.toLowerCase()) === i,
  );
