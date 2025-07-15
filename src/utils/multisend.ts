import { concatHex, encodePacked } from "viem";
import type { MetaTransaction } from "./utils";

export const encodeMetaTransaction = (tx: MetaTransaction): `0x${string}` => {
  const encoded = encodePacked(
    ["uint8", "address", "uint256", "uint256", "bytes"],
    [tx.operation, tx.to, tx.value, BigInt((tx.data.length - 2) / 2), tx.data],
  );

  return encoded.slice(2) as `0x${string}`;
};

export const encodeMultiSend = (txs: MetaTransaction[]): string => {
  return concatHex(txs.map((tx) => encodeMetaTransaction(tx)));
};
