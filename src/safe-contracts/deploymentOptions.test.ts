import { describe, expect, it } from "vitest";
import { CANONICAL_DEPLOYMENTS, getSafeDeployment, type SafeDeployment, SafeVersion } from "./addresses/addresses";
import { CUSTOM_DEPLOYMENT_ID, findDeploymentOption, getDeploymentOptions } from "./deploymentOptions";

const SEPOLIA = 11155111;
const OP_SEPOLIA = 11155420;
const custom: SafeDeployment = {
  ...CANONICAL_DEPLOYMENTS[SafeVersion.V1_4_1],
  proxyFactory: "0x000000000000000000000000000000000000dEaD",
};

describe("getDeploymentOptions", () => {
  it("offers every Safe version, newest first", () => {
    const options = getDeploymentOptions(SEPOLIA, undefined);
    expect(options.map((option) => option.id)).toEqual([SafeVersion.V1_5_0, SafeVersion.V1_4_1, SafeVersion.V1_3_0]);
    expect(options.map((option) => option.label)).toEqual(["v1.5.0", "v1.4.1", "v1.3.0"]);
  });

  it("resolves chain-specific addresses", () => {
    const option = findDeploymentOption(getDeploymentOptions(OP_SEPOLIA, undefined), SafeVersion.V1_3_0);
    expect(option?.deployment).toEqual(getSafeDeployment(SafeVersion.V1_3_0, OP_SEPOLIA));
  });

  it("adds the chain's custom deployment last", () => {
    const options = getDeploymentOptions(SEPOLIA, custom);
    expect(options[options.length - 1]).toEqual({ id: CUSTOM_DEPLOYMENT_ID, label: "Custom", deployment: custom });
  });
});

describe("findDeploymentOption", () => {
  it("returns undefined for an unknown id", () => {
    expect(findDeploymentOption(getDeploymentOptions(SEPOLIA, undefined), CUSTOM_DEPLOYMENT_ID)).toBeUndefined();
  });
});
