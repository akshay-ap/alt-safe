import { useEffect, useState } from "react";
import { type Address, isAddressEqual } from "viem";
import { STORAGE_KEY } from "../constants";
import type { SafeAccount } from "../context/types";
import { useSafeWalletContext } from "../context/WalletContext";

/** The locally saved name and labels of a Safe, if it was created or imported here. */
export const useSavedSafe = (address: Address | undefined): SafeAccount | undefined => {
  const { storage } = useSafeWalletContext();
  const [saved, setSaved] = useState<SafeAccount>();

  useEffect(() => {
    let isCurrent = true;
    (async () => {
      const accounts = ((await storage.getItem(STORAGE_KEY.SAFE_ACCOUNTS)) as SafeAccount[] | null) ?? [];
      const match = address ? accounts.find((account) => isAddressEqual(account.address, address)) : undefined;
      if (isCurrent) setSaved(match);
    })();
    return () => {
      isCurrent = false;
    };
  }, [address, storage]);

  return saved;
};
