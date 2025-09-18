import type { Address } from "viem";
import type { SafeSignature, SafeTransactionParams } from "../utils/utils";

export interface Transaction {
  type: TransactionType;
  groupName: string;
  actionName: string;
  to: Address;
  value: string;
  data: `0x${string}`;
}

export enum TransactionType {
  ETH_TRANSFER = "ethTransfer",
  ERC20_TRANSFER = "erc20Transfer",
  CONTRACT_CALL = "contractCall",
}

export type ImportData = {
  transactions: Transaction[];
  safeAccount: Address;
  safeTransaction: SafeTransactionParams;
  safeTransactionHash: `0x${string}`;
};

export type ImportSignedData = ImportData & {
  signature: SafeSignature;
};

export enum LogoType {
  URL = "url",
  CHARACTER = "character",
}

export enum ValueFetchType {
  RPC_CALL = "eth_call",
  RPC_GET_BALANCE = "eth_getBalance",
}

export type ContextFetchDataType = { method: string; to: string; args: string[]; errorMessage?: string };
export type ContextFetchBalanceType = { params: string[]; errorMessage?: string };
export type ContextItem =
  | { type: ValueFetchType.RPC_CALL; data: ContextFetchDataType; id: string }
  | { type: ValueFetchType.RPC_GET_BALANCE; data: ContextFetchBalanceType; id: string };

export enum GroupTagType {
  DeFi = "DeFi",
  Token = "Token",
  Other = "Other",
  Safe = "Safe",
}

export type InputTypeType =
  | "text"
  | "address"
  | "selectOne"
  | "selectOneWithFreeSolo"
  | "selectOneWithFreeSoloAddress"
  | "selectOneRadio";

export type ContextType = { [key: string]: { type: string; defaultValue: string } | undefined };
export type InputType = { name: string; type: InputTypeType; options?: Option[]; label: string };
export type Option = { chainId: number; options: SelectOption[] };
export type SelectOption = { name: string; value: any };

export enum ValidationType {
  expression = "expression",
  regex = "regex",
}
type Validation = { variable: string; type: string; value: string; id: string; errorMessage: string };

export interface TransactionSpec {
  name: string;
  functionSignature?: string;
  summaryView: string;
  context?: ContextType;
  inputs: InputType[];
  display: { description: string };
  onUpdateValidations: Validation[];
  onInputUpdate: { variable: string; value: ContextItem }[];
  detailsView: { type: string; label: string; value: string }[];
  onFinalize: { to: string; value: string; calldataArgs: string[] } | { to: string; value: string; data: string };
}

export interface TransactionGroupSpec {
  groupName: string;
  tags?: GroupTagType[];
  logo?: {
    type: LogoType;
    value: string;
  };
  chainIds: number[];
  actions: TransactionSpec[];
}

export type SafeAccount = {
  address: Address;
  chainIds: number[];
  name?: string;
  labels?: string[];
};

export interface SafeTransactionDraft {
  id: string;
  name: string;
  safeAccount: `0x${string}`;
  chainId?: number;
  transactions: Transaction[];
  createdAt: string;
  updatedAt: string;
}

export interface ImportedTransactionData {
  transactions: Transaction[];
  safeAccount: `0x${string}`;
  safeTransaction: SafeTransactionParams;
  safeTransactionHash: `0x${string}`;
}

export interface SignatureImportState {
  owner: `0x${string}`;
  signature?: `0x${string}`;
  importHex: string;
  isApproved: boolean;
}
