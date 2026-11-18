import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ShareIcon from "@mui/icons-material/ShareOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useWaitForTransactionReceipt } from "wagmi";
import HexValue from "../../common/HexValue";
import TransactionHash from "../../common/TransactionHash";

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <Box sx={{ display: "grid", gridTemplateColumns: { sm: "180px 1fr" }, gap: { xs: 0.25, sm: 2 }, py: 1 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Box sx={{ minWidth: 0 }}>{children}</Box>
  </Box>
);

type ShareOption = { label: string; value: string; copiedMessage: string };

const ShareMenu: React.FC<{ options: ShareOption[] }> = ({ options }) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [copiedMessage, setCopiedMessage] = useState<string>();

  const share = async (option: ShareOption) => {
    setAnchor(null);
    await navigator.clipboard.writeText(option.value);
    setCopiedMessage(option.copiedMessage);
  };

  return (
    <>
      <Tooltip title="Share with other owners">
        <IconButton onClick={(event) => setAnchor(event.currentTarget)} aria-label="Share" aria-haspopup="menu">
          <ShareIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {options.map((option) => (
          <MenuItem key={option.label} onClick={() => share(option)}>
            {option.label}
          </MenuItem>
        ))}
      </Menu>
      <Snackbar
        open={Boolean(copiedMessage)}
        autoHideDuration={3000}
        onClose={() => setCopiedMessage(undefined)}
        message={copiedMessage}
      />
    </>
  );
};

export const SignedTransactionCard: React.FC<{
  safeTransactionHash?: `0x${string}`;
  signature?: `0x${string}`;
  signedTransactionHex: string;
  onViewDetails: () => void;
}> = ({ safeTransactionHash, signature, signedTransactionHex, onViewDetails }) => (
  <Paper variant="outlined">
    <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
      <Alert severity="success" sx={{ mb: 1.5 }}>
        Signed. Execute it now, or share it with the other owners to add their signatures.
      </Alert>
      <Field label="Safe transaction hash">
        <TransactionHash hash={safeTransactionHash} />
      </Field>
      <Field label="Your signature">{signature && <HexValue value={signature} noun="signature" size="small" />}</Field>
    </Box>
    <Stack
      direction="row"
      spacing={1}
      sx={{ px: 2.5, py: 1.5, borderTop: 1, borderColor: "divider", alignItems: "center" }}
    >
      <Button startIcon={<VisibilityIcon />} onClick={onViewDetails}>
        View all parameters
      </Button>
      <Box sx={{ flex: 1 }} />
      <ShareMenu
        options={[
          { label: "Copy signed transaction", value: signedTransactionHex, copiedMessage: "Signed transaction copied" },
          ...(signature ? [{ label: "Copy signature", value: signature, copiedMessage: "Signature copied" }] : []),
        ]}
      />
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
        The connected wallet is not an owner of this Safe, so it cannot execute. Share the signed transaction with an
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
      This Safe needs {threshold?.toString()} signatures. Share the signed transaction, gather the others, then execute
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
