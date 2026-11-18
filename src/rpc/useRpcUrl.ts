import { useSyncExternalStore } from "react";
import { getRpcUrl, subscribeRpcUrls } from "./rpcStore";

export const useRpcUrl = (chainId: number | undefined): string | undefined =>
  useSyncExternalStore(subscribeRpcUrls, () => (chainId === undefined ? undefined : getRpcUrl(chainId)));
