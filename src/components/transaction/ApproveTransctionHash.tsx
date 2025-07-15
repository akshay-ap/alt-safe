import { Alert, Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { simulateContract } from "@wagmi/core";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { BaseError, ContractFunctionRevertedError } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import safe from "../../abis/Safe.json";
import { useSafeWalletContext } from "../../context/WalletContext";
import { fetchApprovals } from "../../utils/utils";
import { config } from "../../wagmi";
import Title from "../common/Title";
import ApprovalStatus from "./ApprovalStatus";
import TransactionHashInput from "./TransactionHashInput";

const ApproveTransactionHash: React.FC = () => {
  const { safeAccount, safeStorage } = useSafeWalletContext();
  const { address } = useAccount();
  const [safeTransactionHash, setSafeTransactionHash] = useState<string>("");
  const [isHashValid, setIsHashValid] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [approvals, setApprovals] = useState<Record<string, boolean>>({});
  const [fetchingApprovals, setFetchingApprovals] = useState<boolean>(false);
  const { writeContractAsync } = useWriteContract();

  const handleApproveTransactionHash = async () => {
    if (!isHashValid || !safeAccount || !safeTransactionHash) {
      setError("Invalid transaction hash or missing safe account.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { request } = await simulateContract(config, {
        abi: safe,
        address: safeAccount,
        functionName: "approveHash",
        args: [safeTransactionHash],
      });

      const hash = await writeContractAsync(request);
      setTransactionHash(hash);
    } catch (err) {
      console.error(err);
      if (err instanceof BaseError) {
        const revertError = err.walk((err) => err instanceof ContractFunctionRevertedError);
        if (revertError instanceof ContractFunctionRevertedError) {
          const errorName = revertError.data?.errorName ?? "";
          setError(`${errorName} ${revertError.reason}`);
        }
      } else {
        setError("Transaction failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const checkApprovals = useCallback(async () => {
    if (!isHashValid || !safeAccount || !safeTransactionHash || !safeStorage?.owners) return;

    setFetchingApprovals(true);
    try {
      const approvalsStatus = await fetchApprovals(safeStorage.owners, safeTransactionHash, safeAccount);
      setApprovals(approvalsStatus);
    } catch (err) {
      console.error("Error fetching approvals:", err);
    } finally {
      setFetchingApprovals(false);
    }
  }, [isHashValid, safeAccount, safeTransactionHash, safeStorage?.owners]);

  useEffect(() => {
    if (safeTransactionHash) {
      const valid = /^0x[a-fA-F0-9]{64}$/.test(safeTransactionHash);
      setIsHashValid(valid);
      if (valid) {
        checkApprovals();
      }
    }
  }, [safeTransactionHash, checkApprovals]);

  return (
    <Box>
      <Title text="Approve Transaction Hash" />
      <Grid container>
        <Grid size={12}>
          <TransactionHashInput
            safeTransactionHash={safeTransactionHash}
            setSafeTransactionHash={setSafeTransactionHash}
            isHashValid={isHashValid}
          />
        </Grid>
        <Grid size={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleApproveTransactionHash}
            disabled={!safeTransactionHash || loading || approvals[address || ""]}
            sx={{ marginTop: 2 }}
          >
            Approve
          </Button>
        </Grid>
        <Grid size={12}>
          {transactionHash && (
            <Alert severity="success" sx={{ marginTop: 2 }}>
              Transaction approved successfully. Hash: {transactionHash}
            </Alert>
          )}
        </Grid>
        <Grid size={12}>
          <ApprovalStatus
            safeTransactionHash={safeTransactionHash}
            isHashValid={isHashValid}
            fetchingApprovals={fetchingApprovals}
            approvals={approvals}
            owners={safeStorage?.owners || []}
            onRefresh={checkApprovals} // Pass the refresh function here
          />
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ marginTop: 2 }}>
          {error}
        </Alert>
      )}

      <Dialog open={loading}>
        <DialogTitle>Processing</DialogTitle>
        <DialogContent sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ApproveTransactionHash;
