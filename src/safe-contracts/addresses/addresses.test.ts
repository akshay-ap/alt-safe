import { isAddress } from "viem";
import { describe, expect, it } from "vitest";
import {
  CANONICAL_DEPLOYMENTS,
  DEFAULT_SAFE_VERSION,
  getSafeDeployment,
  SAFE_MODULE_SETUP_ADDRESS,
  SAFE_VERSIONS,
  SafeVersion,
} from "./addresses";

const OP_SEPOLIA = 11155420;
const SEPOLIA = 11155111;

describe("Safe deployment addresses", () => {
  it("defines a deployment for every supported version", () => {
    expect(SAFE_VERSIONS).toEqual([SafeVersion.V1_5_0, SafeVersion.V1_4_1, SafeVersion.V1_3_0]);
    expect(Object.keys(CANONICAL_DEPLOYMENTS).sort()).toEqual([...SAFE_VERSIONS].sort());
    expect(SAFE_VERSIONS).toContain(DEFAULT_SAFE_VERSION);
  });

  it.each(SAFE_VERSIONS)("uses checksummed, distinct addresses for v%s", (version) => {
    const addresses = Object.values(CANONICAL_DEPLOYMENTS[version]);
    for (const address of addresses) expect(isAddress(address, { strict: true })).toBe(true);
    expect(new Set(addresses).size).toBe(addresses.length);
  });

  it("does not share contract addresses between versions", () => {
    const all = SAFE_VERSIONS.flatMap((version) => Object.values(CANONICAL_DEPLOYMENTS[version]));
    expect(new Set(all).size).toBe(all.length);
  });

  it("returns the canonical deployment on chains without an override", () => {
    for (const version of SAFE_VERSIONS) {
      expect(getSafeDeployment(version, SEPOLIA)).toEqual(CANONICAL_DEPLOYMENTS[version]);
    }
  });

  it("returns the eip155 v1.3.0 deployment on OP Sepolia", () => {
    const deployment = getSafeDeployment(SafeVersion.V1_3_0, OP_SEPOLIA);
    expect(deployment).not.toEqual(CANONICAL_DEPLOYMENTS[SafeVersion.V1_3_0]);
    expect(deployment.proxyFactory).toBe("0xC22834581EbC8527d974F8a1c97E1bEA4EF910BC");
  });

  it("exposes a checksummed SafeModuleSetup address", () => {
    expect(isAddress(SAFE_MODULE_SETUP_ADDRESS, { strict: true })).toBe(true);
  });
});
