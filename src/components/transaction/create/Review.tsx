import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Alert, Box, Button, Paper, Typography, useMediaQuery, useTheme } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { readContract, signTypedData, simulateContract } from "@wagmi/core";
import { useState } from "react";
import { bytesToHex, encodeFunctionData, stringToBytes } from "viem";
import { zeroAddress } from "viem";
import type { Address } from "viem";
import { BaseError, ContractFunctionRevertedError } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import multisendCallOnly from "../../../abis/MultiSendCallOnly.json";
import safe from "../../../abis/Safe.json";
import { STORAGE_KEY } from "../../../constants";
import { useCreateTransactionContext } from "../../../context/CreateTransactionContext";
import { type SafeTransactionInfo, useSafeWalletContext } from "../../../context/WalletContext";
import type { ImportData, Transaction } from "../../../context/types";
import { encodeMultiSend } from "../../../utils/multisend";
import { EIP712_SAFE_TX_TYPE, SafeOperation, type SafeTransactionParams } from "../../../utils/utils";
import { config } from "../../../wagmi";
import ViewSafeTransactionDialog from "../../dialogs/ViewSafeTransactionDialog";
import WaitForTransactionDialog from "../../dialogs/WaitForTransactionDialog";
import TransactionSummaryPanel from "../summary/TransactionSummaryPanel";

interface ReviewProps {
  setActiveStep: (step: number) => void;
}

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
  const contentHeight = "calc(100vh - 250px)";

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
        {transactionHash && (
          <WaitForTransactionDialog
            open={waitForTransactionDialogOpen}
            hash={transactionHash}
            onClose={handleCloseWaitingDialog}
          />
        )}
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <TransactionSummaryPanel
          transactions={transactions}
          handleDeleteTransaction={() => {}}
          viewOnly={true}
          isMobile={isMobile}
        />
      </Grid>

      {/* Modal dialogs */}
      <ViewSafeTransactionDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        safeTransaction={safeTransaction}
        safeTransactionHash={safeTransactionHash || "0x"}
      />
    </Grid>
  );
};

export default Review;
