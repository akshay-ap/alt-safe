import { createConfig } from "@wagmi/core";
import { createClient } from "viem";
import { http } from "wagmi";
import {
  type Chain,
  arbitrum,
  arbitrumGoerli,
  avalanche,
  base,
  baseSepolia,
  blast,
  blastSepolia,
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
import { STORAGE_KEY, WALLET_STORAGE_KEY } from "./constants";

export const supportedChains: Chain[] = [
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
  mainnet,
  optimism,
  optimismSepolia,
  sepolia,
  worldchain,
  worldchainSepolia,
  hardhat,
];

export const config = createConfig({
  chains: [
    hardhat,
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
    mainnet,
    optimism,
    optimismSepolia,
    sepolia,
    worldchain,
    worldchainSepolia,
  ],
  // TODO: Walletconnect support walletConnect({ projectId: import.meta.env.VITE_WC_PROJECT_ID })
  connectors: [injected(), coinbaseWallet()],
  client({ chain }) {
    const rpc = (localStorage.getItem(`${WALLET_STORAGE_KEY}.${STORAGE_KEY.RPC}`) as string).replace(/"/g, "");
    return createClient({ chain, transport: rpc ? http(rpc) : http() });
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
