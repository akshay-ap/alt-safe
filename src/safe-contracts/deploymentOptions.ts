import { getSafeDeployment, SAFE_VERSIONS, type SafeDeployment, type SafeVersion } from "./addresses/addresses";

export const CUSTOM_DEPLOYMENT_ID = "custom";

export type DeploymentOptionId = SafeVersion | typeof CUSTOM_DEPLOYMENT_ID;

export type DeploymentOption = {
  id: DeploymentOptionId;
  label: string;
  deployment: SafeDeployment;
};

/** The official deployment of each Safe version on the chain, plus the user's custom one if any. */
export const getDeploymentOptions = (
  chainId: number,
  customDeployment: SafeDeployment | undefined,
): DeploymentOption[] => {
  const versions: DeploymentOption[] = SAFE_VERSIONS.map((version) => ({
    id: version,
    label: `v${version}`,
    deployment: getSafeDeployment(version, chainId),
  }));
  return customDeployment
    ? [...versions, { id: CUSTOM_DEPLOYMENT_ID, label: "Custom", deployment: customDeployment }]
    : versions;
};

export const findDeploymentOption = (options: DeploymentOption[], id: DeploymentOptionId) =>
  options.find((option) => option.id === id);
