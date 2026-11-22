import { Alert, Box, Button, CircularProgress, Divider, Paper, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWaitForTransactionReceipt } from "wagmi";
import { useCreateSafeContext } from "../../context/CreateSafeContext";
import { useSafeWalletContext } from "../../context/WalletContext";
import AccountAddress from "../common/AccountAddress";
import TransactionHash from "../common/TransactionHash";
import InitDataDialog from "./InitDataDialog";

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between", py: 0.25 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" sx={{ textAlign: "right", minWidth: 0, overflowWrap: "anywhere" }}>
      {children}
    </Typography>
  </Stack>
);

const Summary: React.FC = () => {
  const { owners, threshold, salt, modules, deploymentOptions, deploymentId, useSingletonL2 } = useCreateSafeContext();
  const version = deploymentOptions.find((option) => option.id === deploymentId)?.label;

  return (
    <Box>
      <Row label="Version">{`${version}${useSingletonL2 ? " (L2)" : ""}`}</Row>
      <Row label="Required signatures">
        {threshold} of {owners.length}
      </Row>
      <Row label="Modules">{modules.length || "None"}</Row>
      <Row label="Salt nonce">{salt.toString()}</Row>
    </Box>
  );
};

const describeReceipt = (isSuccess: boolean, isError: boolean) => {
  if (isError) return { severity: "error" as const, text: "The deployment transaction failed." };
  if (isSuccess) return { severity: "success" as const, text: "Your Safe is deployed." };
  return { severity: "info" as const, text: "Waiting for confirmation…" };
};

const Submitted: React.FC<{ hash: `0x${string}` }> = ({ hash }) => {
  const { proxyAddress } = useCreateSafeContext();
  const { setSafeAccount } = useSafeWalletContext();
  const navigate = useNavigate();
  const { isLoading, isSuccess, isError } = useWaitForTransactionReceipt({ hash });
  const status = describeReceipt(isSuccess, isError);

  return (
    <Stack spacing={1.5}>
      <Alert severity={status.severity} icon={isLoading ? <CircularProgress size={18} /> : undefined}>
        {status.text}
      </Alert>
      <TransactionHash hash={hash} short showExplorer />
      {isSuccess && proxyAddress && (
        <Button
          variant="contained"
          onClick={() => {
            setSafeAccount(proxyAddress);
            navigate("/safe-info");
          }}
        >
          Open Safe
        </Button>
      )}
    </Stack>
  );
};

const SafePreview: React.FC = () => {
  const [initDataOpen, setInitDataOpen] = useState(false);
  const { initData, proxyAddress, isAlreadyDeployed, error, safeCreationTxHash, handleCreateSafe, isCreating } =
    useCreateSafeContext();
  const hasValidInitData = initData !== "0x" && error === undefined;

  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
        Review
      </Typography>
      <Summary />
      <Divider sx={{ my: 1.5 }} />
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        Your Safe will be deployed at
      </Typography>
      {proxyAddress && hasValidInitData ? (
        <AccountAddress address={proxyAddress} />
      ) : (
        <Typography variant="body2" color="warning.main">
          Fix the owners and settings to see the address.
        </Typography>
      )}
      {hasValidInitData && (
        <Button size="small" onClick={() => setInitDataOpen(true)} sx={{ mt: 0.5, ml: -1 }}>
          View setup calldata
        </Button>
      )}

      <Stack spacing={1.5} sx={{ mt: 2 }}>
        {isAlreadyDeployed && !safeCreationTxHash && (
          <Alert severity="warning">
            A Safe with exactly this configuration already exists. Change the salt nonce.
          </Alert>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {safeCreationTxHash ? (
          <Submitted hash={safeCreationTxHash as `0x${string}`} />
        ) : (
          <Button
            variant="contained"
            size="large"
            onClick={handleCreateSafe}
            disabled={!hasValidInitData || !proxyAddress || isAlreadyDeployed || isCreating}
            startIcon={isCreating ? <CircularProgress size={18} color="inherit" /> : undefined}
          >
            {isCreating ? "Confirm in your wallet…" : "Create Safe"}
          </Button>
        )}
      </Stack>

      <InitDataDialog open={initDataOpen} onClose={() => setInitDataOpen(false)} initData={initData} error={error} />
    </Paper>
  );
};

export default SafePreview;
