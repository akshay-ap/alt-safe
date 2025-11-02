import Aave from "../templates/Aave.json";
import ERC20Spec from "../templates/ERC20.json";
import ERC4626 from "../templates/ERC4626.json";
import Morpho from "../templates/Morpho.json";
import NativeTransfer from "../templates/NativeTransfer.json";
import SafeSpec from "../templates/Safe.json";
import SmartContractCall from "../templates/SmartContractCall.json";
import WETH from "../templates/WETH.json";

import type { TransactionGroupSpec } from "./types";

const transactionBuilderSpec: TransactionGroupSpec[] = [
  NativeTransfer,
  ERC20Spec,
  ERC4626,
  Aave,
  Morpho,
  SmartContractCall,
  SafeSpec,
  WETH,
] as TransactionGroupSpec[];

export default transactionBuilderSpec;
