import type React from "react";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { type Address, isAddress, isAddressEqual, zeroAddress } from "viem"; // Import viem library for validation
import { createStorage, useAccount, usePublicClient } from "wagmi";
import { type FEATURES, STORAGE_KEY, WALLET_STORAGE_KEY } from "../constants";
import { DEFAULT_SAFE_VERSION, getSafeDeployment, type SafeDeployment } from "../safe-contracts/addresses/addresses";
import { fetchStorageData, type SafeStorage } from "../utils/storageReader";
import type { SafeTransactionParams } from "../utils/utils";
import trnasctionBuilderSpec from "./TransactionSpecs";
import type { TransactionGroupSpec } from "./types";

export type SafeTransactionInfo = {
  safeAccount: Address;
  chainId: number | undefined;
  safeTransactionParams: SafeTransactionParams;
  transactionHash: `0x${string}` | undefined;
  status: string | undefined;
  blockNumber: bigint | undefined;
  blockHash: `0x${string}` | undefined;
};

interface WalletContextType {
  safeAccount: Address | undefined;
  setSafeAccount: (account: Address) => void;
  features: FEATURES[];
  loading: boolean;
  safeStorage: SafeStorage | undefined;
  accountCode: string | undefined;
  loadStorage: (account: Address) => Promise<void>;
  safeDeployment: SafeDeployment | undefined;
  /** The user-entered deployment for the connected chain, if any. */
  customDeployment: SafeDeployment | undefined;
  tokenList: TokenList[];
  setTokenList: (list: TokenList[]) => void;
  storage: any;
  txBuilderSpec: TransactionGroupSpec[];
}

export type CustomDeployment = {
  chainId: number;
  deployment: SafeDeployment;
};

export type TokenList = {
  safeAccount: Address;
  erc20Tokens: { address: Address; chainID: number }[];
  nfts: { address: Address; chainID: number }[];
};

// Create the context
export const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Create a provider component
export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const account = useAccount();
  const publicClient = usePublicClient();
  const [safeAccount, setSafeAccount] = useState<Address>();
  const [features] = useState<FEATURES[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [safeStorage, setSafeStorage] = useState<SafeStorage>();
  const [accountCode, setAccountCode] = useState<string>();
  // Stable across renders so effects that depend on it do not re-run every time.
  const [storage] = useState(() => createStorage({ key: WALLET_STORAGE_KEY, storage: localStorage }));
  const [safeDeployment, setSafeDeployment] = useState<SafeDeployment>();
  const [customDeployment, setCustomDeployment] = useState<SafeDeployment>();
  const [tokenList, setTokenList] = useState<TokenList[]>([]);
  const [txBuilderSpec, _setTxBuilderSpec] = useState<TransactionGroupSpec[]>(trnasctionBuilderSpec);

  // Set safeDeployment when account changes
  useEffect(() => {
    (async () => {
      if (account.address === zeroAddress || account.chainId === undefined) {
        return;
      }

      const customDeployments = (await storage.getItem(STORAGE_KEY.CUSTOM_DEPLOYMENTS)) as
        | CustomDeployment[]
        | undefined;
      const chainSpecificDeployment = customDeployments?.find(
        (deployment) => deployment.chainId === account.chainId,
      )?.deployment;

      setCustomDeployment(chainSpecificDeployment);
      if (chainSpecificDeployment) {
        setSafeDeployment(chainSpecificDeployment);
      } else {
        setSafeDeployment(getSafeDeployment(DEFAULT_SAFE_VERSION, account.chainId));
      }
    })();
  }, [account]);

  const loadStorage = useCallback(
    async (accountAddress: Address) => {
      if (accountAddress && publicClient) {
        if (!accountAddress || !isAddress(accountAddress)) {
          setAccountCode(undefined);
          setSafeStorage(undefined);
          return;
        }
        setLoading(true);
        const { storage, accountCode } = await fetchStorageData(accountAddress, publicClient as any);
        setAccountCode(accountCode);
        setSafeStorage(storage);
        setLoading(false);
      }
    },
    [publicClient],
  );

  useEffect(() => {
    (async () => {
      if (safeAccount && !isAddressEqual(safeAccount, zeroAddress)) {
        try {
          await loadStorage(safeAccount);
        } catch (e) {
          console.warn(`Unable to load storage for safe [${safeAccount}]`);
        }
      }
    })();
  }, [safeAccount, loadStorage]);

  useEffect(() => {
    (async () => {
      const lastSelectedSafeAccount = (await storage.getItem(STORAGE_KEY.LAST_SELECTED_SAFE_ACCOUNT)) as Address | null;
      if (lastSelectedSafeAccount && isAddress(lastSelectedSafeAccount)) {
        setSafeAccount(lastSelectedSafeAccount);
      }
    })();
  }, [storage]);

  const selectSafeAccount = useCallback(
    (address: Address) => {
      setSafeAccount(address);
      storage.setItem(STORAGE_KEY.LAST_SELECTED_SAFE_ACCOUNT, address);
    },
    [storage],
  );

  const saveTokenList = async (list: TokenList[]) => {
    setTokenList(list);
    await storage.setItem(STORAGE_KEY.TOKEN_LIST, list);
  };

  return (
    <WalletContext.Provider
      value={{
        loadStorage,
        safeStorage,
        accountCode,
        loading,
        features,
        safeAccount,
        setSafeAccount: selectSafeAccount,
        safeDeployment,
        customDeployment,
        tokenList,
        setTokenList: saveTokenList,
        storage,
        txBuilderSpec,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// Custom Hook to Access Context
export const useSafeWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useSafeWalletContext must be used within a WalletProvider");
  }
  return context;
};
