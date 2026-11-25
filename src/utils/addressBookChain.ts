import { getAddress } from "viem";
import type { AddressBookEntry } from "../context/AddressBookContext";

/** Chain ID stored on entries that apply to every chain. 0 is never a real EIP-155 chain ID. */
export const ALL_CHAINS = 0;

export const chainLabel = (chainId: number) => (chainId === ALL_CHAINS ? "All chains" : `Chain ${chainId}`);

/** Entries usable on `chainId`: its own plus all-chain ones; a chain-specific entry hides an all-chain one for the same address. */
export const entriesForChain = (book: AddressBookEntry[], chainId: number): AddressBookEntry[] => {
  const own = book.filter((entry) => entry.chainId === chainId);
  const ownAddresses = new Set(own.map((entry) => getAddress(entry.address)));
  const global = book.filter(
    (entry) => entry.chainId === ALL_CHAINS && chainId !== ALL_CHAINS && !ownAddresses.has(getAddress(entry.address)),
  );
  return [...own, ...global];
};
