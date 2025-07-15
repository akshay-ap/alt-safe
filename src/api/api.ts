import { hexToNumber } from "viem";
import { bytesToHex, hexToBytes, stringToBytes } from "viem";
import { STORAGE_KEY } from "../constants";
import type { ImportData, SafeTransactionDraft, Transaction } from "../context/types";

export const checkRPCStatus = async (rpcUrl: string): Promise<boolean> => {
  const data = {
    jsonrpc: "2.0",
    id: "1",
    method: "web3_clientVersion",
  };
  try {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();

    // Check if there's a result in the response
    if (json.result) {
      return true;
    }

    console.error("Failed to connect to the RPC:", json);
    return false;
  } catch (error) {
    console.error("Failed to connect to the RPC:", error);
    return false;
  }
};

export const getChainId = async (rpcUrl: string): Promise<number | null> => {
  const data = {
    jsonrpc: "2.0",
    id: "1",
    method: "eth_chainId",
  };
  try {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();

    if (json.result) {
      return hexToNumber(json.result);
    }

    console.error("Failed to connect to the RPC:", json);
    return null;
  } catch (error) {
    console.error("Failed to connect to the RPC:", error);
    return null;
  }
};

// New functions for saved transaction drafts
export const saveDraftTransaction = async (
  storage: any,
  safeAccount: `0x${string}`,
  chainId: number | undefined,
  name: string,
  transactions: Transaction[],
): Promise<string> => {
  try {
    // Generate a unique ID for this draft
    const draftId = `draft-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Ensure valid date format using ISO string
    const timestamp = new Date().toISOString();

    const draft: SafeTransactionDraft = {
      id: draftId,
      safeAccount,
      chainId,
      name,
      transactions,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Get existing drafts
    const existingDrafts = await getDraftTransactions(storage);

    // Add new draft
    const updatedDrafts = [...existingDrafts, draft];

    // Save to storage
    await storage.setItem(STORAGE_KEY.DRAFT_TRANSACTIONS, updatedDrafts);

    return draftId;
  } catch (error) {
    console.error("Failed to save draft transaction:", error);
    throw new Error("Failed to save draft transaction");
  }
};

// Update getDraftTransactions to validate dates

export const getDraftTransactions = async (storage: Storage): Promise<SafeTransactionDraft[]> => {
  try {
    const drafts = (await storage.getItem(STORAGE_KEY.DRAFT_TRANSACTIONS)) as unknown as SafeTransactionDraft[];

    if (!drafts) return [];

    // Validate and fix dates in all drafts
    return drafts.map((draft) => validateDraftDates(draft));
  } catch (error) {
    console.error("Failed to get draft transactions:", error);
    return [];
  }
};

export const getDraftTransactionById = async (
  storage: Storage,
  draftId: string,
): Promise<SafeTransactionDraft | null> => {
  try {
    const drafts = await getDraftTransactions(storage);
    return drafts.find((draft) => draft.id === draftId) || null;
  } catch (error) {
    console.error("Failed to get draft transaction:", error);
    return null;
  }
};

export const updateDraftTransaction = async (
  storage: any,
  draftId: string,
  updates: Partial<Omit<SafeTransactionDraft, "id" | "createdAt">>,
): Promise<boolean> => {
  try {
    const drafts = await getDraftTransactions(storage);
    const draftIndex = drafts.findIndex((draft) => draft.id === draftId);

    if (draftIndex === -1) {
      return false;
    }

    // Ensure valid date format for updatedAt
    const timestamp = new Date().toISOString();

    // Update the draft
    drafts[draftIndex] = {
      ...drafts[draftIndex],
      ...updates,
      updatedAt: timestamp,
    };

    // Save updated drafts
    await storage.setItem(STORAGE_KEY.DRAFT_TRANSACTIONS, drafts);
    return true;
  } catch (error) {
    console.error("Failed to update draft transaction:", error);
    return false;
  }
};

export const deleteDraftTransaction = async (storage: any, draftId: string): Promise<boolean> => {
  try {
    const drafts = await getDraftTransactions(storage);
    const filteredDrafts = drafts.filter((draft) => draft.id !== draftId);

    if (filteredDrafts.length === drafts.length) {
      // No draft was removed
      return false;
    }

    // Save updated drafts
    await storage.setItem(STORAGE_KEY.DRAFT_TRANSACTIONS, filteredDrafts);
    return true;
  } catch (error) {
    console.error("Failed to delete draft transaction:", error);
    return false;
  }
};

export const exportTransactionsToHex = (
  transactions: Transaction[],
  safeAccount: `0x${string}`,
  safeTx?: any,
  safeTxHash?: `0x${string}`,
): string => {
  const exportData: ImportData = {
    transactions: transactions,
    safeAccount: safeAccount,
    ...(safeTx && { safeTransaction: safeTx }),
    ...(safeTxHash && { safeTransactionHash: safeTxHash }),
  };

  const exportDataString = JSON.stringify(exportData, (_key, value) =>
    typeof value === "bigint" ? value.toString() : value,
  );
  return bytesToHex(stringToBytes(exportDataString));
};

export const importTransactionsFromHex = (hexData: `0x${string}`): ImportData => {
  const jsonString = new TextDecoder().decode(hexToBytes(hexData));
  return JSON.parse(jsonString) as ImportData;
};

// Add a utility function to validate draft dates when loading
export const validateDraftDates = (draft: SafeTransactionDraft): SafeTransactionDraft => {
  // If dates are invalid, replace them with current time
  const now = new Date().toISOString();

  return {
    ...draft,
    createdAt: isValidDateString(draft.createdAt) ? draft.createdAt : now,
    updatedAt: isValidDateString(draft.updatedAt) ? draft.updatedAt : now,
  };
};

// Helper to check if a string is a valid date
const isValidDateString = (dateStr: string): boolean => {
  try {
    const date = new Date(dateStr);
    return !Number.isNaN(date.getTime());
  } catch {
    return false;
  }
};
