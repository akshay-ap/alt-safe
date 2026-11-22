import { readContract } from "@wagmi/core";
import type React from "react";
import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { type Address, zeroAddress } from "viem";
import { useChainId } from "wagmi";
import safe from "../abis/Safe.json";
import type { SafeTransactionParams } from "../utils/utils";
import { config } from "./../wagmi";
import type { Transaction } from "./types";
import { useSafeWalletContext } from "./WalletContext";

interface CreateTransactionContextType {
  // State
  transactions: Transaction[];
  transactionHash?: `0x${string}`;
  safeTransaction?: SafeTransactionParams;
  signature?: `0x${string}`;
  safeTransactionHash?: `0x${string}`;
  nonce: bigint;
  /** The Safe's current nonce, undefined while it loads. */
  onChainNonce: bigint | undefined;
  gasPrice: bigint;
  safeTxGas: bigint;
  baseGas: bigint;
  refundTokenAddress: Address;
  refundTokenAmount: string;
  refundToAddress: Address;
  error?: string;

  // Actions
  setTransactions: (transactions: Transaction[]) => void;
  setTransactionHash: (hash: `0x${string}` | undefined) => void;
  setSafeTransaction: (safeTransaction: SafeTransactionParams | undefined) => void;
  setSignature: (signature: `0x${string}` | undefined) => void;
  setSafeTransactionHash: (hash: `0x${string}` | undefined) => void;
  setNonce: (nonce: bigint) => void;
  setGasPrice: (gasPrice: bigint) => void;
  setSafeTxGas: (gasPrice: bigint) => void;
  setBaseGas: (gasPrice: bigint) => void;
  setRefundTokenAddress: (address: Address) => void;
  setRefundTokenAmount: (amount: string) => void;
  setRefundToAddress: (address: Address) => void;
  setError: (error: string | undefined) => void;

  // Utility actions
  addTransaction: (transaction: Transaction) => void;
  removeTransaction: (index: number) => void;
  clearTransactions: () => void;
  resetContext: () => void;
}

const CreateTransactionContext = createContext<CreateTransactionContextType | undefined>(undefined);

interface CreateTransactionProviderProps {
  children: ReactNode;
}

export const CreateTransactionProvider: React.FC<CreateTransactionProviderProps> = ({ children }) => {
  const { safeAccount } = useSafeWalletContext();
  const chainId = useChainId();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>();
  const [safeTransaction, setSafeTransaction] = useState<SafeTransactionParams | undefined>();
  const [signature, setSignature] = useState<`0x${string}` | undefined>();
  const [safeTransactionHash, setSafeTransactionHash] = useState<`0x${string}` | undefined>();
  const [nonce, setNonce] = useState<bigint>(0n);
  const [onChainNonce, setOnChainNonce] = useState<bigint>();
  // Bumped by resetContext so the next transaction starts from the Safe's then-current nonce.
  const [nonceReload, setNonceReload] = useState(0);
  const [error, setError] = useState<string | undefined>();
  const [gasPrice, setGasPrice] = useState<bigint>(0n);
  const [safeTxGas, setSafeTxGas] = useState<bigint>(0n);
  const [baseGas, setBaseGas] = useState<bigint>(0n);
  const [refundTokenAddress, setRefundTokenAddress] = useState<Address>(zeroAddress);
  const [refundTokenAmount, setRefundTokenAmount] = useState<string>("");
  const [refundToAddress, setRefundToAddress] = useState<Address>(zeroAddress);

  useEffect(() => {
    let isCurrent = true;
    setOnChainNonce(undefined);
    (async () => {
      if (safeAccount === undefined) return;

      const fetchedNonce = (await readContract(config, {
        abi: safe,
        address: safeAccount,
        functionName: "nonce",
        chainId,
      })) as bigint;

      if (!isCurrent) return;
      setOnChainNonce(fetchedNonce);
      setNonce(fetchedNonce);
    })().catch((err) => {
      if (!isCurrent) return;
      console.error(err);
      setError("Could not read the Safe's nonce on this network. Check that the Safe is deployed here.");
    });
    return () => {
      isCurrent = false;
    };
  }, [safeAccount, chainId, nonceReload]);

  // Utility actions
  const addTransaction = (transaction: Transaction) => {
    setTransactions((prev) => [...prev, transaction]);
  };

  const removeTransaction = (index: number) => {
    setTransactions((prev) => prev.filter((_, i) => i !== index));
  };

  const clearTransactions = () => {
    setTransactions([]);
  };

  const resetContext = () => {
    setTransactions([]);
    setTransactionHash(undefined);
    setSafeTransaction(undefined);
    setSignature(undefined);
    setSafeTransactionHash(undefined);
    setNonce(0n);
    setNonceReload((count) => count + 1);
    setGasPrice(0n);
    setSafeTxGas(0n);
    setBaseGas(0n);
    setRefundTokenAddress(zeroAddress);
    setRefundTokenAmount("");
    setRefundToAddress(zeroAddress);
    setError(undefined);
  };

  const value: CreateTransactionContextType = {
    // State
    transactions,
    transactionHash,
    safeTransaction,
    signature,
    safeTransactionHash,
    nonce,
    onChainNonce,
    gasPrice,
    safeTxGas,
    baseGas,
    refundTokenAddress,
    refundTokenAmount,
    refundToAddress,
    error,

    // Actions
    setTransactions,
    setTransactionHash,
    setSafeTransaction,
    setSignature,
    setSafeTransactionHash,
    setNonce,
    setGasPrice,
    setSafeTxGas,
    setBaseGas,
    setRefundTokenAddress,
    setRefundTokenAmount,
    setRefundToAddress,
    setError,

    // Utility actions
    addTransaction,
    removeTransaction,
    clearTransactions,
    resetContext,
  };

  return <CreateTransactionContext.Provider value={value}>{children}</CreateTransactionContext.Provider>;
};

export const useCreateTransactionContext = (): CreateTransactionContextType => {
  const context = useContext(CreateTransactionContext);
  if (context === undefined) {
    throw new Error("useCreateTransactionContext must be used within a CreateTransactionProvider");
  }
  return context;
};

export default CreateTransactionContext;
