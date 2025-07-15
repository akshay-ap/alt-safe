import { Alert, Button, CircularProgress, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { readContract, simulateContract } from "@wagmi/core";
import type React from "react";
import { useEffect, useState } from "react";
import { zeroAddress } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import safe from "../../abis/Safe.json";
import { useSafeWalletContext } from "../../context/WalletContext";
import type { SafeTransactionParams } from "../../utils/utils";
import { calculateSafeTransactionHash } from "../../utils/utils";
import { config } from "../../wagmi";
import SafeTransactionForm from "../common/SafeTransactionForm";

const ApproveSafeTransactionForm: React.FC = () => {
  const { safeAccount, safeStorage } = useSafeWalletContext();
  const { chainId } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const initialTransaction: SafeTransactionParams = {
    to: "0x",
    value: 0n,
    data: "0x",
    operation: 0,
    safeTxGas: 0n,
    baseGas: 0n,
    gasPrice: 0n,
    gasToken: zeroAddress,
    refundReceiver: zeroAddress,
    nonce: 0n,
  };

  const [transaction, setTransaction] = useState<SafeTransactionParams>(initialTransaction);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [safeTransactionHash, setSafeTransactionHash] = useState<string>();

  const [error, setError] = useState<string | null>(null); // Error state

  useEffect(() => {
    if (safeStorage) {
      setTransaction((prev) => ({
        ...prev,
        nonce: safeStorage.nonce,
      }));
    }
  }, [safeStorage]);

  const handleChange = (field: keyof SafeTransactionParams, value: string | number) => {
    setTransaction((prev) => ({
      ...prev,
      [field]: typeof value === "string" ? value : BigInt(value),
    }));
  };

  useEffect(() => {
    if (chainId !== undefined && safeAccount !== undefined) {
      try {
        const hash = calculateSafeTransactionHash(transaction, safeAccount, chainId);
        setSafeTransactionHash(hash);
      } catch (error) {
        setSafeTransactionHash(undefined);
      }
    }
  }, [transaction, chainId, safeAccount]);

  const handleApprove = async () => {
    if (safeAccount === undefined || chainId === undefined) return;

    try {
      setLoading(true);
      setError(null); // Clear any previous error
      const safeTransactionHashFromContractCall = (await readContract(config, {
        abi: safe,
        address: safeAccount,
        functionName: "getTransactionHash",
        args: [
          transaction.to,
          transaction.value,
          transaction.data,
          transaction.operation,
          transaction.safeTxGas,
          transaction.baseGas,
          transaction.gasPrice,
          transaction.gasToken,
          transaction.refundReceiver,
          transaction.nonce,
        ],
      })) as `0x${string}`;

      if (safeTransactionHashFromContractCall !== safeTransactionHash) {
        setError("Transaction hash mismatch. Please check the input values.");
        return;
      }

      const { request } = await simulateContract(config, {
        abi: safe,
        address: safeAccount,
        functionName: "approveHash",
        args: [safeTransactionHashFromContractCall],
      });

      const hash = await writeContractAsync(request);
      setTransactionHash(hash);
    } catch (err) {
      console.error("Error approving transaction:", err);
      setError("Failed to approve the transaction. Please check the input values and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography variant="h6">Approve Safe Transaction</Typography>
      </Grid>
      <SafeTransactionForm
        transaction={transaction}
        readOnly={false} // Allow editing
        onChange={handleChange} // Pass the change handler
      />
      <Grid size={12}>
        <Button variant="contained" color="primary" onClick={handleApprove}>
          Approve
        </Button>
      </Grid>
      {error && ( // Display error if it exists
        <Grid size={12}>
          <Alert severity="error">{error}</Alert>
        </Grid>
      )}
      {safeTransactionHash && (
        <Grid size={12}>
          <Alert severity="info">Safe Transaction Hash: {safeTransactionHash}</Alert>
        </Grid>
      )}
      {loading && (
        <Grid size={12}>
          <CircularProgress />
        </Grid>
      )}
      {transactionHash && (
        <Grid size={12}>
          <Alert severity="success">Transaction hash approved! Hash: {transactionHash}</Alert>
        </Grid>
      )}
    </Grid>
  );
};

export default ApproveSafeTransactionForm;
