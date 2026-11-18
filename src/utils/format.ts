import { formatUnits } from "viem";

const MAX_FRACTION_DIGITS = 5;

/** Formats a token amount without float rounding, truncating (never rounding up) extra decimals. */
export const formatTokenAmount = (value: bigint, decimals: number, maxFractionDigits = MAX_FRACTION_DIGITS) => {
  const [whole, fraction = ""] = formatUnits(value, decimals).split(".");
  const trimmed = fraction.slice(0, maxFractionDigits).replace(/0+$/, "");
  return trimmed ? `${whole}.${trimmed}` : whole;
};
