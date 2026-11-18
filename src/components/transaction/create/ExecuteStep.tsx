import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Alert, Box, Button, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useWaitForTransactionReceipt } from "wagmi";
import { font } from "../../../theme/tokens";
import TransactionHash from "../../common/TransactionHash";

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <Box sx={{ display: "grid", gridTemplateColumns: { sm: "180px 1fr" }, gap: { xs: 0.25, sm: 2 }, py: 1 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Box sx={{ minWidth: 0 }}>{children}</Box>
  </Box>
);

export const SignedTransactionCard: React.FC<{
  safeTransactionHash?: `0x${string}`;
  signature?: `0x${string}`;
  onViewDetails: () => void;
  onCopySigned: () => void;
}> = ({ safeTransactionHash, signature, onViewDetails, onCopySigned }) => (
  <Paper variant="outlined">
    <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
      <Alert severity="success" sx={{ mb: 1.5 }}>
        Signed. Execute it now, or copy it for the other owners to add their signatures.
      </Alert>
      <Field label="Safe transaction hash">
        <TransactionHash hash={safeTransactionHash} />
      </Field>
      <Field label="Your signature">
        <Typography sx={{ fontFamily: font.mono, fontSize: "0.75rem", overflowWrap: "anywhere" }}>
          {signature}
        </Typography>
      </Field>
    </Box>
    <Stack
      direction="row"
      spacing={1}
      sx={{ px: 2.5, py: 1.5, borderTop: 1, borderColor: "divider", flexWrap: "wrap", rowGap: 1 }}
    >
      <Button startIcon={<VisibilityIcon />} onClick={onViewDetails}>
        View all parameters
      </Button>
      <Button startIcon={<ContentCopyIcon />} onClick={onCopySigned}>
        Copy signed transaction
      </Button>
      {signature && (
        <Button startIcon={<ContentCopyIcon />} onClick={() => navigator.clipboard.writeText(signature)}>
          Copy signature only
        </Button>
      )}
    </Stack>
  </Paper>
);

const ExecuteBlocker: React.FC<{ isOwner: boolean; threshold?: bigint }> = ({ isOwner, threshold }) => {
  if (threshold === undefined) {
    return (
      <Typography variant="body2" color="text.secondary">
        Reading the Safe's owners and threshold…
      </Typography>
    );
  }
  if (!isOwner) {
    return (
      <Alert severity="warning">
        The connected wallet is not an owner of this Safe, so it cannot execute. Copy the signed transaction for an
        owner.
      </Alert>
    );
  }
  return (
    <Alert
      severity="info"
      action={
        <Button component={RouterLink} to="/aggregate-signatures" color="inherit" size="small">
          Collect signatures
        </Button>
      }
    >
      This Safe needs {threshold?.toString()} signatures. Copy the signed transaction, gather the others, then execute
      it from Collect signatures.
    </Alert>
  );
};

const ExecutionResult: React.FC<{ hash: `0x${string}` }> = ({ hash }) => {
  const { isLoading, isSuccess, isError } = useWaitForTransactionReceipt({ hash });
  const severity = isError ? "error" : isSuccess ? "success" : "info";
  const message = isError
    ? "The transaction reverted. Nothing in the batch was executed."
    : isSuccess
      ? "Executed. The Safe's nonce has moved on, so this signed transaction cannot be used again."
      : "Submitted. Waiting for it to be included in a block…";

  return (
    <Stack spacing={1.5}>
      <Alert severity={severity} icon={isLoading ? <CircularProgress size={18} /> : undefined}>
        {message}
      </Alert>
      <TransactionHash hash={hash} showExplorer />
      <Stack direction="row" spacing={1}>
        <Button component={RouterLink} to="/safe-info" variant={isSuccess ? "contained" : "outlined"}>
          Back to overview
        </Button>
        <Button component={RouterLink} to="/history">
          View history
        </Button>
      </Stack>
    </Stack>
  );
};

export const ExecuteCard: React.FC<{
  isOwner: boolean;
  threshold?: bigint;
  executionHash?: `0x${string}`;
  onExecute: () => void;
}> = ({ isOwner, threshold, executionHash, onExecute }) => {
  if (executionHash) {
    return (
      <Paper variant="outlined" sx={{ p: 2.5 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Execute
        </Typography>
        <ExecutionResult hash={executionHash} />
      </Paper>
    );
  }

  // One signature only satisfies a 1-of-N Safe; anything more reverts on chain (GS020).
  const canExecute = isOwner && threshold === 1n;

  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Execute
      </Typography>
      {canExecute ? (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}
        >
          <Typography variant="body2" color="text.secondary">
            Submits the transaction from your wallet. You pay the gas; the Safe's actions run in this one transaction.
          </Typography>
          <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={onExecute} sx={{ flexShrink: 0 }}>
            Execute
          </Button>
        </Stack>
      ) : (
        <ExecuteBlocker isOwner={isOwner} threshold={threshold} />
      )}
    </Paper>
  );
};
