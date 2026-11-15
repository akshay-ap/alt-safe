const GROUP_SIZE = 4;

/**
 * Splits a 0x-prefixed hex string into groups of four so people can compare
 * addresses and hashes chunk by chunk, the way bank numbers are printed.
 */
export const chunkHex = (value: string): string[] => {
  if (!/^0x[0-9a-fA-F]*$/.test(value)) return [value];
  const digits = value.slice(2);
  const groups = digits.match(new RegExp(`.{1,${GROUP_SIZE}}`, "g")) ?? [];
  if (groups.length === 0) return [value];
  return [`0x${groups[0]}`, ...groups.slice(1)];
};
