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
  Typography,
  useTheme,
} from "@mui/material";
import type React from "react";
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

  const handleCopyToClipboard = () => {
    const transactionDetails = {
      to: safeTransaction?.to,
      value: safeTransaction?.value.toString(),
      data: safeTransaction?.data,
      operation: safeTransaction?.operation.toString(),
      safeTxGas: safeTransaction?.safeTxGas.toString(),
      baseGas: safeTransaction?.baseGas.toString(),
      gasPrice: safeTransaction?.gasPrice.toString(),
      gasToken: safeTransaction?.gasToken,
      refundReceiver: safeTransaction?.refundReceiver,
      nonce: safeTransaction?.nonce.toString(),
      safeTransactionHash: safeTransactionHash,
    };
    navigator.clipboard.writeText(JSON.stringify(transactionDetails, null, 2));
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
          onClick={handleCopyToClipboard}
          startIcon={<ContentCopyIcon />}
          variant="contained"
        >
          Copy to clipboard
        </Button>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewSafeTransactionDialog;
