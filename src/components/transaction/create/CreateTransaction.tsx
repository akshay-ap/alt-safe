import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DoneIcon from "@mui/icons-material/Done";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Alert,
  Badge,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  Paper,
  Snackbar,
  Step,
  StepLabel,
  Stepper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { readContract, signTypedData, simulateContract } from "@wagmi/core";
import { useEffect, useState } from "react";
import { type Address, bytesToHex, encodeFunctionData, hexToBytes, stringToBytes, zeroAddress } from "viem";
import { BaseError, ContractFunctionRevertedError } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import multisendCallOnly from "../../../abis/MultiSendCallOnly.json";
import safe from "../../../abis/Safe.json";
import { STORAGE_KEY } from "../../../constants";
import { type SafeTransactionInfo, useSafeWalletContext } from "../../../context/WalletContext";
import type { ImportData, ImportSignedData, SafeTransactionDraft, Transaction } from "../../../context/types";
import { encodeMultiSend } from "../../../utils/multisend";
import { EIP712_SAFE_TX_TYPE, SafeOperation, type SafeTransactionParams } from "../../../utils/utils";
import { config } from "../../../wagmi";
import ViewSafeTransactionDialog from "../../dialogs/ViewSafeTransactionDialog";
import WaitForTransactionDialog from "../../dialogs/WaitForTransactionDialog";
import TransactionBuilder from "./TransactionBuilder";

import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import SaveIcon from "@mui/icons-material/Save";
import { deleteDraftTransaction, getDraftTransactionById, updateDraftTransaction } from "../../../api/api";
import AccountAddress from "../../common/AccountAddress";
import LoadTransactionDialog from "../../dialogs/LoadTransactionDialog";
import SaveTransactionDialog from "../../dialogs/SaveTransactionDialog";
import TransactionSummaryPanel from "./TransactionSummaryPanel";

