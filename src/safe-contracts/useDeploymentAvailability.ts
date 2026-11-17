import { useQueries } from "@tanstack/react-query";
import type { Address, PublicClient } from "viem";
import { usePublicClient } from "wagmi";
import type { SafeDeployment } from "./addresses/addresses";
import type { DeploymentOption, DeploymentOptionId } from "./deploymentOptions";

/** true when deployed, false when missing, undefined while unknown (loading or RPC error). */
export type Availability = Partial<Record<DeploymentOptionId, boolean>>;

const hasCode = async (client: PublicClient, address: Address) => {
  const code = await client.getCode({ address });
  return code !== undefined && code !== "0x";
};

// The contracts a new Safe cannot work without; MultiSend is only needed for batches.
const isDeployed = async (client: PublicClient, deployment: SafeDeployment) => {
  const required = [deployment.proxyFactory, deployment.singleton, deployment.singletonL2, deployment.fallbackHandler];
  const results = await Promise.all(required.map((address) => hasCode(client, address)));
  return results.every(Boolean);
};

export const useDeploymentAvailability = (options: DeploymentOption[]): Availability => {
  const client = usePublicClient();
  const results = useQueries({
    queries: options.map((option) => ({
      queryKey: ["safeDeploymentAvailability", client?.chain.id, option.deployment],
      queryFn: () => isDeployed(client as PublicClient, option.deployment),
      enabled: Boolean(client),
      staleTime: Number.POSITIVE_INFINITY,
    })),
  });
  return Object.fromEntries(options.map((option, index) => [option.id, results[index]?.data]));
};
