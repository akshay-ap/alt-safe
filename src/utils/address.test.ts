import { describe, expect, it } from "vitest";
import { chunkHex } from "./address";

describe("chunkHex", () => {
  it("splits an address into the 0x prefix with four characters, then groups of four", () => {
    expect(chunkHex("0xC2928299072B9918a6d62a2309b18b71b0c2Fbe5")).toEqual([
      "0xC292",
      "8299",
      "072B",
      "9918",
      "a6d6",
      "2a23",
      "09b1",
      "8b71",
      "b0c2",
      "Fbe5",
    ]);
  });

  it("keeps a shorter trailing group for hashes whose length is not a multiple of four", () => {
    expect(chunkHex("0x1234567")).toEqual(["0x1234", "567"]);
  });

  it("returns non-hex input unchanged as a single group", () => {
    expect(chunkHex("not hex")).toEqual(["not hex"]);
  });
});
