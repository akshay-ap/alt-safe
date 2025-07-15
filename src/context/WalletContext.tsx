import type React from "react";
import { type ReactNode, createContext, useCallback, useContext, useEffect, useState } from "react";
import { type Address, isAddress, isAddressEqual, zeroAddress } from "viem"; // Import viem library for validation
import { createStorage, useAccount, usePublicClient } from "wagmi";
import { type FEATURES, STORAGE_KEY, WALLET_STORAGE_KEY } from "../constants";
import { type SafeDeployment, SafeDeploymentType, SafeVersion } from "../safe-contracts/addresses/addresses";
import { type SafeStorage, fetchStorageData } from "../utils/storageReader";
import { type SafeTransactionParams, getSafeAddresses } from "../utils/utils";
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
  rpc: string | undefined;
  setRpc: (rpc: string | undefined) => void;
  safeDeployment: SafeDeployment | undefined;
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
  const [rpc, setRpc] = useState<string>();
  const storage = createStorage({ key: WALLET_STORAGE_KEY, storage: localStorage });
  const [safeDeployment, setSafeDeployment] = useState<SafeDeployment>();
  const [tokenList, setTokenList] = useState<TokenList[]>([]);
  const [txBuilderSpec, _setTxBuilderSpec] = useState<TransactionGroupSpec[]>(trnasctionBuilderSpec);

  const setCustomRPC = (rpc: string | undefined) => {
    setRpc(rpc);
    storage.setItem(STORAGE_KEY.RPC, rpc);
  };

  // Set safeDeployment when account changes
  useEffect(() => {
    (async () => {
      if (account.address !== zeroAddress && account.chainId !== undefined) {
        const safeDeployment = getSafeAddresses(account.chainId || 0, SafeVersion.V1_4_1, SafeDeploymentType.CANONICAL);
        setSafeDeployment(safeDeployment);
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
      const customRPC = (await storage.getItem(STORAGE_KEY.RPC)) as string;
      if (customRPC) {
        setRpc(customRPC);
      } else {
        const defaultRPC = publicClient
          ? publicClient.chain.rpcUrls.default.http[0]
          : account.chain?.rpcUrls.default.http[0];
        setCustomRPC(defaultRPC);
      }
    })();
  });

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
        setSafeAccount,
        rpc,
        setRpc: setCustomRPC,
        safeDeployment,
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
