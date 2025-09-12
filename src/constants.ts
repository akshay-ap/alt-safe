export enum FEATURES {
  SUPPORT_4337 = 0,
  SAFE_WALLET = 1,
}

export enum STORAGE_KEY {
  SAFE_ACCOUNTS = "safeAccounts",
  SAFE_INDEX = "safeIndex",
  LAST_SELECTED_SAFE_ACCOUNT = "lastSelectedSafeAccount",
  SAFE_TRANSACTIONS = "safeTransactions",
  CUSTOM_DEPLOYMENTS = "customDeployments",
  TOKEN_LIST = "tokenList",
  RPC = "rpc",
  DRAFT_TRANSACTIONS = "draft_transactions",
  ADDRESS_BOOK = "addressBook",
}

export const WALLET_STORAGE_KEY = "alt_wallet";
