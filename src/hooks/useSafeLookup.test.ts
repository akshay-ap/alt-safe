import { describe, expect, it } from "vitest";
import { isSupportedSafeVersion } from "./useSafeLookup";

describe("isSupportedSafeVersion", () => {
  it("accepts v1.3.0 and later, including L2 suffixes", () => {
    for (const v of ["1.3.0", "1.3.0+L2", "1.4.1", "1.5.0", "2.0.0"]) expect(isSupportedSafeVersion(v)).toBe(true);
  });
  it("refuses versions before v1.3.0 and unparsable ones", () => {
    for (const v of ["1.2.0", "1.1.1", "1.0.0", "0.1.0", "abc"]) expect(isSupportedSafeVersion(v)).toBe(false);
  });
});
