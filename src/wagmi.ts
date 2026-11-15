import { createConfig } from "@wagmi/core";
import type { Transport } from "viem";
import {
  arbitrum,
  arbitrumGoerli,
  avalanche,
  base,
  baseSepolia,
  blast,
  blastSepolia,
  type Chain,
  gnosis,
  hardhat,
  linea,
  lineaSepolia,
  mainnet,
  optimism,
  optimismSepolia,
  sepolia,
  worldchain,
  worldchainSepolia,
} from "wagmi/chains";
import { coinbaseWallet, injected } from "wagmi/connectors";
import { chainRpcTransport } from "./rpc/transport";

// The first chain is wagmi's default before a wallet connects, so it must be a public network.
export const supportedChains = [
  mainnet,
  arbitrum,
  arbitrumGoerli,
  avalanche,
  base,
  baseSepolia,
  blast,
  blastSepolia,
  gnosis,
  linea,
  lineaSepolia,
  optimism,
  optimismSepolia,
  sepolia,
  worldchain,
  worldchainSepolia,
  hardhat,
] as const satisfies readonly [Chain, ...Chain[]];

type SupportedChainId = (typeof supportedChains)[number]["id"];

const transports = Object.fromEntries(
  supportedChains.map((chain) => [chain.id, chainRpcTransport(chain.id)]),
) as Record<SupportedChainId, Transport>;

export const config = createConfig({
  chains: supportedChains,
  // TODO: Walletconnect support walletConnect({ projectId: <project id> })
  connectors: [injected(), coinbaseWallet()],
  transports,
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
