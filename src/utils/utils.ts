import { readContract } from "@wagmi/core";
import {
  type Address,
  encodeAbiParameters,
  encodeFunctionData,
  encodePacked,
  getContractAddress,
  keccak256,
  zeroAddress,
} from "viem";
import safeABI from "../abis/Safe.json";
import safe from "../abis/Safe.json";
import {
  type SafeDeployment,
  SafeDeploymentType,
  SafeVersion,
  canonicalAddresses_141,
} from "../safe-contracts/addresses/addresses";
import safeProxy from "../safe-contracts/artifacts/SafeProxy.json";
import { config } from "../wagmi";

export const SAFE_TX_TYPEHASH = keccak256(
  new TextEncoder().encode(
    "SafeTx(address to,uint256 value,bytes data,uint8 operation,uint256 safeTxGas,uint256 baseGas,uint256 gasPrice,address gasToken,address refundReceiver,uint256 nonce)",
  ),
);

export const getProxyAddress = (
  factory: `0x${string}`,
  singleton: `0x${string}`,
  inititalizer: `0x${string}`,
  nonce: bigint,
  proxyCreationCode?: `0x${string}`,
) => {
  const salt = keccak256(
    encodePacked(["bytes32", "uint256"], [keccak256(encodePacked(["bytes"], [inititalizer])), nonce]),
  );

  let creationCode = proxyCreationCode;
  if (!creationCode) {
    creationCode = safeProxy.bytecode as `0x${string}`;
  }

  const deploymentCode = encodePacked(["bytes", "uint256"], [creationCode || "0x", singleton as unknown as bigint]);
  return getContractAddress({
    bytecode: deploymentCode,
    from: factory,
    opcode: "CREATE2",
    salt: salt,
  });
};

export const calculateInitData = (owners: Address[], threshold: number, fallbackHandler: Address) => {
  const setupCalldata = encodeFunctionData({
    abi: safeABI,
    functionName: "setup",
    args: [owners, threshold, zeroAddress, "0x", fallbackHandler, `0x${"00".repeat(20)}`, 0, `0x${"00".repeat(20)}`],
  });

  return setupCalldata;
};

export type MultiSendTransaction = {
  to: `0x${string}`;
  value: bigint;
  data: `0x${string}`;
  operation: number;
};

export type MultiSendTransactions = MultiSendTransaction[];

export const getMultiSendCallData = (transactions: MultiSendTransactions): `0x${string}` => {
  // Encode the transactions into the format required by MultiSend contract
  let packedTransactions = "0x"; // Start with empty hex string
  for (const tx of transactions) {
    const encodedTx = encodePacked(
      ["uint8", "address", "uint256", "uint256", "bytes"],
      [tx.operation, tx.to, tx.value, BigInt(tx.data.length), tx.data],
    );
    packedTransactions += encodedTx.slice(2); // Append the packed transaction data
  }
  return packedTransactions as `0x${string}`;
};

export const getShortAddress = (address: Address): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const getShortTransactionHash = (address: Address): string => {
  return `${address.slice(0, 10)}...${address.slice(-10)}`;
};

export const getSafeAddresses = (
  _chainId: number,
  version: SafeVersion = SafeVersion.V1_4_1,
  _deploymentType: SafeDeploymentType = SafeDeploymentType.CANONICAL,
): SafeDeployment | undefined => {
  if (version === SafeVersion.V1_4_1) return canonicalAddresses_141;
};

export enum SafeOperation {
  CALL = 0,
  DELEGATE_CALL = 1,
}

export interface MetaTransaction {
  to: Address;
  value: bigint;
  data: `0x${string}`;
  operation: SafeOperation;
}

export interface SafeTransactionParams extends MetaTransaction {
  safeTxGas: bigint;
  baseGas: bigint;
  gasPrice: bigint;
  gasToken: string;
  refundReceiver: string;
  nonce: bigint;
}

/**
 *
 *     function domainSeparator() public view returns (bytes32) {
        return keccak256(abi.encode(DOMAIN_SEPARATOR_TYPEHASH, getChainId(), this));
    }
 
 */
export function domainSeparator(chainId: bigint, verifyingContract: Address): `0x${string}` {
  return keccak256(
    encodeAbiParameters(
      [
        { type: "bytes32", name: "DOMAIN_SEPARATOR_TYPEHASH" },
        { type: "uint256", name: "chainId" },
        { type: "address", name: "verifyingContract" },
      ],
      [
        keccak256(new TextEncoder().encode("EIP712Domain(uint256 chainId,address verifyingContract)")),
        chainId,
        verifyingContract,
      ],
    ),
  );
}

export const EIP_DOMAIN = {
  EIP712Domain: [
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
  ],
};

