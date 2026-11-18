import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Alert, Box, Button, Paper, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { signTypedData, simulateContract } from "@wagmi/core";
import { useState } from "react";
import { BaseError, bytesToHex, ContractFunctionRevertedError, stringToBytes } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import safe from "../../../abis/Safe.json";
import { STORAGE_KEY } from "../../../constants";
import { useCreateTransactionContext } from "../../../context/CreateTransactionContext";
import type { ImportData, Transaction } from "../../../context/types";
import { type SafeTransactionInfo, useSafeWalletContext } from "../../../context/WalletContext";
import { NONCE_LOADING_ERROR, nonceWarning, prepareSafeTransaction } from "../../../utils/safeTransaction";
import { EIP712_SAFE_TX_TYPE, type SafeTransactionParams } from "../../../utils/utils";
import { config } from "../../../wagmi";
import AccountAddress from "../../common/AccountAddress";
import TransactionHash from "../../common/TransactionHash";
import ViewSafeTransactionDialog from "../../dialogs/ViewSafeTransactionDialog";
import WaitForTransactionDialog from "../../dialogs/WaitForTransactionDialog";
import TransactionSummaryPanel from "../summary/TransactionSummaryPanel";

interface ReviewProps {
  setActiveStep: (step: number) => void;
}

const ReviewRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <Box sx={{ display: "grid", gridTemplateColumns: { sm: "180px 1fr" }, gap: { xs: 0.25, sm: 2 }, py: 1 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Box sx={{ minWidth: 0 }}>{children}</Box>
  </Box>
);

const SigningOption: React.FC<{ title: string; description: string; action: React.ReactNode }> = ({
  title,
  description,
  action,
}) => (
  <Stack spacing={1.5} sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 1.5, alignItems: "flex-start" }}>
    <Box>
      <Typography variant="subtitle2">{title}</Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Box>
    {action}
  </Stack>
);

const Review: React.FC<ReviewProps> = ({ setActiveStep }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const publicClient = usePublicClient();
  const account = useAccount();
  const { writeContractAsync } = useWriteContract();

  const {
    transactions,
    transactionHash,
    safeTransactionHash,
    safeTransaction,
    nonce,
    onChainNonce,
    gasPrice,
    safeTxGas,
    baseGas,
    refundToAddress,
    refundTokenAddress,
    setTransactionHash,
    setSafeTransactionHash,
    setSafeTransaction,
    setSignature,
    setError,
  } = useCreateTransactionContext();

  const { safeAccount, safeDeployment, storage } = useSafeWalletContext();

  const [copyUnsignedTxButtonEnabled, isCopyUnsignedTxButtonEnabled] = useState<boolean>(true);
  const [waitForTransactionDialogOpen, setWaitForTransactionDialogOpen] = useState<boolean>(false);
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);

  // Fixed height for consistent layout

  const handleCloseWaitingDialog = () => {
    setWaitForTransactionDialogOpen(false);
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

    // Move to step 2 (Execute) after signing
    setActiveStep(2);

    // TODO: Pass snackbar message to parent component
    console.log("Transaction successfully signed");
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

      // TODO: Pass snackbar message to parent component
      console.log("Unsigned transaction copied to clipboard");
    } else {
      console.error("safeTransaction undefined");
    }
    isCopyUnsignedTxButtonEnabled(true);
  };

  return (
    <Box
      sx={{
        display: "grid",
        gap: 3,
        alignItems: "start",
        gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 320px" },
      }}
    >
      <Stack spacing={2} sx={{ minWidth: 0 }}>
        <Paper variant="outlined">
          <Box sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
            <Typography variant="h5" component="h2">
              Safe transaction
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your wallet will ask you to sign this hash. Check that it matches before you confirm.
            </Typography>
          </Box>
          <Box sx={{ px: 2.5, pb: 1.5 }}>
            <ReviewRow label="Safe transaction hash">
              <TransactionHash hash={safeTransactionHash} />
            </ReviewRow>
            <ReviewRow label="Safe">
              <AccountAddress address={safeAccount} />
            </ReviewRow>
            <ReviewRow label="Nonce">
              {safeTransaction?.nonce.toString() ?? "—"} (
              {transactions.length === 1 ? "1 action" : `${transactions.length} actions, batched with MultiSend`})
            </ReviewRow>
            {safeTransaction && nonceWarning(safeTransaction.nonce, onChainNonce) && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                {nonceWarning(safeTransaction.nonce, onChainNonce)}
              </Alert>
            )}
          </Box>
          <Stack
            direction="row"
            spacing={1}
            sx={{ px: 2.5, py: 1.5, borderTop: 1, borderColor: "divider", flexWrap: "wrap", rowGap: 1 }}
          >
            <Button startIcon={<VisibilityIcon />} onClick={handleViewSafeTransaction}>
              View all parameters
            </Button>
            <Button
              startIcon={<ContentCopyIcon />}
              onClick={handleCopyToClipboard}
              disabled={!copyUnsignedTxButtonEnabled}
            >
              Copy for other signers
            </Button>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 1.5 }}>
            Sign
          </Typography>
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
            <SigningOption
              title="Sign with your wallet"
              description="Free and off-chain. Share it with the other owners if more signatures are needed."
              action={
                <Button variant="contained" startIcon={<FingerprintIcon />} onClick={handleSignTransaction}>
                  Sign
                </Button>
              }
            />
            <SigningOption
              title="Approve on chain"
              description="Sends approveHash and costs gas. For wallets that cannot sign typed data."
              action={
                <Button variant="outlined" startIcon={<CheckCircleIcon />} onClick={handleApproveTransactionHash}>
                  Approve
                </Button>
              }
            />
          </Box>
        </Paper>

        {transactionHash && (
          <WaitForTransactionDialog
            open={waitForTransactionDialogOpen}
            hash={transactionHash}
            onClose={handleCloseWaitingDialog}
          />
        )}
      </Stack>

      <Box sx={{ position: { lg: "sticky" }, top: { lg: 80 } }}>
        <TransactionSummaryPanel
          transactions={transactions}
          handleDeleteTransaction={() => {}}
          viewOnly={true}
          isMobile={isMobile}
        />
      </Box>

      {/* Modal dialogs */}
      <ViewSafeTransactionDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        safeTransaction={safeTransaction}
        safeTransactionHash={safeTransactionHash || "0x"}
      />
    </Box>
  );
};

export default Review;
