import type { Address } from "viem";

/**
 * Addresses come from the official deployment registries:
 * - https://github.com/safe-global/safe-deployments (src/assets/v<version>)
 * - https://github.com/safe-global/safe-modules-deployments (safe-4337-module/v0.3.0)
 * Update them from those sources only.
 */

export type SafeDeployment = {
  singleton: Address;
  singletonL2: Address;
  proxyFactory: Address;
  fallbackHandler: Address;
  multiSend: Address;
  multiSendCallOnly: Address;
};

export enum SafeVersion {
  V1_3_0 = "1.3.0",
  V1_4_1 = "1.4.1",
  V1_5_0 = "1.5.0",
}

/** Newest first, the order versions are offered in. */
export const SAFE_VERSIONS = [SafeVersion.V1_5_0, SafeVersion.V1_4_1, SafeVersion.V1_3_0] as const;

export const DEFAULT_SAFE_VERSION = SafeVersion.V1_5_0;

export const CANONICAL_DEPLOYMENTS: Record<SafeVersion, SafeDeployment> = {
  [SafeVersion.V1_3_0]: {
    singleton: "0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552",
    singletonL2: "0x3E5c63644E683549055b9Be8653de26E0B4CD36E",
    proxyFactory: "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2",
    fallbackHandler: "0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4",
    multiSend: "0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761",
    multiSendCallOnly: "0x40A2aCCbd92BCA938b02010E17A5b8929b49130D",
  },
  [SafeVersion.V1_4_1]: {
    singleton: "0x41675C099F32341bf84BFc5382aF534df5C7461a",
    singletonL2: "0x29fcB43b46531BcA003ddC8FCB67FFE91900C762",
    proxyFactory: "0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67",
    fallbackHandler: "0xfd0732Dc9E303f09fCEf3a7388Ad10A83459Ec99",
    multiSend: "0x38869bf66a61cF6bDB996A6aE40D5853Fd43B526",
    multiSendCallOnly: "0x9641d764fc13c8B624c04430C7356C1C7C8102e2",
  },
  [SafeVersion.V1_5_0]: {
    singleton: "0xFf51A5898e281Db6DfC7855790607438dF2ca44b",
    singletonL2: "0xEdd160fEBBD92E350D4D398fb636302fccd67C7e",
    proxyFactory: "0x14F2982D601c9458F93bd70B218933A6f8165e7b",
    fallbackHandler: "0x3EfCBb83A4A7AfcB4F68D501E2c2203a38be77f4",
    multiSend: "0x218543288004CD07832472D464648173c77D7eB7",
    multiSendCallOnly: "0xA83c336B20401Af773B6219BA5027174338D1836",
  },
};

// v1.3.0 was also deployed with EIP-155 replay protection; some chains only have that variant.
const SAFE_1_3_0_EIP155: SafeDeployment = {
  singleton: "0x69f4D1788e39c87893C980c06EdF4b7f686e2938",
  singletonL2: "0xfb1bffC9d739B8D520DaF37dF666da4C687191EA",
  proxyFactory: "0xC22834581EbC8527d974F8a1c97E1bEA4EF910BC",
  fallbackHandler: "0x017062a1dE2FE6b99BE3d9d37841FeD19F573804",
  multiSend: "0x998739BFdAAdde7C933B942a68053933098f9EDa",
  multiSendCallOnly: "0xA1dabEF33b3B82c7814B6D82A79e50F4AC44102B",
};

/** Supported chains whose registry entry has no canonical deployment for a version. */
const CHAIN_OVERRIDES: Partial<Record<SafeVersion, Record<number, SafeDeployment>>> = {
  [SafeVersion.V1_3_0]: { 11155420: SAFE_1_3_0_EIP155 },
};

export const getSafeDeployment = (version: SafeVersion, chainId: number): SafeDeployment =>
  CHAIN_OVERRIDES[version]?.[chainId] ?? CANONICAL_DEPLOYMENTS[version];

/** SafeModuleSetup from safe-4337-module v0.3.0; enables modules via delegatecall during setup on any Safe version. */
export const SAFE_MODULE_SETUP_ADDRESS: Address = "0x2dd68b007B46fBe91B9A7c3EDa5A7a1063cB5b47";

export type RecommendedModule = { name: string; address: Address };

/** Modules offered as one-click options when creating a Safe. Add entries only from an official registry. */
export const RECOMMENDED_MODULES: RecommendedModule[] = [];
