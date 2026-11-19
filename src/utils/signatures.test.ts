import { keccak256, toHex, zeroAddress } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { describe, expect, it } from "vitest";
import { exportSignedTransactionToHex } from "../api/api";
import { mergeSignatures, parseSignatures } from "./signatures";
import { SafeOperation } from "./utils";

const ownerA = privateKeyToAccount(generatePrivateKey());
const ownerB = privateKeyToAccount(generatePrivateKey());
const stranger = privateKeyToAccount(generatePrivateKey());
const owners = [ownerA.address, ownerB.address];
const hash = keccak256(toHex("safe tx"));

const shared = (signatures: { signer: string; data: string }[], safeTransactionHash = hash) =>
  exportSignedTransactionToHex({
    transactions: [],
    safeAccount: zeroAddress,
    safeTransaction: {
      to: zeroAddress,
      value: 0n,
      data: "0x",
      operation: SafeOperation.CALL,
      safeTxGas: 0n,
      baseGas: 0n,
      gasPrice: 0n,
      gasToken: zeroAddress,
      refundReceiver: zeroAddress,
      nonce: 0n,
    },
    safeTransactionHash,
    signature: signatures[0],
    signatures,
  });

describe("parseSignatures", async () => {
  const sigA = await ownerA.sign({ hash });
  const sigB = await ownerB.sign({ hash });

  it("recovers the signer of a raw signature", async () => {
    expect(await parseSignatures(` ${sigB} `, hash, owners)).toEqual([{ signer: ownerB.address, data: sigB }]);
  });

  it("reads every signature in a shared transaction", async () => {
    const input = shared([
      { signer: ownerA.address, data: sigA },
      { signer: ownerB.address, data: sigB },
    ]);
    expect((await parseSignatures(input, hash, owners)).map((s) => s.signer)).toEqual(owners);
  });

  it("ignores the claimed signer and trusts the signature", async () => {
    const [sig] = await parseSignatures(shared([{ signer: ownerA.address, data: sigB }]), hash, owners);
    expect(sig.signer).toBe(ownerB.address);
  });

  it("rejects non-owners, other transactions and junk", async () => {
    await expect(parseSignatures(await stranger.sign({ hash }), hash, owners)).rejects.toThrow("owner");
    await expect(
      parseSignatures(shared([{ signer: ownerA.address, data: sigA }], keccak256("0x01")), hash, owners),
    ).rejects.toThrow("different transaction");
    await expect(parseSignatures("hello", hash, owners)).rejects.toThrow("0x");
    await expect(parseSignatures("0x1234", hash, owners)).rejects.toThrow("not a signature");
  });

  it("keeps one signature per signer", () => {
    const a = { signer: ownerA.address, data: sigA };
    expect(
      mergeSignatures(
        [a],
        [
          { ...a, signer: a.signer.toLowerCase() },
          { signer: ownerB.address, data: sigB },
        ],
      ),
    ).toHaveLength(2);
  });
});
