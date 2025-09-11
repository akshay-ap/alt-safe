import { simulateContract, writeContract } from "@wagmi/core";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { type Address, isAddress, zeroAddress } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import safeProxyFactoryABI from "../abis/SafeProxyFactory.json";
import { STORAGE_KEY } from "../constants";
import { calculateInitData, getProxyAddress } from "../utils/utils";
import { config } from "../wagmi";
import { useSafeWalletContext } from "./WalletContext";

type DefaultModules = Array<{ name: string; address: Address }>;

type CreateSafeState = {
  // Basic Safe configuration
  owners: Address[];
  threshold: number;
  salt: bigint;
  initData: `0x${string}`;
  proxyAddress: Address | undefined;
  isAlreadyDeployed: boolean;
  error: string | undefined;
  safeCreationTxHash: string | undefined;
  isCreating: boolean;

  // Name and Labels
  safeName: string;
  safeLabels: string[];

  // Singleton configuration
  singleton: string;
  singletonL2: string;
  useSingletonL2: boolean;

  // Fallback Handler configuration
  fallbackHandler: Address;

  // Modules configuration
  setupModulesAddress: Address;
  modules: Address[];
  defaultModules: DefaultModules;
  // Proxy Factory
  proxyFactory: string;
};

interface CreateSafeActions {
  // Basic Safe configuration setters
  setOwners: (owners: Address[]) => void;
  setThreshold: (threshold: number) => void;
  setSalt: (salt: bigint) => void;
  setError: (error: string | undefined) => void;
  setSafeCreationTxHash: (txHash: string | undefined) => void;
  setIsCreating: (isCreating: boolean) => void;

  // Name and Labels setters
  setSafeName: (name: string) => void;
  setSafeLabels: (labels: string[]) => void;

  // Singleton configuration setters
  setSingleton: (singleton: string) => void;
  setSingletonL2: (singletonL2: string) => void;
  setUseSingletonL2: (useSingletonL2: boolean) => void;

  // Fallback Handler setter
  setFallbackHandler: (fallbackHandler: Address) => void;

  // Modules configuration setters
  setSetupModulesAddress: (address: Address) => void;
  setModules: (modules: Address[]) => void;

  // Proxy Factory setter
  setProxyFactory: (proxyFactory: string) => void;

  // Actions
  handleCreateSafe: () => Promise<void>;
}

interface CreateSafeContextValue extends CreateSafeState, CreateSafeActions {}

const CreateSafeContext = createContext<CreateSafeContextValue | undefined>(undefined);

export const useCreateSafeContext = (): CreateSafeContextValue => {
  const context = useContext(CreateSafeContext);
  if (!context) {
    throw new Error("useCreateSafeContext must be used within a CreateSafeProvider");
  }
  return context;
};

interface CreateSafeProviderProps {
  children: React.ReactNode;
}

