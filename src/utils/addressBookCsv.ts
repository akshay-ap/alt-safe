import { type Address, isAddress } from "viem";
import type { AddressBookEntry } from "../context/AddressBookContext";

export type CsvParseResult = { ok: true; entries: AddressBookEntry[] } | { ok: false; error: string };

const REQUIRED_HEADERS = ["address", "name", "chainid"] as const;

const parseRow = (values: string[], index: Record<(typeof REQUIRED_HEADERS)[number], number>) => {
  const address = values[index.address];
  const name = values[index.name];
  const chainId = Number(values[index.chainid]);
  if (!address || !isAddress(address) || !name || !Number.isInteger(chainId)) return undefined;
  return { address: address as Address, name, chainId };
};

/** Parses the Safe{Wallet}-compatible address book export: address, name, chainId columns in any order. */
export const parseAddressBookCsv = (text: string): CsvParseResult => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return { ok: false, error: "The CSV file is empty." };

  const headers = lines[0].split(",").map((header) => header.trim().toLowerCase());
  const missing = REQUIRED_HEADERS.filter((header) => !headers.includes(header));
  if (missing.length > 0) {
    return { ok: false, error: `The CSV needs the columns address, name and chainId. Missing: ${missing.join(", ")}.` };
  }

  const index = Object.fromEntries(REQUIRED_HEADERS.map((header) => [header, headers.indexOf(header)])) as Record<
    (typeof REQUIRED_HEADERS)[number],
    number
  >;
  const entries = lines
    .slice(1)
    .map((line) =>
      parseRow(
        line.split(",").map((value) => value.trim()),
        index,
      ),
    )
    .filter((entry): entry is AddressBookEntry => entry !== undefined);

  return entries.length > 0
    ? { ok: true, entries }
    : { ok: false, error: "No valid rows found. Each row needs an address, a name and a numeric chain ID." };
};
