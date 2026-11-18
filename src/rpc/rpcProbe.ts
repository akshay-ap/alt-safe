import { isHex } from "viem";
import { isValidRpcUrl } from "./rpcStore";

export enum RpcProbeError {
  INVALID_URL = "invalid-url",
  UNREACHABLE = "unreachable",
  INVALID_RESPONSE = "invalid-response",
  WRONG_CHAIN = "wrong-chain",
}

export type RpcProbeResult =
  | { ok: true; chainId: number }
  | { ok: false; error: RpcProbeError.WRONG_CHAIN; chainId: number }
  | { ok: false; error: Exclude<RpcProbeError, RpcProbeError.WRONG_CHAIN> };

const PROBE_TIMEOUT_MS = 8_000;

const requestChainId = async (url: string): Promise<unknown> => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_chainId", params: [] }),
    signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return (await response.json())?.result;
};

// Uses eth_chainId because every node supports it, unlike web3_clientVersion.
export const probeRpc = async (url: string, expectedChainId: number): Promise<RpcProbeResult> => {
  if (!isValidRpcUrl(url)) return { ok: false, error: RpcProbeError.INVALID_URL };

  let result: unknown;
  try {
    result = await requestChainId(url.trim());
  } catch {
    return { ok: false, error: RpcProbeError.UNREACHABLE };
  }

  if (typeof result !== "string" || !isHex(result)) return { ok: false, error: RpcProbeError.INVALID_RESPONSE };
  const chainId = Number(BigInt(result));
  if (chainId !== expectedChainId) return { ok: false, error: RpcProbeError.WRONG_CHAIN, chainId };
  return { ok: true, chainId };
};

export const describeProbeError = (result: Exclude<RpcProbeResult, { ok: true }>): string => {
  switch (result.error) {
    case RpcProbeError.INVALID_URL:
      return "Enter a full http(s):// URL.";
    case RpcProbeError.UNREACHABLE:
      return "Could not reach this RPC. Check the URL, your API key and CORS settings.";
    case RpcProbeError.INVALID_RESPONSE:
      return "This URL did not answer like an Ethereum JSON-RPC endpoint.";
    case RpcProbeError.WRONG_CHAIN:
      return `This RPC serves chain ID ${result.chainId}, not the selected network.`;
  }
};
