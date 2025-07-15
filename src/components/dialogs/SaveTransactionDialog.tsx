import SaveIcon from "@mui/icons-material/Save";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { saveDraftTransaction } from "../../api/api";
import type { Transaction } from "../../context/types";

interface SaveTransactionDialogProps {
  open: boolean;
  onClose: () => void;
  transactions: Transaction[];
  safeAccount: `0x${string}` | undefined;
  chainId: number | undefined;
  storage: any;
  onSaved: (draftId: string) => void;
}

const SaveTransactionDialog: React.FC<SaveTransactionDialogProps> = ({
  open,
  onClose,
  transactions,
  safeAccount,
  chainId,
  storage,
  onSaved,
}) => {
  const [name, setName] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();

  const handleClose = () => {
    setName("");
    setError(undefined);
    onClose();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Please enter a name for this draft");
      return;
    }

    if (!safeAccount) {
      setError("No Safe account selected");
      return;
    }

    if (transactions.length === 0) {
      setError("No transactions to save");
      return;
    }

    setIsSaving(true);
    try {
      const draftId = await saveDraftTransaction(storage, safeAccount, chainId, name.trim(), transactions);
      onSaved(draftId);
      handleClose();
    } catch (err) {
      console.error("Failed to save transaction draft:", err);
      setError("Failed to save transaction draft");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Save Transaction Draft</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Save your transaction for later. You can continue editing or execute it when you return.
        </Typography>

        <TextField
          autoFocus
          label="Draft Name"
          placeholder="My Transaction Draft"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={!!error}
          helperText={error}
          sx={{ mb: 2 }}
        />

        <Typography variant="body2" color="text.secondary">
          This draft will save {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
          for Safe account {safeAccount ? `${safeAccount.slice(0, 6)}...${safeAccount.slice(-4)}` : "–"}.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" startIcon={<SaveIcon />} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Draft"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SaveTransactionDialog;
