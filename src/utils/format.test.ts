import { parseEther } from "viem";
import { describe, expect, it } from "vitest";
import { formatTokenAmount } from "./format";

describe("formatTokenAmount", () => {
  it("drops trailing zeros and the decimal point for whole amounts", () => {
    expect(formatTokenAmount(parseEther("2"), 18)).toBe("2");
    expect(formatTokenAmount(0n, 18)).toBe("0");
  });

  it("truncates instead of rounding so balances are never overstated", () => {
    expect(formatTokenAmount(parseEther("0.123456789"), 18)).toBe("0.12345");
    expect(formatTokenAmount(parseEther("0.999999999"), 18)).toBe("0.99999");
  });

  it("keeps large values exact", () => {
    expect(formatTokenAmount(parseEther("123456789012345678.5"), 18)).toBe("123456789012345678.5");
  });

  it("respects a custom precision and token decimals", () => {
    expect(formatTokenAmount(1234567n, 6, 2)).toBe("1.23");
  });
});
