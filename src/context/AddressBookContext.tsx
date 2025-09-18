import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { Address } from "viem";
import { isAddress } from "viem";
import { STORAGE_KEY } from "../constants";
import { useSafeWalletContext } from "./WalletContext";

export interface AddressBookEntry {
  address: Address;
  name: string;
  chainId: number;
}

interface AddressBookState {
  addressBook: AddressBookEntry[];
  isLoading: boolean;
}

interface AddressBookActions {
  addEntry: (entry: AddressBookEntry) => Promise<void>;
  updateEntry: (address: Address, updates: Partial<Omit<AddressBookEntry, "address">>) => Promise<void>;
  removeEntry: (address: Address, chainId: number) => Promise<void>;
  importEntries: (entries: AddressBookEntry[]) => Promise<void>;
  getEntriesByChain: (chainId: number) => AddressBookEntry[];
  findEntry: (address: Address, chainId: number) => AddressBookEntry | undefined;
}

interface AddressBookContextValue extends AddressBookState, AddressBookActions {}

const AddressBookContext = createContext<AddressBookContextValue | undefined>(undefined);

export const useAddressBook = (): AddressBookContextValue => {
  const context = useContext(AddressBookContext);
  if (!context) {
    throw new Error("useAddressBook must be used within an AddressBookProvider");
  }
  return context;
};

interface AddressBookProviderProps {
  children: React.ReactNode;
}

export const AddressBookProvider: React.FC<AddressBookProviderProps> = ({ children }) => {
  const [addressBook, setAddressBook] = useState<AddressBookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { storage } = useSafeWalletContext();

  // Load address book from storage on mount
  useEffect(() => {
    const loadAddressBook = async () => {
      try {
        setIsLoading(true);
        const storedAddressBook = (await storage.getItem(STORAGE_KEY.ADDRESS_BOOK)) as AddressBookEntry[] | null;

        // If no stored data, add some sample entries for testing
        if (!storedAddressBook || storedAddressBook.length === 0) {
          const sampleEntries: AddressBookEntry[] = [
            {
              address: "0x1234567890123456789012345678901234567890" as Address,
              name: "Sample Address 1",
              chainId: 1,
            },
            {
              address: "0x0987654321098765432109876543210987654321" as Address,
              name: "Test Wallet",
              chainId: 1,
            },
            {
              address: "0xAbCdEf1234567890123456789012345678901234" as Address,
              name: "Demo Safe",
              chainId: 137,
            },
          ];
          setAddressBook(sampleEntries);
          await storage.setItem(STORAGE_KEY.ADDRESS_BOOK, sampleEntries);
        } else {
          setAddressBook(storedAddressBook);
        }
      } catch (error) {
        console.error("Failed to load address book from storage:", error);
        setAddressBook([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAddressBook();
  }, [storage]);

  const saveToStorage = async (entries: AddressBookEntry[]) => {
    try {
      await storage.setItem(STORAGE_KEY.ADDRESS_BOOK, entries);
    } catch (error) {
      console.error("Failed to save address book to storage:", error);
      throw error;
    }
  };

  const addEntry = async (entry: AddressBookEntry) => {
    if (!isAddress(entry.address)) {
      throw new Error("Invalid address");
    }

    const existingIndex = addressBook.findIndex(
      (existingEntry) =>
        existingEntry.address.toLowerCase() === entry.address.toLowerCase() && existingEntry.chainId === entry.chainId,
    );

    let newAddressBook: AddressBookEntry[];
    if (existingIndex >= 0) {
      // Update existing entry
      newAddressBook = [...addressBook];
      newAddressBook[existingIndex] = entry;
    } else {
      // Add new entry
      newAddressBook = [...addressBook, entry];
    }

    setAddressBook(newAddressBook);
    await saveToStorage(newAddressBook);
  };

  const updateEntry = async (address: Address, updates: Partial<Omit<AddressBookEntry, "address">>) => {
    const entryIndex = addressBook.findIndex(
      (entry) => entry.address.toLowerCase() === address.toLowerCase() && entry.chainId === updates.chainId,
    );

    if (entryIndex === -1) {
      throw new Error("Entry not found");
    }

    const newAddressBook = [...addressBook];
    newAddressBook[entryIndex] = { ...newAddressBook[entryIndex], ...updates };

    setAddressBook(newAddressBook);
    await saveToStorage(newAddressBook);
  };

  const removeEntry = async (address: Address, chainId: number) => {
    const newAddressBook = addressBook.filter(
      (entry) => !(entry.address.toLowerCase() === address.toLowerCase() && entry.chainId === chainId),
    );

    setAddressBook(newAddressBook);
    await saveToStorage(newAddressBook);
  };

  const importEntries = async (entries: AddressBookEntry[]) => {
    const validEntries = entries.filter(
      (entry) => isAddress(entry.address) && entry.name && typeof entry.chainId === "number",
    );

    // Merge with existing entries, avoiding duplicates
    const mergedEntries = [...addressBook];

    for (const entry of validEntries) {
      const existingIndex = mergedEntries.findIndex(
        (existing) =>
          existing.address.toLowerCase() === entry.address.toLowerCase() && existing.chainId === entry.chainId,
      );

      if (existingIndex >= 0) {
        // Update existing entry
        mergedEntries[existingIndex] = entry;
      } else {
        // Add new entry
        mergedEntries.push(entry);
      }
    }

    setAddressBook(mergedEntries);
    await saveToStorage(mergedEntries);
  };

  const getEntriesByChain = (chainId: number): AddressBookEntry[] => {
    return addressBook.filter((entry) => entry.chainId === chainId);
  };

  const findEntry = (address: Address, chainId: number): AddressBookEntry | undefined => {
    return addressBook.find(
      (entry) => entry.address.toLowerCase() === address.toLowerCase() && entry.chainId === chainId,
    );
  };

  const contextValue: AddressBookContextValue = {
    // State
    addressBook,
    isLoading,

    // Actions
    addEntry,
    updateEntry,
    removeEntry,
    importEntries,
    getEntriesByChain,
    findEntry,
  };

  return <AddressBookContext.Provider value={contextValue}>{children}</AddressBookContext.Provider>;
};
