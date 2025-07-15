import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import type React from "react";
import type { SafeTransactionParams } from "../../utils/utils";
import SafeTransactionForm from "../common/SafeTransactionForm";

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
        {safeTransaction ? (
          <>
            <SafeTransactionForm transaction={safeTransaction} readOnly />
            <Typography variant="body2" sx={{ marginTop: 2 }}>
              Safe Transaction Hash: {safeTransactionHash}
            </Typography>
          </>
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
