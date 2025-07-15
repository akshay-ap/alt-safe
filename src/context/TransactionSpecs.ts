import Aave from "../templates/Aave.json";
import ERC20Spec from "../templates/ERC20.json";
import NativeTransfer from "../templates/NativeTransfer.json";
import SafeSpec from "../templates/Safe.json";
import SmartContractCall from "../templates/SmartContractCall.json";

import type { TransactionGroupSpec } from "./types";

const transactionBuilderSpec: TransactionGroupSpec[] = [
  NativeTransfer,
  Aave,
  ERC20Spec,
  SmartContractCall,
  SafeSpec,
] as TransactionGroupSpec[];

export default transactionBuilderSpec;
