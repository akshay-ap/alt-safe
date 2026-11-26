import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Snackbar,
  Typography,
  useTheme,
} from "@mui/material";
import type React from "react";
import { useState } from "react";
import { COPY_FAILED, copyText } from "../../utils/clipboard";
import { safeTransactionToJson } from "../../utils/safeTransaction";
import type { SafeTransactionParams } from "../../utils/utils";
import SafeTransactionForm from "../common/SafeTransactionForm";
import TransactionHash from "../common/TransactionHash";

interface ViewSafeTransactionDialogProps {
  open: boolean;
  onClose: () => void;
  safeTransaction: SafeTransactionParams | undefined;
  safeTransactionHash: `0x${string}` | undefined;
}

const ViewSafeTransactionDialog: React.FC<ViewSafeTransactionDialogProps> = ({
  open,
  onClose,
  safeTransaction,
  safeTransactionHash,
}) => {
  const theme = useTheme();

  const [copyMessage, setCopyMessage] = useState<string>();

  const handleCopyJson = async () => {
    if (!safeTransaction || !safeTransactionHash) return;
    const ok = await copyText(safeTransactionToJson(safeTransaction, safeTransactionHash));
    setCopyMessage(ok ? "Transaction JSON copied" : COPY_FAILED);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Safe Transaction Details</DialogTitle>
      <DialogContent>
        {/* Highlighted Transaction Hash Section */}
        <Paper
          elevation={2}
          sx={{
            mt: 2,
            mb: 3,
            p: 3,
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              color: theme.palette.primary.main,
              fontWeight: 600,
            }}
          >
            Safe Transaction Hash
          </Typography>
          <Box
            sx={{
              p: 2,
              backgroundColor: theme.palette.background.default,
              borderRadius: 1,
              border: `1px solid ${theme.palette.primary.main}33`,
            }}
          >
            <TransactionHash hash={safeTransactionHash} />
          </Box>
        </Paper>

        <Divider sx={{ my: 2, borderColor: theme.palette.divider }} />

        {safeTransaction ? (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>
              Transaction Details
            </Typography>
            <SafeTransactionForm transaction={safeTransaction} readOnly />
          </Box>
        ) : (
          <Typography>No transaction details available</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          disabled={!safeTransaction || !safeTransactionHash}
          onClick={handleCopyJson}
          startIcon={<ContentCopyIcon />}
          variant="contained"
        >
          Copy JSON
        </Button>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
      <Snackbar
        open={Boolean(copyMessage)}
        autoHideDuration={3000}
        onClose={() => setCopyMessage(undefined)}
        message={copyMessage}
      />
    </Dialog>
  );
};

export default ViewSafeTransactionDialog;
