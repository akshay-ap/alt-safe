import { createTransport, type EIP1193RequestFn, http, type Transport } from "viem";
import { getRpcUrl } from "./rpcStore";

type ResolvedTransport = ReturnType<Transport>;

/**
 * Resolves the chain's RPC URL on every request, so a URL saved in settings takes
 * effect immediately instead of after a page reload. Falls back to the chain's
 * default public RPC while none is configured.
 */
export const chainRpcTransport =
  (chainId: number): Transport =>
  (params) => {
    const transports = new Map<string, ResolvedTransport>();
    const resolve = (): ResolvedTransport => {
      const url = getRpcUrl(chainId);
      const cacheKey = url ?? "";
      const cached = transports.get(cacheKey);
      if (cached) return cached;
      const transport = http(url)(params);
      transports.set(cacheKey, transport);
      return transport;
    };

    // The inner http transport already retries; retrying here as well would multiply attempts.
    return createTransport({
      key: "chainRpc",
      name: "Per-chain RPC",
      type: "http",
      retryCount: 0,
      request: ((args) => resolve().request(args)) as EIP1193RequestFn,
    });
  };
