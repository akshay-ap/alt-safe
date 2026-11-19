import { type Address, type Hex, isAddressEqual, isHex, recoverAddress, size } from "viem";
import { importTransactionsFromHex } from "../api/api";
import type { ImportSignedData } from "../context/types";
import type { SafeSignature } from "./utils";

/**
 * Reads what an owner pasted back: a raw 65-byte signature or a shared signed transaction.
 * Each signer is recovered from the signature itself, so it cannot land on the wrong owner.
 */
export const parseSignatures = async (
  input: string,
  safeTransactionHash: Hex,
  owners: readonly Address[],
): Promise<SafeSignature[]> => {
  const value = input.trim();
  if (!isHex(value)) throw new Error("Paste a signature or a signed transaction. Both start with 0x.");

  let candidates: string[];
  if (size(value) === 65) {
    candidates = [value];
  } else {
    let shared: Partial<ImportSignedData>;
    try {
      shared = importTransactionsFromHex(value);
    } catch {
      throw new Error("This is not a signature or a signed transaction from ALT Safe.");
    }
    if (shared.safeTransactionHash !== safeTransactionHash)
      throw new Error("This was signed for a different transaction.");
    candidates = (shared.signatures ?? (shared.signature ? [shared.signature] : [])).map((s) => s.data);
    if (candidates.length === 0) throw new Error("This transaction has no signatures yet.");
  }

  return Promise.all(
    candidates.map(async (data) => {
      const signer = await recoverAddress({ hash: safeTransactionHash, signature: data as Hex }).catch(() => undefined);
      if (!signer || !owners.some((owner) => isAddressEqual(owner, signer))) {
        throw new Error("A signature does not match this transaction, or was not made by an owner of this Safe.");
      }
      return { signer, data };
    }),
  );
};

/** Adds signatures, keeping one per signer. */
export const mergeSignatures = (current: SafeSignature[], added: SafeSignature[]): SafeSignature[] =>
  [...current, ...added].filter(
    (sig, i, all) => all.findIndex((other) => other.signer.toLowerCase() === sig.signer.toLowerCase()) === i,
  );
