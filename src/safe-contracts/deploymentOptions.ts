import { getSafeDeployment, SAFE_VERSIONS, type SafeDeployment, type SafeVersion } from "./addresses/addresses";

export type DeploymentOptionId = SafeVersion;

export type DeploymentOption = {
  id: DeploymentOptionId;
  label: string;
  deployment: SafeDeployment;
};

/** The official deployment of each Safe version on the chain. */
export const getDeploymentOptions = (chainId: number): DeploymentOption[] =>
  SAFE_VERSIONS.map((version) => ({
    id: version,
    label: `v${version}`,
    deployment: getSafeDeployment(version, chainId),
  }));

export const findDeploymentOption = (options: DeploymentOption[], id: DeploymentOptionId) =>
  options.find((option) => option.id === id);
