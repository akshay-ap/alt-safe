import { describe, expect, it } from "vitest";
import { parseAddressBookCsv } from "./addressBookCsv";

const ALICE = "0x3C46Bd45eB70E441aedeefE568C0322CFA4fE17A";
const BOB = "0xC2928299072B9918a6d62a2309b18b71b0c2Fbe5";

describe("parseAddressBookCsv", () => {
  it("parses rows in any column order, case-insensitively", () => {
    const csv = `Name,chainId,ADDRESS\nAlice,11155111,${ALICE}\nBob,1,${BOB}\n`;
    expect(parseAddressBookCsv(csv)).toEqual({
      ok: true,
      entries: [
        { address: ALICE, name: "Alice", chainId: 11155111 },
        { address: BOB, name: "Bob", chainId: 1 },
      ],
    });
  });

  it("handles Windows line endings and blank lines", () => {
    const csv = `address,name,chainId\r\n\r\n${ALICE},Alice,1\r\n`;
    expect(parseAddressBookCsv(csv)).toEqual({ ok: true, entries: [{ address: ALICE, name: "Alice", chainId: 1 }] });
  });

  it("skips rows with an invalid address or chain ID", () => {
    const csv = `address,name,chainId\nnot-an-address,Eve,1\n${ALICE},Alice,abc\n${BOB},Bob,10`;
    expect(parseAddressBookCsv(csv)).toEqual({ ok: true, entries: [{ address: BOB, name: "Bob", chainId: 10 }] });
  });

  it("reports an empty file", () => {
    expect(parseAddressBookCsv("  \n")).toEqual({ ok: false, error: "The CSV file is empty." });
  });

  it("reports missing headers", () => {
    expect(parseAddressBookCsv(`address,label\n${ALICE},x`)).toEqual({
      ok: false,
      error: "The CSV needs the columns address, name and chainId. Missing: name, chainid.",
    });
  });

  it("reports when no row is valid", () => {
    expect(parseAddressBookCsv("address,name,chainId\nnope,x,1")).toEqual({
      ok: false,
      error: "No valid rows found. Each row needs an address, a name and a numeric chain ID.",
    });
  });
});
