import { bytesToHex, type Hex, hexToString, keccak256, stringToBytes, toHex, zeroAddress } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { describe, expect, it } from "vitest";
import { exportSignedTransactionToHex, exportTransactionsToHex } from "../api/api";
import { TransactionType } from "../context/types";
import { mergeSignatures, parseSharedTransaction, parseSignatures } from "./signatures";
import { calculateSafeTransactionHash, SafeOperation, type SafeTransactionParams } from "./utils";

const ownerA = privateKeyToAccount(generatePrivateKey());
const ownerB = privateKeyToAccount(generatePrivateKey());
const stranger = privateKeyToAccount(generatePrivateKey());
const owners = [ownerA.address, ownerB.address];
const safe = { address: privateKeyToAccount(generatePrivateKey()).address, chainId: 11155111, nonce: 3n };

const safeTransaction: SafeTransactionParams = {
  to: "0x000000000000000000000000000000000000dEaD",
  value: 1000n,
  data: "0x",
  operation: SafeOperation.CALL,
  safeTxGas: 0n,
  baseGas: 0n,
  gasPrice: 0n,
  gasToken: zeroAddress,
  refundReceiver: zeroAddress,
  nonce: 3n,
};
const hash = calculateSafeTransactionHash(safeTransaction, safe.address, safe.chainId);
const otherHash = keccak256(toHex("another transaction"));
const transactions = [
  {
    type: TransactionType.ETH_TRANSFER,
    groupName: "Native",
    actionName: "ETH Transfer",
    to: safeTransaction.to as Hex,
    value: "1000",
    data: "0x" as Hex,
  },
];
// The signed part as it travels in JSON: amounts as decimal strings.
const txJson = JSON.parse(JSON.stringify(safeTransaction, (_k, v) => (typeof v === "bigint" ? v.toString() : v)));
const unsigned = exportTransactionsToHex(transactions, safe.address, safeTransaction, hash);
const sigA = await ownerA.sign({ hash });
const sigB = await ownerB.sign({ hash });
const signed = (signatures: { signer: string; data: unknown }[], safeTransactionHash = hash) =>
  exportSignedTransactionToHex({
    transactions,
    safeAccount: safe.address,
    safeTransaction,
    safeTransactionHash,
    signature: signatures[0] as { signer: string; data: string },
    signatures: signatures as { signer: string; data: string }[],
  });
// Hex of arbitrary JSON, to build payloads ALT Safe would never write.
const json = (value: unknown) => bytesToHex(stringToBytes(JSON.stringify(value)));
const payload = (patch: Record<string, unknown>) => json({ ...JSON.parse(hexToString(unsigned as Hex)), ...patch });

describe("parseSignatures", () => {
  describe("accepts", () => {
    it("a raw signature from an owner, trimmed", async () => {
      expect(await parseSignatures(` ${sigB}\n`, hash, owners)).toEqual([{ signer: ownerB.address, data: sigB }]);
    });

    it("a raw signature wrapped across lines by a chat app", async () => {
      const wrapped = `${sigA.slice(0, 50)}\n${sigA.slice(50, 100)}\r\n ${sigA.slice(100)}`;
      expect((await parseSignatures(wrapped, hash, owners))[0].signer).toBe(ownerA.address);
    });

    it("every signature in a shared transaction", async () => {
      const input = signed([
        { signer: ownerA.address, data: sigA },
        { signer: ownerB.address, data: sigB },
      ]);
      expect((await parseSignatures(input, hash, owners)).map((s) => s.signer)).toEqual(owners);
    });

    it("the single signature of a payload from an older version", async () => {
      const old = payload({ signature: { signer: ownerA.address, data: sigA } });
      expect((await parseSignatures(old, hash, owners))[0].signer).toBe(ownerA.address);
    });

    it("the recovered signer, not the one the payload claims", async () => {
      const [sig] = await parseSignatures(signed([{ signer: ownerA.address, data: sigB }]), hash, owners);
      expect(sig.signer).toBe(ownerB.address);
    });
  });

  describe("rejects invalid input", () => {
    it.each([
      ["empty input", ""],
      ["whitespace", "  \n "],
      ["a bare 0x", "0x"],
      ["a random string", "hello world"],
      ["hex without 0x", sigA.slice(2)],
      ["non-hex characters", `0x${"zz".repeat(65)}`],
    ])("%s", async (_, input) => {
      await expect(parseSignatures(input, hash, owners)).rejects.toThrow(/start with 0x|not a signature/);
    });

    it.each([
      ["a short hex value", "0x1234"],
      ["an address", ownerA.address],
      ["an odd-length hex value", "0x123"],
      ["hex that is not JSON", `0x${"ab".repeat(80)}`],
      ["JSON null", json(null)],
      ["a JSON number", json(42)],
      ["a JSON list", json([sigA])],
      ["signatures that are not a list", payload({ signatures: "nope" })],
    ])("%s", async (_, input) => {
      await expect(parseSignatures(input, hash, owners)).rejects.toThrow("not a signature or a transaction shared");
    });
  });

  describe("rejects signatures that cannot be used", () => {
    it("65 zero bytes", async () => {
      await expect(parseSignatures(`0x${"00".repeat(65)}`, hash, owners)).rejects.toThrow("does not match");
    });

    it("65 random bytes", async () => {
      await expect(
        parseSignatures(`${keccak256("0x01")}${keccak256("0x02").slice(2)}1b`, hash, owners),
      ).rejects.toThrow("does not match");
    });

    it("a valid signature from a wallet that is not an owner", async () => {
      await expect(parseSignatures(await stranger.sign({ hash }), hash, owners)).rejects.toThrow(
        "not made by an owner",
      );
    });

    it("an owner's signature over a different transaction", async () => {
      await expect(parseSignatures(await ownerA.sign({ hash: otherHash }), hash, owners)).rejects.toThrow(
        "does not match",
      );
    });

    it("a shared transaction for a different transaction", async () => {
      const other = signed([{ signer: ownerA.address, data: sigA }], otherHash);
      await expect(parseSignatures(other, hash, owners)).rejects.toThrow("different transaction");
    });

    it("a shared transaction without signatures", async () => {
      await expect(parseSignatures(unsigned, hash, owners)).rejects.toThrow("no signatures yet");
      await expect(parseSignatures(payload({ signatures: [] }), hash, owners)).rejects.toThrow("no signatures yet");
    });

    it.each([
      ["entry without data", [{ signer: ownerA.address }]],
      ["null entry", [null]],
      ["data that is not hex", [{ signer: ownerA.address, data: "signature" }]],
      ["data with the wrong length", [{ signer: ownerA.address, data: sigA.slice(0, 100) }]],
      ["a numeric data field", [{ signer: ownerA.address, data: 7 }]],
    ])("a shared signature with %s", async (_, signatures) => {
      await expect(parseSignatures(payload({ signatures }), hash, owners)).rejects.toThrow("does not match");
    });

    it("the whole paste when one of its signatures is forged", async () => {
      const mixed = signed([
        { signer: ownerA.address, data: sigA },
        { signer: ownerB.address, data: await stranger.sign({ hash }) },
      ]);
      await expect(parseSignatures(mixed, hash, owners)).rejects.toThrow("not made by an owner");
    });
  });
});

