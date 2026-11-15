import { type Address, isAddressEqual } from "viem";
import type { SafeAccount } from "../context/types";

export type SafeAccountInput = { address: Address; chainId: number; name: string; labels: string[] };

export type UpsertResult = {
  status: "added" | "network-added" | "exists";
  accounts: SafeAccount[];
};

/** Saves a Safe for a network, merging with an entry for the same address saved on other networks. */
export const upsertSafeAccount = (accounts: SafeAccount[], input: SafeAccountInput): UpsertResult => {
  const index = accounts.findIndex((account) => isAddressEqual(account.address, input.address));
  if (index === -1) {
    const added = { address: input.address, chainIds: [input.chainId], name: input.name, labels: input.labels };
    return { status: "added", accounts: [...accounts, added] };
  }

  const existing = accounts[index];
  if (existing.chainIds.includes(input.chainId)) return { status: "exists", accounts };

  const merged: SafeAccount = {
    ...existing,
    chainIds: [...existing.chainIds, input.chainId],
    name: input.name || existing.name,
    labels: input.labels.length > 0 ? input.labels : existing.labels,
  };
  return { status: "network-added", accounts: accounts.map((account, i) => (i === index ? merged : account)) };
};