export const CreateSafeProvider: React.FC<CreateSafeProviderProps> = ({ children }) => {
  const account = useAccount();
  const publicClient = usePublicClient();
  const { safeDeployment, storage } = useSafeWalletContext();

  // Basic Safe configuration
  const [owners, setOwners] = useState<Address[]>([account.address || zeroAddress]);
  const [threshold, setThreshold] = useState<number>(1);
  const [salt, setSalt] = useState<bigint>(BigInt(0));
  const [initData, setInitData] = useState<`0x${string}`>("0x");
  const [proxyAddress, setProxyAddress] = useState<Address>();
  const [isAlreadyDeployed, setIsAlreadyDeployed] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const [safeCreationTxHash, setSafeCreationTxHash] = useState<string>();
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [defaultModules] = useState<DefaultModules>((): DefaultModules => {
    const modulesEnv = import.meta.env.VITE_DEFAULT_MODULES;
    if (modulesEnv) {
      try {
                console.log("Raw modulesEnv:", modulesEnv);

        const parsedModules: DefaultModules = JSON.parse(modulesEnv);
        console.log("Raw default modules from env:", parsedModules);
        const validModules = parsedModules.filter(
          (module) => module.name && module.address && isAddress(module.address),
        );
        console.log("Parsed default modules from env:", validModules);
        return validModules;
      } catch (err) {
        console.error("Error parsing VITE_DEFAULT_MODULES:", err);
        return [];
      }
    }
    return [];
  });

  // Name and Labels
  const [safeName, setSafeName] = useState<string>("");
  const [safeLabels, setSafeLabels] = useState<string[]>([]);

  // Singleton configuration - read from env variables
  const [singleton, setSingleton] = useState<string>(
    import.meta.env.VITE_SINGLETON_ADDRESS || safeDeployment?.singleton || "",
  );
  const [singletonL2, setSingletonL2] = useState<string>(
    import.meta.env.VITE_SINGLETON_L2_ADDRESS || safeDeployment?.singletonL2 || "",
  );
  const [useSingletonL2, setUseSingletonL2] = useState<boolean>(publicClient?.chain.sourceId !== undefined);

  // Fallback Handler configuration - read from env variables
  const [fallbackHandler, setFallbackHandler] = useState<Address>(
    import.meta.env.VITE_FALLBACK_HANDLER_ADDRESS || safeDeployment?.fallbackHandler,
  );

  // Modules configuration
  const [setupModulesAddress, setSetupModulesAddress] = useState<Address>(
    import.meta.env.VITE_SETUP_MODULES_ADDRESS || zeroAddress,
  );
  const [modules, setModules] = useState<Address[]>([]);

  // Proxy Factory (not configurable in UI but read from env)
  const [proxyFactory, setProxyFactory] = useState<string>(
    import.meta.env.VITE_PROXY_FACTORY_ADDRESS || safeDeployment?.proxyFactory || "",
  );

  // Update state when safeDeployment changes
  useEffect(() => {
    if (safeDeployment) {
      setProxyFactory(import.meta.env.VITE_PROXY_FACTORY_ADDRESS || safeDeployment.proxyFactory);
      setFallbackHandler(import.meta.env.VITE_FALLBACK_HANDLER_ADDRESS || safeDeployment.fallbackHandler);
      setSingletonL2(import.meta.env.VITE_SINGLETON_L2_ADDRESS || safeDeployment.singletonL2);
      setSingleton(import.meta.env.VITE_SINGLETON_ADDRESS || safeDeployment.singleton);
    }
  }, [safeDeployment]);

  // Update initData when owners, threshold, or fallbackHandler change
  useEffect(() => {
    if (safeDeployment && fallbackHandler && isAddress(fallbackHandler)) {
      // Validate that all owners are valid addresses and there are no duplicates or zero addresses
      const validOwners = owners.filter((owner) => isAddress(owner) && owner !== zeroAddress);
      const uniqueOwners = validOwners.filter(
        (owner, index) => validOwners.findIndex((o) => o.toLowerCase() === owner.toLowerCase()) === index,
      );

      const areModuleAddressesValid = modules.every((module) => isAddress(module));

      // Only set initData if all owners are valid and unique
      if (
        validOwners.length === owners.length &&
        uniqueOwners.length === validOwners.length &&
        owners.length > 0 &&
        isAddress(setupModulesAddress) &&
        areModuleAddressesValid
      ) {
        const delegateCallAddress = setupModulesAddress && modules.length > 0 ? setupModulesAddress : zeroAddress;
        setInitData(
          calculateInitData(owners, threshold, fallbackHandler as `0x${string}`, delegateCallAddress, modules),
        );
      } else {
        setInitData("0x");
      }
    } else {
      setInitData("0x");
    }
  }, [owners, threshold, fallbackHandler, safeDeployment, setupModulesAddress, modules]);

  // Update proxyAddress when configuration changes
  useEffect(() => {
    if (proxyFactory && initData !== "0x") {
      const safeSingleton = (useSingletonL2 ? singletonL2 : singleton) as `0x${string}`;
      if (safeSingleton) {
        setProxyAddress(getProxyAddress(proxyFactory as `0x${string}`, safeSingleton, initData, salt));
      }
    }
  }, [initData, proxyFactory, singleton, singletonL2, salt, useSingletonL2]);

  // Check if the Safe is already deployed
  useEffect(() => {
    if (proxyAddress && publicClient) {
      (async () => {
        try {
          const code = await publicClient.getCode({ address: proxyAddress });
          setIsAlreadyDeployed(code !== undefined && code !== "0x");
        } catch (err) {
          console.error("Error checking deployment status:", err);
          setIsAlreadyDeployed(false);
        }
      })();
    }
  }, [proxyAddress, publicClient]);

  const handleCreateSafe = async () => {
    if (!proxyAddress || !proxyFactory) {
      setError("Missing configuration for Safe creation");
      return;
    }

    setIsCreating(true);
    setError(undefined);

    try {
      const safeSingleton = useSingletonL2 ? singletonL2 : singleton;

      // Create the Safe
      const result = await simulateContract(config, {
        abi: safeProxyFactoryABI,
        address: proxyFactory as `0x${string}`,
        functionName: "createProxyWithNonce",
        args: [safeSingleton, initData, salt],
      });

      const newSafeAddress = result.result;

      if (newSafeAddress !== proxyAddress) {
        setError("Expected proxy address does not match the calculated proxy address");
        return;
      }

      const txHash = await writeContract(config, result.request);
      setSafeCreationTxHash(txHash);

      // Store the Safe account
      const existingAccounts = (await storage.getItem(STORAGE_KEY.SAFE_ACCOUNTS)) as any[];
      const newSafeAccount = {
        address: newSafeAddress,
        chainIds: [account.chainId],
        name: safeName,
        labels: safeLabels,
      };

      if (!existingAccounts) {
        await storage.setItem(STORAGE_KEY.SAFE_ACCOUNTS, [newSafeAccount]);
      } else {
        const existingAccount = existingAccounts.find((acc) => acc.address === newSafeAddress);
        if (!existingAccount) {
          await storage.setItem(STORAGE_KEY.SAFE_ACCOUNTS, [...existingAccounts, newSafeAccount]);
        } else {
          const updatedAccounts = existingAccounts.map((acc) =>
            acc.address === newSafeAddress
              ? {
                  ...acc,
                  chainIds: [...new Set([...acc.chainIds, account.chainId])],
                  name: safeName,
                  labels: safeLabels,
                }
              : acc,
          );
          await storage.setItem(STORAGE_KEY.SAFE_ACCOUNTS, updatedAccounts);
        }
      }
    } catch (err) {
      console.error("Error creating Safe:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  const contextValue: CreateSafeContextValue = {
    // State
    owners,
    threshold,
    salt,
    initData,
    proxyAddress,
    isAlreadyDeployed,
    error,
    safeCreationTxHash,
    isCreating,
    safeName,
    safeLabels,
    singleton,
    singletonL2,
    useSingletonL2,
    fallbackHandler,
    setupModulesAddress,
    modules,
    proxyFactory,
    defaultModules,

    // Actions
    setOwners,
    setThreshold,
    setSalt,
    setError,
    setSafeCreationTxHash,
    setIsCreating,
    setSafeName,
    setSafeLabels,
    setSingleton,
    setSingletonL2,
    setUseSingletonL2,
    setFallbackHandler,
    setSetupModulesAddress,
    setModules,
    setProxyFactory,
    handleCreateSafe,
  };

  return <CreateSafeContext.Provider value={contextValue}>{children}</CreateSafeContext.Provider>;
};
