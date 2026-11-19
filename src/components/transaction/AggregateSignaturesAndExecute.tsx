import VisibilityIcon from "@mui/icons-material/Visibility";
import { Box, Button, Paper, Stack, Step, StepLabel, Stepper } from "@mui/material";
import type React from "react";
import { useState } from "react";
import { isAddressEqual } from "viem";
import { useAccount } from "wagmi";
import { importTransactionsFromHex } from "../../api/api";
import type { ImportData } from "../../context/types";
import { useSafeWalletContext } from "../../context/WalletContext";
import { parseSignatures } from "../../utils/signatures";
import { calculateSafeTransactionHash, type SafeSignature } from "../../utils/utils";
import Title from "../common/Title";
import ViewSafeTransactionDialog from "../dialogs/ViewSafeTransactionDialog";
import ExecutionCompleteStep from "./aggregate-signature-steps/ExecutionCompleteStep";
import ImportTransactionStep from "./aggregate-signature-steps/ImportTransactionStep";
import SignatureCollector from "./SignatureCollector";
import TransactionSummaryPanel from "./summary/TransactionSummaryPanel";

const AggregateSignaturesAndExecute: React.FC = () => {
  const { safeAccount, safeStorage } = useSafeWalletContext();
  const { chainId } = useAccount();

  const [transactionImportHex, setTransactionImportHex] = useState<string>("");
  const [importedTransaction, setImportedTransaction] = useState<ImportData>();
  const [importedSignatures, setImportedSignatures] = useState<SafeSignature[]>([]);
  const [transactionImportError, setTransactionImportError] = useState<string>();
  const [transactionHash, setTransactionHash] = useState<`0x${string}`>();
  const [detailsOpen, setDetailsOpen] = useState(false);

  const steps = ["Paste transaction", "Sign or execute", "Executed"];
  const activeStep = transactionHash ? 2 : importedTransaction ? 1 : 0;

  const handleImportTransaction = async () => {
    setTransactionImportError(undefined);
    try {
      const data = importTransactionsFromHex(transactionImportHex.trim() as `0x${string}`);
      if (!data.safeTransaction || !data.safeTransactionHash) throw new Error("Invalid transaction data format");
      if (!safeAccount || !chainId || !isAddressEqual(data.safeAccount, safeAccount)) {
        setTransactionImportError("This transaction is for a different Safe.");
        return;
      }
      // The JSON carries amounts as strings; signing and executing need bigints.
      const tx = data.safeTransaction;
      const safeTransaction = {
        ...tx,
        value: BigInt(tx.value),
        safeTxGas: BigInt(tx.safeTxGas),
        baseGas: BigInt(tx.baseGas),
        gasPrice: BigInt(tx.gasPrice),
        nonce: BigInt(tx.nonce),
      };
      // Never trust the shared hash: it is what owners sign.
      if (calculateSafeTransactionHash(safeTransaction, safeAccount, chainId) !== data.safeTransactionHash) {
        setTransactionImportError("The transaction details do not match its hash, or it was made for another network.");
        return;
      }
      if (safeTransaction.nonce < (safeStorage?.nonce ?? 0n)) {
        setTransactionImportError("This transaction's nonce has already been used by the Safe.");
        return;
      }
      const hasSignatures = "signature" in data || "signatures" in data;
      setImportedSignatures(
        hasSignatures
          ? await parseSignatures(transactionImportHex, data.safeTransactionHash, safeStorage?.owners ?? [])
          : [],
      );
      setImportedTransaction({ ...data, safeTransaction });
    } catch (error) {
      console.error("Invalid transaction import:", error);
      setTransactionImportError(
        error instanceof Error && error.message.includes("signature")
          ? error.message
          : "Invalid transaction data. Please check your input and try again.",
      );
    }
  };

  return (
    <Box>
      <Title
        text="Shared transaction"
        description="Paste a transaction another owner shared. Sign it and send your signature back, or execute it once enough owners have signed."
      />

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
          <ImportTransactionStep
            transactionImportHex={transactionImportHex}
            setTransactionImportHex={setTransactionImportHex}
            onImport={handleImportTransaction}
            error={transactionImportError}
          />
        </Paper>
      )}

      {activeStep === 1 && importedTransaction && (
        <Box
          sx={{
            display: "grid",
            gap: 3,
            alignItems: "start",
            gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 320px" },
          }}
        >
          <SignatureCollector
            transactions={importedTransaction.transactions}
            safeTransaction={importedTransaction.safeTransaction}
            safeTransactionHash={importedTransaction.safeTransactionHash}
            initialSignatures={importedSignatures}
            onExecuted={setTransactionHash}
          />
          <Stack spacing={1}>
            <TransactionSummaryPanel
              transactions={importedTransaction.transactions}
              handleDeleteTransaction={() => {}}
              viewOnly
              isMobile={false}
            />
            {/* The batch above is the sharer's description; the parameters are what gets signed. */}
            <Button startIcon={<VisibilityIcon />} onClick={() => setDetailsOpen(true)}>
              View all parameters
            </Button>
          </Stack>
          <ViewSafeTransactionDialog
            open={detailsOpen}
            onClose={() => setDetailsOpen(false)}
            safeTransaction={importedTransaction.safeTransaction}
            safeTransactionHash={importedTransaction.safeTransactionHash}
          />
        </Box>
      )}

      {activeStep === 2 && transactionHash && (
        <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
          <ExecutionCompleteStep
            transactionHash={transactionHash}
            onReset={() => {
              setTransactionHash(undefined);
              setImportedTransaction(undefined);
              setTransactionImportHex("");
            }}
          />
        </Paper>
      )}
    </Box>
  );
};

export default AggregateSignaturesAndExecute;