const CreateTransaction: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const publicClient = usePublicClient();
  const account = useAccount();
  const { writeContractAsync } = useWriteContract();

  const { safeAccount, safeDeployment, safeStorage, storage } = useSafeWalletContext();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionHash, setTransactionHash] = useState<`0x${string}`>();
  const [safeTransaction, setSafeTransaction] = useState<SafeTransactionParams>();
  const [signature, setSignature] = useState<`0x${string}`>();
  const [safeTransactionHash, setSafeTransactionHash] = useState<`0x${string}`>();
  const [error, setError] = useState<string>();
  const [importHex, setImportHex] = useState<`0x${string}`>("0x");
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);
  const [copyUnsignedTxButtonEnabled, isCopyUnsignedTxButtonEnabled] = useState<boolean>(true);
  const [waitForTransactionDialogOpen, setWaitForTransactionDialogOpen] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  // Current step in the transaction process
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState<boolean>(false);
  const [saveDraftDialogOpen, setSaveDraftDialogOpen] = useState<boolean>(false);
  const [loadDraftDialogOpen, setLoadDraftDialogOpen] = useState<boolean>(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | undefined>();
  const [isEditingDraft, setIsEditingDraft] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  // Add this state for the unsaved changes warning dialog
  const [unsavedChangesDialog, setUnsavedChangesDialog] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  // Steps in the transaction flow
  const steps = ["Build Transactions", "Review & Sign", "Execute"];

  const handleAddTransaction = async (newTransaction: Transaction) => {
    const updatedTransactions = [...transactions, { ...newTransaction }];
    setTransactions(updatedTransactions);

    // Remove automatic saving when editing a draft
    // Just track that we have unsaved changes
    if (isEditingDraft) {
      setHasUnsavedChanges(true);
    }

    // Show confirmation
    setSnackbarMessage("Transaction added to batch");
    setSnackbarOpen(true);

    // Collapse the builder if on mobile after adding
    if (isMobile) {
      setIsSummaryExpanded(true);
    }
  };

  const getExportHex = (txs: Transaction[], safeTx: SafeTransactionParams, safeTxHash: `0x${string}`): string => {
    if (safeAccount) {
      const exportData: ImportData = {
        transactions: txs,
        safeAccount: safeAccount,
        safeTransaction: safeTx,
        safeTransactionHash: safeTxHash,
      };

      const exportDataString = JSON.stringify(exportData, (_key, value) =>
        typeof value === "bigint" ? value.toString() : value,
      );
      return bytesToHex(stringToBytes(exportDataString));
    }
    return "";
  };

  const getExportHexSigned = (): string => {
    if (safeAccount && safeTransaction && account.address && signature && safeTransactionHash) {
      const exportData: ImportSignedData = {
        transactions: transactions,
        safeAccount: safeAccount,
        signature: { signer: account.address, data: signature },
        safeTransaction: safeTransaction,
        safeTransactionHash: safeTransactionHash,
      };

      const exportDataString = JSON.stringify(exportData, (_key, value) =>
        typeof value === "bigint" ? value.toString() : value,
      );
      return bytesToHex(stringToBytes(exportDataString));
    }
    return "";
  };

  const handleViewSafeTransaction = async () => {
    // Recalculate safe transaction hash
    if (transactions.length >= 1) {
      const { safeTx, safeTxHash } = await getSafeTransactionInfo();

      setSafeTransactionHash(safeTxHash);

      setSafeTransaction({
        to: safeTx.to,
        value: safeTx.value,
        data: safeTx.data,
        operation: safeTx.operation,
        safeTxGas: safeTx.safeTxGas,
        baseGas: safeTx.baseGas,
        gasPrice: safeTx.gasPrice,
        gasToken: safeTx.gasToken,
        refundReceiver: safeTx.refundReceiver,
        nonce: safeTx.nonce,
      });
    }

    setViewDialogOpen(true);
  };

  const handleApproveTransactionHash = async () => {
    if (safeTransaction && safeAccount && safeTransactionHash) {
      try {
        const { request } = await simulateContract(config, {
          abi: safe,
          address: safeAccount,
          functionName: "approveHash",
          args: [safeTransactionHash],
        });
        setWaitForTransactionDialogOpen(true);

        const hash = await writeContractAsync(request);
        setTransactionHash(hash);
        await updateStorage(hash);
      } catch (err) {
        console.error(err);
        setWaitForTransactionDialogOpen(false);
        if (err instanceof BaseError) {
          const revertError = err.walk((err) => err instanceof ContractFunctionRevertedError);
          if (revertError instanceof ContractFunctionRevertedError) {
            const errorName = revertError.data?.errorName ?? "";
            setError(`${errorName} ${revertError.reason}`);
          }
        } else {
          setError("Transaction failed");
        }
      }
    }
  };

  const handleCopyToClipboard = async () => {
    isCopyUnsignedTxButtonEnabled(false);
    const result = await getSafeTransactionInfo();
    const safeTx = result.safeTx;

    setSafeTransactionHash(result.safeTxHash);

    setSafeTransaction({
      to: safeTx.to,
      value: safeTx.value,
      data: safeTx.data,
      operation: safeTx.operation,
      safeTxGas: safeTx.safeTxGas,
      baseGas: safeTx.baseGas,
      gasPrice: safeTx.gasPrice,
      gasToken: safeTx.gasToken,
      refundReceiver: safeTx.refundReceiver,
      nonce: safeTx.nonce,
    });

    if (safeTx) {
      const hexString = getExportHex(transactions, safeTx, result.safeTxHash);
      navigator.clipboard.writeText(hexString);

      setSnackbarMessage("Unsigned transaction copied to clipboard");
      setSnackbarOpen(true);
    } else {
      console.error("safeTransaction undefined");
    }
    isCopyUnsignedTxButtonEnabled(true);
  };

  const handleCopyToClipboardSigned = async () => {
    if (safeTransaction) {
      const hexString = getExportHexSigned();
      navigator.clipboard.writeText(hexString);

      setSnackbarMessage("Signed transaction copied to clipboard");
      setSnackbarOpen(true);
    } else {
      console.error("safeTransaction undefined");
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    const updatedTransactions = transactions.filter((_, index) => index !== id);

    setSignature(undefined);
    setSafeTransactionHash(undefined);
    setSafeTransaction(undefined);
    setTransactions(updatedTransactions);

    // Remove automatic saving when editing a draft
    // Just track that we have unsaved changes
    if (isEditingDraft) {
      setHasUnsavedChanges(true);
    }

    setSnackbarMessage("Transaction removed from batch");
    setSnackbarOpen(true);
  };

  const handleSignTransaction = async () => {
    // Recalculate safe transaction hash
    const { safeTx, safeTxHash } = await getSafeTransactionInfo();

    if (!safeTxHash) return;

    const result = await signTypedData(config, {
      domain: {
        chainId: account.chainId,
        verifyingContract: safeAccount,
      },
      types: EIP712_SAFE_TX_TYPE,
      primaryType: "SafeTx",
      message: { ...safeTx },
    });

    setSignature(result);

    setSafeTransactionHash(safeTxHash);

    setSafeTransaction({
      to: safeTx.to,
      value: safeTx.value,
      data: safeTx.data,
      operation: safeTx.operation,
      safeTxGas: safeTx.safeTxGas,
      baseGas: safeTx.baseGas,
      gasPrice: safeTx.gasPrice,
      gasToken: safeTx.gasToken,
      refundReceiver: safeTx.refundReceiver,
      nonce: safeTx.nonce,
    });

    // Move to next step after signing
    setActiveStep(2);

    setSnackbarMessage("Transaction successfully signed");
    setSnackbarOpen(true);
  };

  const getSafeTransactionInfo = async (): Promise<{
    safeTx: SafeTransactionParams;
    safeTxHash: `0x${string}`;
  }> => {
    let safeTransactionHashFromContractCall: `0x${string}` = "0x";
    let to: Address;
    let value: bigint;
    let callData: `0x${string}`;
    let operation: SafeOperation;
    const baseGas = 0n;
    const safeTxGas = 0n;
    const gasPrice = 0n;
    const gasToken: Address = zeroAddress;
    const refundReceiver: Address = zeroAddress;

    const abi = safe;
    if (safeAccount === undefined) {
      throw new Error("Safe account is undefined");
    }

    if (transactions.length < 1) {
      throw new Error("No transactions");
    }

    const nonce = (await readContract(config, {
      abi,
      address: safeAccount,
      functionName: "nonce",
    })) as bigint;

    if (transactions.length === 1) {
      to = transactions[0].to;
      value = BigInt(transactions[0].value);
      callData = transactions[0].data;
      operation = SafeOperation.CALL;
    } else {
      const metaTransactions = transactions.map((transaction) => {
        return {
          to: transaction.to,
          value: BigInt(transaction.value),
          data: transaction.data,
          operation: SafeOperation.CALL,
        };
      });

      callData = encodeFunctionData({
        abi: multisendCallOnly,
        functionName: "multiSend",
        args: [encodeMultiSend(metaTransactions)],
      });

      to = safeDeployment?.multiSendCallOnly ?? zeroAddress;
      value = 0n;
      operation = SafeOperation.DELEGATE_CALL;
    }

    safeTransactionHashFromContractCall = (await readContract(config, {
      abi,
      address: safeAccount,
      functionName: "getTransactionHash",
      args: [to, value, callData, operation, safeTxGas, baseGas, gasPrice, gasToken, refundReceiver, nonce],
    })) as `0x${string}`;

    return {
      safeTx: {
        to,
        value,
        data: callData,
        operation,
        safeTxGas: safeTxGas,
        baseGas: baseGas,
        gasPrice: gasPrice,
        gasToken: gasToken,
        refundReceiver: refundReceiver,
        nonce,
      },
      safeTxHash: safeTransactionHashFromContractCall,
    };
  };

  const handleExecuteTransaction = async () => {
    if (signature && safeTransaction && safeAccount) {
      try {
        const { request } = await simulateContract(config, {
          abi: safe,
          address: safeAccount,
          functionName: "execTransaction",
          args: [
            safeTransaction.to,
            safeTransaction.value,
            safeTransaction.data,
            safeTransaction.operation,
            safeTransaction.safeTxGas,
            safeTransaction.baseGas,
            safeTransaction.gasPrice,
            safeTransaction.gasToken,
            safeTransaction.refundReceiver,
            signature,
          ],
        });
        setWaitForTransactionDialogOpen(true);

        const hash = await writeContractAsync(request);
        setTransactionHash(hash);
        await updateStorage(hash);

        // Clean up draft if it was saved
        if (isEditingDraft && currentDraftId) {
          await deleteDraftTransaction(storage, currentDraftId);
          setCurrentDraftId(undefined);
          setIsEditingDraft(false);
        }
      } catch (err) {
        console.error(err);
        setWaitForTransactionDialogOpen(false);
        if (err instanceof BaseError) {
          const revertError = err.walk((err) => err instanceof ContractFunctionRevertedError);
          if (revertError instanceof ContractFunctionRevertedError) {
            const errorName = revertError.data?.errorName ?? "";
            setError(`${errorName} ${revertError.reason}`);
          }
        } else {
          setError("Transaction failed");
        }
      }
    }
  };

  const handleImportTransactions = () => {
    try {
      if (importHex) {
        const jsonString = new TextDecoder().decode(hexToBytes(importHex));
        const importedData = JSON.parse(jsonString) as ImportData;
        setTransactions(importedData.transactions);

        setSnackbarMessage("Transactions imported successfully");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Invalid hex input");
      setError("Invalid hex input. Please check the format and try again.");
    }
  };

  const updateStorage = async (hash: `0x${string}`) => {
    const safeTransactions = (await storage.getItem(STORAGE_KEY.SAFE_TRANSACTIONS)) as SafeTransactionInfo[];
    const result = await publicClient?.getTransaction({ hash: hash });
    if (safeTransaction && safeAccount) {
      const safeTransactionInfo: SafeTransactionInfo = {
        safeAccount: safeAccount,
        chainId: account.chainId,
        safeTransactionParams: safeTransaction,
        transactionHash: hash,
        status: "success",
        blockNumber: result?.blockNumber,
        blockHash: result?.blockHash,
      };
      if (safeTransactions) {
        await storage.setItem(STORAGE_KEY.SAFE_TRANSACTIONS, [...safeTransactions, safeTransactionInfo]);
      } else {
        await storage.setItem(STORAGE_KEY.SAFE_TRANSACTIONS, [safeTransactionInfo]);
      }
    }
  };

  const handleCloseWaitingDialog = () => {
    setWaitForTransactionDialogOpen(false);
  };

  // Update the handleNextStep function to check for unsaved changes
  const handleNextStep = async () => {
    // If we have unsaved draft changes, prompt before proceeding
    if (isEditingDraft && hasUnsavedChanges) {
      setPendingAction("next");
      setUnsavedChangesDialog(true);
      return;
    }

    // Rest of existing function...
    if (activeStep === 0) {
      // First step - validate we have transactions before proceeding
      if (transactions.length === 0) {
        setError("Please add at least one transaction before proceeding");
        return;
      }

      // Get transaction info and prepare for signing
      try {
        const { safeTx, safeTxHash } = await getSafeTransactionInfo();

        setSafeTransactionHash(safeTxHash);
        setSafeTransaction({
          to: safeTx.to,
          value: safeTx.value,
          data: safeTx.data,
          operation: safeTx.operation,
          safeTxGas: safeTx.safeTxGas,
          baseGas: safeTx.baseGas,
          gasPrice: safeTx.gasPrice,
          gasToken: safeTx.gasToken,
          refundReceiver: safeTx.refundReceiver,
          nonce: safeTx.nonce,
        });

        setActiveStep(1);
      } catch (err) {
        console.error(err);
        setError("Failed to prepare transaction. Please try again.");
      }
    }
  };

  // Update the handleBackStep function to check for unsaved changes
  const handleBackStep = () => {
    // If we have unsaved draft changes, prompt before going back
    if (isEditingDraft && hasUnsavedChanges) {
      setPendingAction("back");
      setUnsavedChangesDialog(true);
      return;
    }

    setActiveStep((prevStep) => Math.max(0, prevStep - 1));
  };

  // Add handlers for the unsaved changes dialog
  const handleContinueWithoutSaving = () => {
    setUnsavedChangesDialog(false);

    if (pendingAction === "next") {
      // Continue with next step
      if (activeStep === 0) {
        // ... existing next step code ...
      }
    } else if (pendingAction === "back") {
      setActiveStep((prevStep) => Math.max(0, prevStep - 1));
    } else if (pendingAction === "load") {
      setLoadDraftDialogOpen(true);
    }

    setPendingAction(null);
  };

  const handleSaveBeforeContinuing = async () => {
    setUnsavedChangesDialog(false);

    // Save the current draft
    await updateExistingDraft();

    // Then continue with the pending action
    if (pendingAction === "next") {
      // Continue with next step logic
      if (activeStep === 0) {
        // ... existing next step code ...
      }
    } else if (pendingAction === "back") {
      setActiveStep((prevStep) => Math.max(0, prevStep - 1));
    } else if (pendingAction === "load") {
      setLoadDraftDialogOpen(true);
    }

    setPendingAction(null);
  };

  // Update the handleOpenLoadDraftDialog function
  const handleOpenLoadDraftDialog = () => {
    // If we have unsaved changes, prompt first
    if (isEditingDraft && hasUnsavedChanges) {
      setPendingAction("load");
      setUnsavedChangesDialog(true);
      return;
    }

    setLoadDraftDialogOpen(true);
  };

  const toggleSummaryExpanded = () => {
    setIsSummaryExpanded(!isSummaryExpanded);
  };

  const handleOpenSaveDraftDialog = () => {
    // If editing a draft and we have changes, update it directly
    if (isEditingDraft && currentDraftId && hasUnsavedChanges) {
      updateExistingDraft();
    } else {
      // Otherwise open dialog to create new draft
      setSaveDraftDialogOpen(true);
    }
  };

  const updateExistingDraft = async () => {
    if (!currentDraftId || !isEditingDraft) return;

    try {
      await updateDraftTransaction(storage, currentDraftId, {
        transactions: transactions,
      });

      setHasUnsavedChanges(false);
      setSnackbarMessage("Draft updated successfully");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Failed to update draft:", err);
      setError("Failed to update draft transaction");
    }
  };

  const handleDraftSaved = (draftId: string) => {
    setCurrentDraftId(draftId);
    setIsEditingDraft(true);
    setHasUnsavedChanges(false);

    setSnackbarMessage("Transaction draft saved successfully");
    setSnackbarOpen(true);
  };

  const handleLoadDraft = (draft: SafeTransactionDraft) => {
    // Reset current state
    setTransactions([]);
    setSignature(undefined);
    setSafeTransactionHash(undefined);
    setSafeTransaction(undefined);
    setActiveStep(0);

    // Load the draft
    setTransactions(draft.transactions);
    setCurrentDraftId(draft.id);
    setIsEditingDraft(true);
    setHasUnsavedChanges(false);

    setSnackbarMessage("Draft loaded successfully");
    setSnackbarOpen(true);
  };

  // Update the renderStepContent method for consistent heights across all steps

  const renderStepContent = () => {
    const contentHeight = "calc(100vh - 250px)";

    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid
              size={{ xs: 12, md: isSummaryExpanded ? 12 : 9 }}
              sx={{ display: isMobile && isSummaryExpanded ? "none" : "block" }}
            >
              <Paper
                elevation={0}
                variant="outlined"
                sx={{
                  p: 2,
                  mb: isMobile ? 2 : 0,
                  height: contentHeight,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden", // Hide overflow so inner scrollable content works properly
                }}
              >
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h5" gutterBottom>
                    Add Transactions
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, overflow: "auto" }}>
                  <TransactionBuilder
                    importHex={importHex}
                    setImportHex={setImportHex}
                    handleAddTransaction={handleAddTransaction}
                    handleImportTransactions={handleImportTransactions}
                  />
                </Box>
              </Paper>
            </Grid>

            <Grid
              size={{ xs: 12, md: isSummaryExpanded ? 12 : 3 }}
              sx={{
                display: isMobile && !isSummaryExpanded ? "none" : "block",
              }}
            >
              <TransactionSummaryPanel
                transactions={transactions}
                handleDeleteTransaction={handleDeleteTransaction}
                isMobile={isMobile}
                isSummaryExpanded={isSummaryExpanded}
                toggleSummaryExpanded={toggleSummaryExpanded}
                height={contentHeight}
                step={activeStep}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 9 }}>
              {/* Content container with fixed height and scrollable content */}
              <Box
                sx={{
                  height: contentHeight,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden", // Hide overflow so inner scrollable content works properly
                }}
              >
                <Box sx={{ flex: 1, overflow: "auto" }}>
                  <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h5" gutterBottom>
                      Review Transactions
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Transaction Details
                      </Typography>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "background.paper",
                          borderRadius: 1,
                          border: 1,
                          borderColor: "divider",
                        }}
                      >
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 6 }}>
                            <Typography variant="body2" color="text.secondary">
                              Number of transactions
                            </Typography>
                            <Typography variant="body1">{transactions.length}</Typography>
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <Typography variant="body2" color="text.secondary">
                              Safe account
                            </Typography>
                            <Typography variant="body1" sx={{ wordBreak: "break-all" }}>
                              {safeAccount}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <Typography variant="body2" color="text.secondary">
                              Transaction hash
                            </Typography>
                            <Typography variant="body1" sx={{ wordBreak: "break-all" }}>
                              {safeTransactionHash}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 2,
                      }}
                    >
                      <Button variant="outlined" startIcon={<VisibilityIcon />} onClick={handleViewSafeTransaction}>
                        View Safe Transaction Details
                      </Button>

                      <Button
                        variant="outlined"
                        startIcon={<ContentCopyIcon />}
                        onClick={handleCopyToClipboard}
                        disabled={!copyUnsignedTxButtonEnabled}
                      >
                        Copy Unsigned
                      </Button>
                    </Box>
                  </Paper>

                  <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Signing Options
                    </Typography>

                    <Alert severity="info" sx={{ mb: 2 }}>
                      Sign this transaction to execute it, or approve the transaction hash.
                    </Alert>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<FingerprintIcon />}
                        onClick={handleSignTransaction}
                        fullWidth
                      >
                        Sign Transaction
                      </Button>

                      <Button
                        variant="outlined"
                        startIcon={<CheckCircleIcon />}
                        onClick={handleApproveTransactionHash}
                        fullWidth
                      >
                        Approve Transaction Hash
                      </Button>
                    </Box>
                  </Paper>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <TransactionSummaryPanel
                transactions={transactions}
                handleDeleteTransaction={handleDeleteTransaction}
                viewOnly={true}
                isMobile={isMobile}
                height={contentHeight}
                step={activeStep}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 9 }}>
              {/* Content container with fixed height and scrollable content */}
              <Box
                sx={{
                  height: contentHeight,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden", // Hide overflow so inner scrollable content works properly
                }}
              >
                <Box sx={{ flex: 1, overflow: "auto" }}>
                  <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h5" gutterBottom>
                      Execute Transaction
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                      <Alert severity="success" sx={{ mb: 2 }} icon={<CheckCircleIcon fontSize="inherit" />}>
                        Transaction successfully signed! You can now execute it or share it with other owners.
                      </Alert>

                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "background.paper",
                          borderRadius: 1,
                          border: 1,
                          borderColor: "divider",
                        }}
                        mb={2}
                      >
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12 }}>
                            <Typography variant="body2" color="text.secondary">
                              Safe Transaction Hash
                            </Typography>
                            <Typography variant="body1" sx={{ wordBreak: "break-all" }}>
                              {safeTransactionHash}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>

                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "background.paper",
                          borderRadius: 1,
                          border: 1,
                          borderColor: "divider",
                        }}
                      >
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12 }}>
                            <Typography variant="body2" color="text.secondary">
                              Signature
                            </Typography>
                            <Typography variant="body1" sx={{ wordBreak: "break-all" }}>
                              {signature}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 2,
                        flexWrap: "wrap",
                        gap: 1,
                      }}
                    >
                      <Button variant="outlined" startIcon={<VisibilityIcon />} onClick={handleViewSafeTransaction}>
                        View Safe Transaction Details
                      </Button>

                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="outlined"
                          startIcon={<ContentCopyIcon />}
                          onClick={() => {
                            if (signature) {
                              navigator.clipboard.writeText(signature);
                              setSnackbarMessage("Signature copied to clipboard");
                              setSnackbarOpen(true);
                            }
                          }}
                        >
                          Copy Signature
                        </Button>

                        <Button
                          variant="outlined"
                          startIcon={<ContentCopyIcon />}
                          onClick={handleCopyToClipboardSigned}
                        >
                          Copy Signed Tx
                        </Button>
                      </Box>
                    </Box>
                  </Paper>

                  <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Execute Options
                    </Typography>

                    {account && safeStorage?.owners?.find((owner) => owner === account.address) === undefined ? (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        You are not an owner of this Safe. You can still create and sign transactions, but they must be
                        executed by a Safe owner.
                      </Alert>
                    ) : (
                      <Box sx={{ mb: 2 }}>
                        <Alert severity="info" icon={<InfoOutlinedIcon />}>
                          Execute this transaction to submit it to the blockchain. Make sure you have enough ETH for gas
                          fees.
                        </Alert>
                      </Box>
                    )}

                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<PlayArrowIcon />}
                      onClick={handleExecuteTransaction}
                      fullWidth
                      disabled={
                        account && safeStorage?.owners?.find((owner) => owner === account.address) === undefined
                      }
                    >
                      Execute Transaction
                    </Button>
                  </Paper>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <TransactionSummaryPanel
                transactions={transactions}
                handleDeleteTransaction={handleDeleteTransaction}
                viewOnly={true}
                isMobile={isMobile}
                height={contentHeight}
                step={activeStep}
              />
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  useEffect(() => {
    const loadDraftFromParam = async () => {
      // Check for draft ID in URL params
      const draftId = localStorage.getItem("openDraftId");

      if (draftId) {
        localStorage.removeItem("openDraftId");

        try {
          const draft = await getDraftTransactionById(storage, draftId);
          if (draft && draft.safeAccount === safeAccount) {
            setTransactions(draft.transactions);
            setCurrentDraftId(draft.id);
            setIsEditingDraft(true);

            setSnackbarMessage("Draft loaded successfully");
            setSnackbarOpen(true);
          }
        } catch (err) {
          console.error("Error loading draft:", err);
          setError("Failed to load transaction draft");
        }
      }
    };

    if (safeAccount) {
      loadDraftFromParam();
    }
  }, [safeAccount, storage]);

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, maxWidth: "xl", mx: "auto" }}>
      {/* Header with stepper */}
      <Box
        sx={{
          p: { xs: 2, md: 3 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Typography variant="h4" gutterBottom>
            Create Transaction
          </Typography>

          <AccountAddress address={safeAccount} />

          {isEditingDraft && <Chip label="Draft" color="primary" icon={<SaveIcon />} size="small" />}
        </Box>

        <Stepper
          activeStep={activeStep}
          alternativeLabel={!isMobile}
          orientation={isMobile ? "vertical" : "horizontal"}
          sx={{ mt: 2 }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(undefined)}>
          {error}
        </Alert>
      )}

      {/* Transaction hash success message */}
      {transactionHash && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Transaction submitted successfully with hash: {transactionHash}
        </Alert>
      )}

      {/* Main content area based on step */}
      {renderStepContent()}

      {/* Navigation buttons */}
      <Box
        sx={{
          mt: 3,
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleBackStep}
            disabled={activeStep === 0}
            startIcon={<KeyboardArrowLeftIcon />}
          >
            Back
          </Button>

          {activeStep === 0 && (
            <>
              <Button variant="outlined" startIcon={<FolderOpenIcon />} onClick={handleOpenLoadDraftDialog}>
                Load
              </Button>
              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={handleOpenSaveDraftDialog}
                disabled={transactions.length === 0}
                color={isEditingDraft && hasUnsavedChanges ? "primary" : "inherit"}
              >
                {isEditingDraft && hasUnsavedChanges ? "Update Draft" : isEditingDraft ? "Save As New" : "Save Draft"}
              </Button>
            </>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {isEditingDraft && activeStep === 0 && (
            <Chip
              label={`${hasUnsavedChanges ? "Unsaved Changes" : "Editing Draft"}${
                currentDraftId ? ` #${currentDraftId.substring(6, 11)}` : ""
              }`}
              color={hasUnsavedChanges ? "warning" : "primary"}
              variant="outlined"
              sx={{ mr: 1 }}
            />
          )}

          {activeStep === 0 && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNextStep}
              endIcon={<KeyboardArrowRightIcon />}
              disabled={transactions.length === 0}
            >
              {"Review"}
            </Button>
          )}
        </Box>
      </Box>

      {/* Floating action button on mobile for step 0 */}
      {isMobile && activeStep === 0 && !isSummaryExpanded && (
        <Fab color="primary" sx={{ position: "fixed", bottom: 16, right: 16 }} onClick={toggleSummaryExpanded}>
          <Badge badgeContent={transactions.length} color="error" invisible={transactions.length === 0}>
            <DoneIcon />
          </Badge>
        </Fab>
      )}

      {/* Modal dialogs */}
      <ViewSafeTransactionDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        safeTransaction={safeTransaction}
        safeTransactionHash={safeTransactionHash || "0x"}
      />

      {transactionHash && (
        <WaitForTransactionDialog
          open={waitForTransactionDialogOpen}
          hash={transactionHash}
          onClose={handleCloseWaitingDialog}
        />
      )}

      <SaveTransactionDialog
        open={saveDraftDialogOpen}
        onClose={() => setSaveDraftDialogOpen(false)}
        transactions={transactions}
        safeAccount={safeAccount}
        chainId={account.chainId}
        storage={storage}
        onSaved={handleDraftSaved}
      />

      <LoadTransactionDialog
        open={loadDraftDialogOpen}
        onClose={() => setLoadDraftDialogOpen(false)}
        onLoad={handleLoadDraft}
        storage={storage}
        currentSafeAccount={safeAccount}
      />

      {/* Notification snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />

      {/* Unsaved changes dialog */}
      <Dialog
        open={unsavedChangesDialog}
        onClose={() => setUnsavedChangesDialog(false)}
        aria-labelledby="unsaved-changes-dialog-title"
      >
        <DialogTitle id="unsaved-changes-dialog-title">Unsaved Changes</DialogTitle>
        <DialogContent>
          <Typography>
            You have unsaved changes to your draft. Would you like to save them before continuing?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnsavedChangesDialog(false)}>Cancel</Button>
          <Button onClick={handleContinueWithoutSaving}>Don't Save</Button>
          <Button onClick={handleSaveBeforeContinuing} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreateTransaction;
