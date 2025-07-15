import type { Address } from "viem";

export type SafeDeployment = {
  singleton: Address;
  singletonL2: Address;
  proxyFactory: Address;
  fallbackHandler: Address;
  multiSend: Address;
  multiSendCallOnly: Address;
};

export enum SafeVersion {
  V1_4_1 = "1.4.1",
}

export enum SafeDeploymentType {
  CANONICAL = "canonical",
}

export type SafeAddresses = {
  [chainId: number]: {
    [version in SafeVersion]: {
      [dpeloymentType in SafeDeploymentType]: SafeDeployment;
    };
  };
};

export const canonicalAddresses_141: SafeDeployment = {
  proxyFactory: import.meta.env.VITE_PROXY_FACTORY_ADDRESS as Address,
  singleton: import.meta.env.VITE_SINGLETON_ADDRESS as Address,
  singletonL2: import.meta.env.VITE_SINGLETON_L2_ADDRESS as Address,
  fallbackHandler: import.meta.env.VITE_FALLBACK_HANDLER_ADDRESS as Address,
  multiSend: import.meta.env.VITE_MULTI_SEND_ADDRESS as Address,
  multiSendCallOnly: import.meta.env.VITE_MULTI_SEND_CALL_ONLY_ADDRESS as Address,
};