export const EIP712_SAFE_TX_TYPE = {
  SafeTx: [
    { type: "address", name: "to" },
    { type: "uint256", name: "value" },
    { type: "bytes", name: "data" },
    { type: "uint8", name: "operation" },
    { type: "uint256", name: "safeTxGas" },
    { type: "uint256", name: "baseGas" },
    { type: "uint256", name: "gasPrice" },
    { type: "address", name: "gasToken" },
    { type: "address", name: "refundReceiver" },
    { type: "uint256", name: "nonce" },
  ],
};

export interface SafeSignature {
  signer: string;
  data: string;
  // a flag to indicate if the signature is a contract signature and the data has to be appended to the dynamic part of signature bytes
  dynamic?: true;
}

export const buildSignatureBytes = (signatures: SafeSignature[]): string => {
  const SIGNATURE_LENGTH_BYTES = 65;
  signatures.sort((left, right) => left.signer.toLowerCase().localeCompare(right.signer.toLowerCase()));

  let signatureBytes = "0x";
  let dynamicBytes = "";
  for (const sig of signatures) {
    if (sig.dynamic) {
      /* 
              A contract signature has a static part of 65 bytes and the dynamic part that needs to be appended 
              at the end of signature bytes.
              The signature format is
              Signature type == 0
              Constant part: 65 bytes
              {32-bytes signature verifier}{32-bytes dynamic data position}{1-byte signature type}
              Dynamic part (solidity bytes): 32 bytes + signature data length
              {32-bytes signature length}{bytes signature data}
          */
      const dynamicPartPosition = (signatures.length * SIGNATURE_LENGTH_BYTES + dynamicBytes.length / 2)
        .toString(16)
        .padStart(64, "0");
      const dynamicPartLength = (sig.data.slice(2).length / 2).toString(16).padStart(64, "0");
      const staticSignature = `${sig.signer.slice(2).padStart(64, "0")}${dynamicPartPosition}00`;
      const dynamicPartWithLength = `${dynamicPartLength}${sig.data.slice(2)}`;

      signatureBytes += staticSignature;
      dynamicBytes += dynamicPartWithLength;
    } else {
      signatureBytes += sig.data.slice(2);
    }
  }

  return signatureBytes + dynamicBytes;
};

export const fetchApprovals = async (
  owners: string[],
  safeTransactionHash: string,
  safeAccount: `0x${string}`,
): Promise<Record<string, boolean>> => {
  const approvalsStatus: Record<string, boolean> = {};

  for (const owner of owners) {
    try {
      const isApproved = await readContract(config, {
        abi: safe,
        address: safeAccount,
        functionName: "approvedHashes",
        args: [owner, safeTransactionHash],
      });
      approvalsStatus[owner] = isApproved === 1n; // Non-zero means approved
    } catch (err) {
      console.error(`Error checking approval for owner ${owner}:`, err);
      approvalsStatus[owner] = false; // Default to not approved on error
    }
  }

  return approvalsStatus;
};

export const calculateSafeTransactionHash = (
  transaction: SafeTransactionParams,
  safeAccount: Address,
  chainId: number,
): `0x${string}` => {
  return getSafeTransactionHash(
    transaction.to,
    transaction.value,
    transaction.data,
    transaction.operation,
    transaction.safeTxGas,
    transaction.baseGas,
    transaction.gasPrice,
    transaction.gasToken as `0x${string}`,
    transaction.refundReceiver as `0x${string}`,
    transaction.nonce,
    safeAccount,
    BigInt(chainId),
  );
};

const getSafeTransactionHash = (
  to: `0x${string}`,
  value: bigint,
  data: `0x${string}`,
  operation: number,
  safeTxGas: bigint,
  baseGas: bigint,
  gasPrice: bigint,
  gasToken: `0x${string}`,
  refundReceiver: `0x${string}`,
  nonce: bigint,
  verifyingContract: `0x${string}`,
  chainId: bigint,
): `0x${string}` => {
  const safeTxHash = keccak256(
    encodeAbiParameters(
      [
        { type: "bytes32", name: "SAFE_TX_TYPEHASH" },
        { type: "address", name: "to" },
        { type: "uint256", name: "value" },
        { type: "bytes32", name: "dataHash" },
        { type: "uint8", name: "operation" },
        { type: "uint256", name: "safeTxGas" },
        { type: "uint256", name: "baseGas" },
        { type: "uint256", name: "gasPrice" },
        { type: "address", name: "gasToken" },
        { type: "address", name: "refundReceiver" },
        { type: "uint256", name: "nonce" },
      ],
      [
        SAFE_TX_TYPEHASH,
        to,
        value,
        keccak256(data), // Hash the data
        operation,
        safeTxGas,
        baseGas,
        gasPrice,
        gasToken,
        refundReceiver,
        nonce,
      ],
    ),
  );

  const encodedData = encodePacked(
    ["bytes1", "bytes1", "bytes32", "bytes32"],
    ["0x19", "0x01", domainSeparator(chainId, verifyingContract), safeTxHash],
  );

  return keccak256(encodedData) as `0x${string}`;
};
