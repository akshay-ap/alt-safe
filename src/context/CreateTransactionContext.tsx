import type React from "react";
import { type ReactNode, createContext, useContext, useState } from "react";
import type { SafeTransactionParams } from "../utils/utils";
import type { Transaction } from "./types";

interface CreateTransactionContextType {
  // State
  transactions: Transaction[];
  transactionHash?: `0x${string}`;
  safeTransaction?: SafeTransactionParams;
  signature?: `0x${string}`;
  safeTransactionHash?: `0x${string}`;
  nonce: string;
  gasLimit: string;
  refundTokenAddress: string;
  refundTokenAmount: string;
  refundToAddress: string;
  error?: string;

  // Actions
  setTransactions: (transactions: Transaction[]) => void;
  setTransactionHash: (hash: `0x${string}` | undefined) => void;
  setSafeTransaction: (safeTransaction: SafeTransactionParams | undefined) => void;
  setSignature: (signature: `0x${string}` | undefined) => void;
  setSafeTransactionHash: (hash: `0x${string}` | undefined) => void;
  setNonce: (nonce: string) => void;
  setGasLimit: (gasLimit: string) => void;
  setRefundTokenAddress: (address: string) => void;
  setRefundTokenAmount: (amount: string) => void;
  setRefundToAddress: (address: string) => void;
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>();
  const [safeTransaction, setSafeTransaction] = useState<SafeTransactionParams | undefined>();
  const [signature, setSignature] = useState<`0x${string}` | undefined>();
  const [safeTransactionHash, setSafeTransactionHash] = useState<`0x${string}` | undefined>();
  const [nonce, setNonce] = useState<string>("");
  const [error, setError] = useState<string | undefined>();
  const [gasLimit, setGasLimit] = useState<string>("");
  const [refundTokenAddress, setRefundTokenAddress] = useState<string>("");
  const [refundTokenAmount, setRefundTokenAmount] = useState<string>("");
  const [refundToAddress, setRefundToAddress] = useState<string>("");

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
    setNonce("");
    setGasLimit("");
    setRefundTokenAddress("");
    setRefundTokenAmount("");
    setRefundToAddress("");
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
    gasLimit,
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
    setGasLimit,
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
