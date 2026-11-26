import type { AddressBookEntry } from "../context/AddressBookContext";

// Sample contacts that builds before #82 saved into empty address books.
const SEEDED_SAMPLES = [
  { address: "0x1234567890123456789012345678901234567890", name: "Sample Address 1", chainId: 1 },
  { address: "0x0987654321098765432109876543210987654321", name: "Test Wallet", chainId: 1 },
  { address: "0xabcdef1234567890123456789012345678901234", name: "Demo Safe", chainId: 137 },
];

/** Drops the old seeded samples; an entry the user renamed or moved is kept. */
export const withoutSeededSamples = (book: AddressBookEntry[]): AddressBookEntry[] =>
  book.filter(
    (entry) =>
      !SEEDED_SAMPLES.some(
        (s) => s.address === entry.address.toLowerCase() && s.name === entry.name && s.chainId === entry.chainId,
      ),
  );
