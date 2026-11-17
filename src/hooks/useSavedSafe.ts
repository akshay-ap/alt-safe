import { useEffect, useState } from "react";
import { type Address, isAddressEqual } from "viem";
import { STORAGE_KEY } from "../constants";
import type { SafeAccount } from "../context/types";
import { useSafeWalletContext } from "../context/WalletContext";

const SAVED_SAFES_CHANGED = "alt-safe:saved-safes-changed";

/** Call after writing SAFE_ACCOUNTS so every useSavedSafe re-reads it. */
export const notifySavedSafesChanged = () => window.dispatchEvent(new Event(SAVED_SAFES_CHANGED));

/** The locally saved name and labels of a Safe, if it was created or imported here. */
export const useSavedSafe = (address: Address | undefined): SafeAccount | undefined => {
  const { storage } = useSafeWalletContext();
  const [saved, setSaved] = useState<SafeAccount>();

  useEffect(() => {
    let isCurrent = true;
    const load = async () => {
      const accounts = ((await storage.getItem(STORAGE_KEY.SAFE_ACCOUNTS)) as SafeAccount[] | null) ?? [];
      const match = address ? accounts.find((account) => isAddressEqual(account.address, address)) : undefined;
      if (isCurrent) setSaved(match);
    };
    load();
    window.addEventListener(SAVED_SAFES_CHANGED, load);
    return () => {
      isCurrent = false;
      window.removeEventListener(SAVED_SAFES_CHANGED, load);
    };
  }, [address, storage]);

  return saved;
};
