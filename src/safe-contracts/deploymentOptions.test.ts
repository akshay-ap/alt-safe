import { describe, expect, it } from "vitest";
import { getSafeDeployment, SafeVersion } from "./addresses/addresses";
import { findDeploymentOption, getDeploymentOptions } from "./deploymentOptions";

const SEPOLIA = 11155111;
const OP_SEPOLIA = 11155420;

describe("getDeploymentOptions", () => {
  it("offers every Safe version, newest first", () => {
    const options = getDeploymentOptions(SEPOLIA);
    expect(options.map((option) => option.id)).toEqual([SafeVersion.V1_5_0, SafeVersion.V1_4_1, SafeVersion.V1_3_0]);
    expect(options.map((option) => option.label)).toEqual(["v1.5.0", "v1.4.1", "v1.3.0"]);
  });

  it("resolves chain-specific addresses", () => {
    const option = findDeploymentOption(getDeploymentOptions(OP_SEPOLIA), SafeVersion.V1_3_0);
    expect(option?.deployment).toEqual(getSafeDeployment(SafeVersion.V1_3_0, OP_SEPOLIA));
  });
});

describe("findDeploymentOption", () => {
  it("returns undefined for an unknown id", () => {
    expect(findDeploymentOption(getDeploymentOptions(SEPOLIA), "0.0.0" as SafeVersion)).toBeUndefined();
  });
});
