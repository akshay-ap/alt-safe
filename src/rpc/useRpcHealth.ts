import { useQuery } from "@tanstack/react-query";
import type { Chain } from "viem";
import { probeRpc, type RpcProbeResult } from "./rpcProbe";
import { useRpcUrl } from "./useRpcUrl";

const HEALTH_CHECK_INTERVAL_MS = 60_000;

export type RpcHealth = {
  url: string | undefined;
  isConfigured: boolean;
  isChecking: boolean;
  result: RpcProbeResult | undefined;
};

export const useRpcHealth = (chain: Chain | undefined): RpcHealth => {
  const savedUrl = useRpcUrl(chain?.id);
  const url = savedUrl ?? chain?.rpcUrls.default.http[0];
  const { data, isFetching } = useQuery({
    queryKey: ["rpcHealth", chain?.id, url],
    queryFn: () => probeRpc(url as string, chain?.id as number),
    enabled: Boolean(chain && url),
    refetchInterval: HEALTH_CHECK_INTERVAL_MS,
  });
  return { url, isConfigured: savedUrl !== undefined, isChecking: isFetching && !data, result: data };
};
