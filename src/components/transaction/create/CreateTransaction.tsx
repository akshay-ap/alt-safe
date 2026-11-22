import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SaveIcon from "@mui/icons-material/Save";
import TuneIcon from "@mui/icons-material/Tune";
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
  Snackbar,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useAccount, useChainId, usePublicClient } from "wagmi";
import { deleteDraftTransaction, getDraftTransactionById, isDraftFor, updateDraftTransaction } from "../../../api/api";
import { STORAGE_KEY } from "../../../constants";
import { useCreateTransactionContext } from "../../../context/CreateTransactionContext";
import type { SafeTransactionDraft, Transaction } from "../../../context/types";
import { type SafeTransactionInfo, useSafeWalletContext } from "../../../context/WalletContext";
import { NONCE_LOADING_ERROR, prepareSafeTransaction } from "../../../utils/safeTransaction";
import { TOP_BAR_HEIGHT } from "../../app/NavigationBar";
import PageHeader from "../../common/PageHeader";
import LoadTransactionDialog from "../../dialogs/LoadTransactionDialog";
import SaveTransactionDialog from "../../dialogs/SaveTransactionDialog";
import ViewSafeTransactionDialog from "../../dialogs/ViewSafeTransactionDialog";
import SignatureCollector from "../SignatureCollector";
import TransactionSummaryPanel from "../summary/TransactionSummaryPanel";
import { ExecuteCard, SignedTransactionCard } from "./ExecuteStep";
import Review from "./Review";
import TransactionBuilder from "./TransactionBuilder";
import TransactionParamsForm from "./TransactionParamsForm";

