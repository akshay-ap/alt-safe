import { Box, Paper, Step, StepLabel, Stepper, Typography } from "@mui/material";
import { simulateContract, writeContract } from "@wagmi/core";
import type React from "react";
import { useEffect, useState } from "react";
import { BaseError, ContractFunctionRevertedError, encodePacked, hexToBytes, pad, zeroHash } from "viem";
import safe from "../../abis/Safe.json";
import { useSafeWalletContext } from "../../context/WalletContext";
import type { ImportSignedData, ImportedTransactionData, SignatureImportState } from "../../context/types";
import { buildSignatureBytes, fetchApprovals } from "../../utils/utils";
import { config } from "../../wagmi";
import CollectSignaturesStep from "./aggregate-signature-steps/CollectSignaturesStep";
import ExecutionCompleteStep from "./aggregate-signature-steps/ExecutionCompleteStep";
import ImportTransactionStep from "./aggregate-signature-steps/ImportTransactionStep";

const AggregateSignaturesAndExecute: React.FC = () => {
  const { safeAccount, safeStorage } = useSafeWalletContext();

  // State for transaction data
  const [transactionImportHex, setTransactionImportHex] = useState<string>("");
  const [importedTransaction, setImportedTransaction] = useState<ImportedTransactionData>();
  const [transactionImportError, setTransactionImportError] = useState<string>();

  // State for signatures
  const [signatureStates, setSignatureStates] = useState<SignatureImportState[]>([]);
  const [signatureImportError, setSignatureImportError] = useState<string>();

  // Execution state
  const [executionError, setExecutionError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState<`0x${string}`>();
  const [activeStep, setActiveStep] = useState(0);

  const steps = ["Import Transaction", "Collect Signatures", "Execute"];

  // Load initial data and check approvals
  useEffect(() => {
    if (safeStorage?.owners && safeStorage.owners.length > 0) {
      setSignatureStates(
        safeStorage.owners.map((owner) => ({
          owner,
          importHex: "",
          isApproved: false,
        })),
      );
    }
  }, [safeStorage]);

  // Check on-chain approvals whenever transaction hash changes
  useEffect(() => {
    if (importedTransaction?.safeTransactionHash && safeAccount) {
      checkOnChainApprovals();
    }
  }, [importedTransaction?.safeTransactionHash, safeAccount]);

  const checkOnChainApprovals = async () => {
    if (!importedTransaction?.safeTransactionHash || !safeAccount || !signatureStates.length) return;

    const approvals = await fetchApprovals(
      signatureStates.map((state) => state.owner),
      importedTransaction.safeTransactionHash,
      safeAccount,
    );

    setSignatureStates((prevStates) =>
      prevStates.map((state) => ({
        ...state,
        isApproved: approvals[state.owner] || false,
      })),
    );
  };

  const handleImportTransaction = () => {
    setTransactionImportError(undefined);
    try {
      if (!transactionImportHex || transactionImportHex === "0x") {
        throw new Error("Empty transaction data");
      }

      const jsonString = new TextDecoder().decode(hexToBytes(transactionImportHex as `0x${string}`));
      const importedData = JSON.parse(jsonString) as ImportedTransactionData;

      // Validate imported data
      if (!importedData.safeTransaction || !importedData.safeTransactionHash) {
        throw new Error("Invalid transaction data format");
      }

      setImportedTransaction(importedData);
      setActiveStep(1); // Move to signature collection
    } catch (error) {
      console.error("Invalid transaction import:", error);
      setTransactionImportError("Invalid transaction data. Please check your input and try again.");
    }
  };

  const handleImportSignature = (index: number, value: string) => {
    setSignatureImportError(undefined);
    try {
      if (!value || value === "0x") return;

      const jsonString = new TextDecoder().decode(hexToBytes(value as `0x${string}`));
      const importedData = JSON.parse(jsonString) as ImportSignedData;

      // Validate that the signature matches our transaction
      if (importedData.safeTransactionHash !== importedTransaction?.safeTransactionHash) {
        throw new Error("Signature does not match the imported transaction");
      }

      setSignatureStates((prevStates) =>
        prevStates.map((state, i) =>
          i === index
            ? {
                ...state,
                signature: importedData.signature.data as `0x${string}`,
                importHex: value,
              }
            : state,
        ),
      );
    } catch (error) {
      console.error("Invalid signature import:", error);
      setSignatureImportError("Invalid signature data. Please check your input and try again.");
    }
  };

  const handleExecute = async () => {
    if (!importedTransaction?.safeTransaction || !safeAccount) {
      setExecutionError("Missing transaction data or safe account");
      return;
    }

    setIsLoading(true);
    setExecutionError(undefined);

    try {
      // Collect all signatures (both imported and on-chain approved)
      const signatures = signatureStates
        .filter((state) => state.signature || state.isApproved)
        .map((state) => ({
          signer: state.owner,
          data: state.signature || encodePacked(["bytes32", "bytes32", "bytes1"], [pad(state.owner), zeroHash, "0x01"]), // Signature for on-chain approvals
        }));

      const signatureBytes = buildSignatureBytes(signatures);

      const { request } = await simulateContract(config, {
        abi: safe,
        address: safeAccount,
        functionName: "execTransaction",
        args: [
          importedTransaction.safeTransaction.to,
          importedTransaction.safeTransaction.value,
          importedTransaction.safeTransaction.data,
          importedTransaction.safeTransaction.operation,
          importedTransaction.safeTransaction.safeTxGas,
          importedTransaction.safeTransaction.baseGas,
          importedTransaction.safeTransaction.gasPrice,
          importedTransaction.safeTransaction.gasToken,
          importedTransaction.safeTransaction.refundReceiver,
          signatureBytes,
        ],
      });

      const hash = await writeContract(config, request);
      setTransactionHash(hash as `0x${string}`);
      setActiveStep(2);
    } catch (err) {
      handleExecutionError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecutionError = (err: unknown) => {
    console.error(err);
    if (err instanceof BaseError) {
      const revertError = err.walk((e) => e instanceof ContractFunctionRevertedError);
      if (revertError instanceof ContractFunctionRevertedError) {
        const errorName = revertError.data?.errorName ?? "";
        setExecutionError(`Transaction failed: ${errorName} ${revertError.reason}`);
      }
    } else {
      setExecutionError("Failed to execute transaction. Please try again.");
    }
  };

  return (
    <Box sx={{ mx: "auto", p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Execute Multi-Signature Transaction
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
        {activeStep === 0 && (
          <ImportTransactionStep
            transactionImportHex={transactionImportHex}
            setTransactionImportHex={setTransactionImportHex}
            onImport={handleImportTransaction}
            error={transactionImportError}
          />
        )}

        {activeStep === 1 && importedTransaction && (
          <CollectSignaturesStep
            signatureStates={signatureStates}
            onImportSignature={handleImportSignature}
            onRefreshApprovals={checkOnChainApprovals}
            transactions={importedTransaction.transactions}
            threshold={safeStorage?.threshold || 0n}
            error={signatureImportError}
            onExecute={handleExecute}
            onBack={() => setActiveStep(0)}
            isLoading={isLoading}
            executionError={executionError}
          />
        )}

        {activeStep === 2 && transactionHash && (
          <ExecutionCompleteStep
            transactionHash={transactionHash}
            onReset={() => {
              setActiveStep(0);
              setImportedTransaction(undefined);
              setSignatureStates((prevStates) =>
                prevStates.map((state) => ({ ...state, signature: undefined, importHex: "", isApproved: false })),
              );
            }}
          />
        )}
      </Paper>
    </Box>
  );
};

export default AggregateSignaturesAndExecute;