describe("parseSharedTransaction", () => {
  it("returns the transaction with bigint amounts", () => {
    const data = parseSharedTransaction(`\n${unsigned} `, safe);
    expect(data.safeTransactionHash).toBe(hash);
    expect(data.safeTransaction.value).toBe(1000n);
    expect(data.safeTransaction.nonce).toBe(3n);
  });

  it("accepts a signed transaction", () => {
    expect(parseSharedTransaction(signed([{ signer: ownerA.address, data: sigA }]), safe).safeTransactionHash).toBe(
      hash,
    );
  });

  it.each([
    ["empty input", ""],
    ["a random string", "not a transaction"],
    ["a bare 0x", "0x"],
  ])("rejects %s", (_, input) => {
    expect(() => parseSharedTransaction(input, safe)).toThrow("starts with 0x");
  });

  it.each([
    ["a raw signature", sigA],
    ["hex that is not JSON", `0x${"ab".repeat(80)}`],
    ["JSON null", json(null)],
    ["an empty object", json({})],
    ["a missing safe transaction", payload({ safeTransaction: undefined })],
    ["a missing hash", payload({ safeTransactionHash: undefined })],
    ["an amount that is not a number", payload({ safeTransaction: { ...txJson, value: "abc" } })],
    ["a negative amount", payload({ safeTransaction: { ...txJson, value: "-1" } })],
    ["a summary that is not a list", payload({ transactions: "x" })],
    ["a summary amount the page cannot show", payload({ transactions: [{ ...transactions[0], value: "abc" }] })],
    ["a summary with a bad address", payload({ transactions: [{ ...transactions[0], to: "0x123" }] })],
  ])("rejects %s", (_, input) => {
    expect(() => parseSharedTransaction(input, safe)).toThrow("not a signature or a transaction shared");
  });

  it("rejects a transaction for another Safe", () => {
    expect(() => parseSharedTransaction(payload({ safeAccount: ownerA.address }), safe)).toThrow("different Safe");
    expect(() => parseSharedTransaction(payload({ safeAccount: "nope" }), safe)).toThrow("different Safe");
  });

  it("rejects a transaction made for another network", () => {
    expect(() => parseSharedTransaction(unsigned, { ...safe, chainId: 1 })).toThrow("do not match its hash");
  });

  it("rejects details that were changed after hashing", () => {
    const tampered = payload({ safeTransaction: { ...txJson, value: "999999" } });
    expect(() => parseSharedTransaction(tampered, safe)).toThrow("do not match its hash");
  });

  it("rejects a malformed field inside the signed part", () => {
    const bad = payload({ safeTransaction: { ...txJson, to: "0x123" } });
    expect(() => parseSharedTransaction(bad, safe)).toThrow("do not match its hash");
  });

  it("rejects a nonce the Safe has already used", () => {
    expect(() => parseSharedTransaction(unsigned, { ...safe, nonce: 4n })).toThrow("already been used");
  });
});

describe("mergeSignatures", () => {
  it("keeps one signature per signer", () => {
    const a = { signer: ownerA.address, data: sigA };
    const merged = mergeSignatures(
      [a],
      [
        { ...a, signer: a.signer.toLowerCase() },
        { signer: ownerB.address, data: sigB },
      ],
    );
    expect(merged).toHaveLength(2);
  });
});