const CreateTransaction: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const publicClient = usePublicClient();
  const account = useAccount();
  const chainId = useChainId();

  const { safeAccount, storage, safeDeployment } = useSafeWalletContext();
  const {
    transactions,
    setTransactions,
    transactionHash,
    setTransactionHash,
    safeTransaction,
    setSafeTransaction,
    signature,
    setSignature,
    safeTransactionHash,
    setSafeTransactionHash,
    error,
    setError,
    nonce,
    onChainNonce,
    gasPrice,
    safeTxGas,
    baseGas,
    refundToAddress,
    refundTokenAddress,
  } = useCreateTransactionContext();
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  // Current step in the transaction process
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState<boolean>(false);
  const [paramsDialogOpen, setParamsDialogOpen] = useState<boolean>(false);
  const [saveDraftDialogOpen, setSaveDraftDialogOpen] = useState<boolean>(false);
  const [loadDraftDialogOpen, setLoadDraftDialogOpen] = useState<boolean>(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | undefined>();
  const [isEditingDraft, setIsEditingDraft] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  // Add this state for the unsaved changes warning dialog
  const [unsavedChangesDialog, setUnsavedChangesDialog] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  // Steps in the transaction flow
  // No stepper: the page heading names the current step instead.
  const stepHeadings = [
    { title: "New transaction", description: "Add one or more actions to a batch, then review it." },
    { title: "Review and sign", description: "Check the Safe transaction, then sign it with your wallet." },
    { title: "Execute", description: "Submit the signed transaction, or share it with the other owners." },
  ];

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

  const getSafeTransactionInfo = () => {
    if (safeAccount === undefined) throw new Error("Safe account is undefined");
    // nonce is a 0 placeholder until the Safe's nonce has loaded.
    if (onChainNonce === undefined) throw new Error(NONCE_LOADING_ERROR);
    const settings = {
      nonce,
      safeTxGas,
      baseGas,
      gasPrice,
      gasToken: refundTokenAddress,
      refundReceiver: refundToAddress,
    };
    return prepareSafeTransaction(safeAccount, transactions, settings, safeDeployment?.multiSendCallOnly);
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

  const handleExecuted = async (hash: `0x${string}`) => {
    setTransactionHash(hash);
    await updateStorage(hash);
    // Clean up draft if it was saved
    if (isEditingDraft && currentDraftId) {
      await deleteDraftTransaction(storage, currentDraftId);
      setCurrentDraftId(undefined);
      setIsEditingDraft(false);
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
    switch (activeStep) {
      case 0:
        return (
          <Box
            sx={{
              display: "grid",
              gap: 3,
              alignItems: "start",
              gridTemplateColumns: isSummaryExpanded ? "1fr" : { xs: "1fr", lg: "minmax(0, 1fr) 320px" },
              height: { lg: "100%" },
              gridTemplateRows: { lg: "minmax(0, 1fr)" },
            }}
          >
            <Box
              sx={{ display: isMobile && isSummaryExpanded ? "none" : "block", minWidth: 0, height: { lg: "100%" } }}
            >
              <TransactionBuilder handleAddTransaction={handleAddTransaction} />
            </Box>
            <Box
              sx={{
                display: isMobile && !isSummaryExpanded ? "none" : "flex",
                flexDirection: "column",
                height: { lg: "100%" },
              }}
            >
              <Box sx={{ flex: { lg: 1 }, minHeight: 0, overflowY: { lg: "auto" } }}>
                <TransactionSummaryPanel
                  transactions={transactions}
                  handleDeleteTransaction={handleDeleteTransaction}
                  isMobile={isMobile}
                  isSummaryExpanded={isSummaryExpanded}
                  toggleSummaryExpanded={toggleSummaryExpanded}
                />
              </Box>
              <Button
                variant="contained"
                fullWidth
                onClick={handleNextStep}
                endIcon={<KeyboardArrowRightIcon />}
                disabled={transactions.length === 0}
                sx={{ mt: 2 }}
              >
                Review batch
              </Button>
            </Box>
          </Box>
        );

      case 1:
        return <Review setActiveStep={setActiveStep} />;

      case 2:
        return (
          <Box
            sx={{
              display: "grid",
              gap: 3,
              alignItems: "start",
              gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 320px" },
            }}
          >
            <Stack spacing={3} sx={{ minWidth: 0 }}>
              <SignedTransactionCard
                safeTransactionHash={safeTransactionHash}
                signature={signature}
                onViewDetails={handleViewSafeTransaction}
              />
              {transactionHash ? (
                <ExecuteCard executionHash={transactionHash} />
              ) : (
                safeTransaction &&
                safeTransactionHash && (
                  <SignatureCollector
                    transactions={transactions}
                    safeTransaction={safeTransaction}
                    safeTransactionHash={safeTransactionHash}
                    initialSignatures={
                      account.address && signature ? [{ signer: account.address, data: signature }] : []
                    }
                    onExecuted={handleExecuted}
                  />
                )
              )}
            </Stack>
            <Box sx={{ position: { lg: "sticky" }, top: { lg: 80 } }}>
              <TransactionSummaryPanel
                transactions={transactions}
                handleDeleteTransaction={handleDeleteTransaction}
                viewOnly={true}
                isMobile={isMobile}
              />
            </Box>
          </Box>
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
          if (draft && isDraftFor(draft, safeAccount, chainId)) {
            setTransactions(draft.transactions);
            setCurrentDraftId(draft.id);
            setIsEditingDraft(true);

            setSnackbarMessage("Draft loaded successfully");
            setSnackbarOpen(true);
          } else if (draft) {
            setError("This draft belongs to another Safe or network. Switch to it to open the draft.");
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
  }, [safeAccount, chainId, storage, setTransactions, setError]);

  return (
    // While building, the page is exactly the viewport (minus the shell's top bar and padding); columns scroll inside.
    <Box
      sx={
        activeStep === 0
          ? {
              display: { lg: "flex" },
              flexDirection: "column",
              height: { lg: `calc(100vh - ${TOP_BAR_HEIGHT + 48}px)` },
            }
          : undefined
      }
    >
      <PageHeader
        title={stepHeadings[activeStep].title}
        description={stepHeadings[activeStep].description}
        actions={
          activeStep > 0 && !transactionHash ? (
            // Once executed the nonce is spent, so going back to re-sign would only produce a dead transaction.
            <Button variant="outlined" onClick={handleBackStep} startIcon={<KeyboardArrowLeftIcon />}>
              Back
            </Button>
          ) : (
            activeStep === 0 && (
              <>
                {isEditingDraft && (
                  <Chip
                    label={hasUnsavedChanges ? "Unsaved draft changes" : "Editing draft"}
                    color={hasUnsavedChanges ? "warning" : "default"}
                    variant="outlined"
                  />
                )}
                <Button startIcon={<TuneIcon />} onClick={() => setParamsDialogOpen(true)}>
                  Nonce & gas
                </Button>
                <Button startIcon={<FolderOpenIcon />} onClick={handleOpenLoadDraftDialog}>
                  Open draft
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  onClick={handleOpenSaveDraftDialog}
                  disabled={transactions.length === 0}
                >
                  {isEditingDraft && hasUnsavedChanges
                    ? "Update draft"
                    : isEditingDraft
                      ? "Save as new draft"
                      : "Save draft"}
                </Button>
              </>
            )
          )
        }
      />

      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(undefined)}>
          {error}
        </Alert>
      )}

      {/* Transaction hash success message */}

      {/* Main content area based on step */}
      <Box sx={{ flex: 1, minHeight: 0 }}>{renderStepContent()}</Box>

      {/* Floating action button on mobile for step 0 */}
      {isMobile && activeStep === 0 && !isSummaryExpanded && (
        <Fab
          color="primary"
          sx={{ position: "fixed", bottom: 16, right: 16 }}
          onClick={toggleSummaryExpanded}
          aria-label={`View batch (${transactions.length})`}
        >
          <Badge badgeContent={transactions.length} color="error" invisible={transactions.length === 0}>
            <FormatListBulletedIcon />
          </Badge>
        </Fab>
      )}

      <Dialog
        open={paramsDialogOpen}
        onClose={() => setParamsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        aria-labelledby="transaction-params-title"
      >
        <TransactionParamsForm onSaved={() => setParamsDialogOpen(false)} />
      </Dialog>

      {/* Modal dialogs */}
      <ViewSafeTransactionDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        safeTransaction={safeTransaction}
        safeTransactionHash={safeTransactionHash || "0x"}
      />

      <SaveTransactionDialog
        open={saveDraftDialogOpen}
        onClose={() => setSaveDraftDialogOpen(false)}
        transactions={transactions}
        safeAccount={safeAccount}
        chainId={chainId}
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
