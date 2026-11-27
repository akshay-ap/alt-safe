import { useQuery } from "@tanstack/react-query";
import { type Address, isAddress, isAddressEqual, type PublicClient, zeroAddress } from "viem";
import { usePublicClient } from "wagmi";
import safeABI from "../abis/Safe.json";
import { fetchStorageData, type SafeStorage } from "../utils/storageReader";

export type SafeLookup = { storage: SafeStorage; version: string | undefined };

export class NotASafeError extends Error {}

const readVersion = async (client: PublicClient, address: Address) => {
  try {
    return (await client.readContract({ address, abi: safeABI, functionName: "VERSION" })) as string;
  } catch {
    return undefined;
  }
};

/** The app signs with the EIP-712 domain that includes chainId, which Safe added in v1.3.0. */
export const isSupportedSafeVersion = (version: string) => {
  const [major, minor] = version.split(".").map(Number);
  return major > 1 || (major === 1 && minor >= 3);
};

const lookupSafe = async (client: PublicClient, address: Address): Promise<SafeLookup> => {
  const code = await client.getCode({ address });
  if (!code || code === "0x") throw new NotASafeError("No contract is deployed at this address on this network.");
  // Before reading storage, so older Safes whose layout fails to load still get this message.
  const version = await readVersion(client, address);
  if (version && !isSupportedSafeVersion(version)) {
    throw new NotASafeError(`Safe v${version} is not supported. Alt Safe works with Safe v1.3.0 and later.`);
  }
  const { storage } = await fetchStorageData(address, client);
  if (isAddressEqual(storage.singleton, zeroAddress)) {
    throw new NotASafeError("This contract is not a Safe: it has no singleton.");
  }
  return { storage, version };
};

/** Reads a Safe's on-chain configuration once the address is valid. */
export const useSafeLookup = (address: string) => {
  const client = usePublicClient();
  const isValid = isAddress(address);
  return useQuery({
    queryKey: ["safeLookup", client?.chain.id, address.toLowerCase()],
    queryFn: () => lookupSafe(client as PublicClient, address as Address),
    enabled: Boolean(client) && isValid,
    retry: (count, error) => !(error instanceof NotASafeError) && count < 2,
  });
};
