import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { deleteDraftTransaction, getDraftTransactions } from "../../api/api";
import type { SafeTransactionDraft } from "../../context/types";

interface LoadTransactionDialogProps {
  open: boolean;
  onClose: () => void;
  onLoad: (draft: SafeTransactionDraft) => void;
  storage: Storage;
  currentSafeAccount: `0x${string}` | undefined;
}

const LoadTransactionDialog: React.FC<LoadTransactionDialogProps> = ({
  open,
  onClose,
  onLoad,
  storage,
  currentSafeAccount,
}) => {
  const [drafts, setDrafts] = useState<SafeTransactionDraft[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    // Load drafts when the dialog opens
    (async () => {
      if (open) {
        setLoading(true);
        try {
          const savedDrafts = await getDraftTransactions(storage);
          setDrafts(savedDrafts);
        } catch (err) {
          console.error("Failed to load transaction drafts:", err);
          setError("Failed to load saved drafts");
        } finally {
          setLoading(false);
        }
      }
    })();
  }, [open, storage]);

  const handleDeleteDraft = async (draftId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    try {
      const success = await deleteDraftTransaction(storage, draftId);
      if (success) {
        setDrafts(drafts.filter((draft) => draft.id !== draftId));
      } else {
        setError("Failed to delete draft");
      }
    } catch (err) {
      console.error("Error deleting draft:", err);
      setError("Failed to delete draft");
    }
  };

  const handleLoadDraft = (draft: SafeTransactionDraft) => {
    onLoad(draft);
    onClose();
  };

  const currentSafeDrafts = drafts.filter((draft) => draft.safeAccount === currentSafeAccount);

  const otherSafeDrafts = drafts.filter((draft) => draft.safeAccount !== currentSafeAccount);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Load Saved Transaction</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : drafts.length === 0 ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography variant="body1" color="text.secondary">
              No saved transaction drafts found
            </Typography>
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(undefined)}>
                {error}
              </Alert>
            )}

            {currentSafeDrafts.length > 0 && (
              <>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 1 }}>
                  Current Safe
                </Typography>
                <List sx={{ mb: 2 }}>
                  {currentSafeDrafts.map((draft) => (
                    <TransactionDraftItem
                      key={draft.id}
                      draft={draft}
                      onLoad={handleLoadDraft}
                      onDelete={handleDeleteDraft}
                      isSameSafe={true}
                    />
                  ))}
                </List>
              </>
            )}

            {otherSafeDrafts.length > 0 && (
              <>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Other Safes
                </Typography>
                <List>
                  {otherSafeDrafts.map((draft) => (
                    <TransactionDraftItem
                      key={draft.id}
                      draft={draft}
                      onLoad={handleLoadDraft}
                      onDelete={handleDeleteDraft}
                      isSameSafe={false}
                    />
                  ))}
                </List>
              </>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

interface TransactionDraftItemProps {
  draft: SafeTransactionDraft;
  onLoad: (draft: SafeTransactionDraft) => void;
  onDelete: (draftId: string, event: React.MouseEvent) => void;
  isSameSafe: boolean;
}

const TransactionDraftItem: React.FC<TransactionDraftItemProps> = ({ draft, onLoad, onDelete, isSameSafe }) => {
  // Safely parse the date with error handling
  const getFormattedDate = () => {
    try {
      const date = new Date(draft.updatedAt);

      // Check if date is valid before formatting
      if (Number.isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }

      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Unknown date";
    }
  };

  const formattedDate = getFormattedDate();

  return (
    <ListItem disablePadding divider>
      <ListItemButton onClick={() => onLoad(draft)} disabled={!isSameSafe} sx={{ py: 2 }}>
        <ListItemText
          primary={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body1" fontWeight={500}>
                {draft.name}
              </Typography>
              <Chip size="small" label={`${draft.transactions.length} TX`} color="primary" variant="outlined" />
            </Box>
          }
          secondary={
            <>
              <Typography variant="body2" color="text.secondary" sx={{ display: "block" }}>
                {draft.safeAccount.substring(0, 6)}...
                {draft.safeAccount.substring(38)}
                {draft.chainId && ` (Chain ID: ${draft.chainId})`}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Last modified: {formattedDate}
              </Typography>
            </>
          }
        />

        <ListItemSecondaryAction>
          {!isSameSafe && (
            <Tooltip title="This draft is for a different Safe account">
              <InfoOutlinedIcon color="warning" fontSize="small" sx={{ mr: 1 }} />
            </Tooltip>
          )}
          <Tooltip title="Load and edit">
            <IconButton
              edge="end"
              onClick={(e) => {
                e.stopPropagation();
                onLoad(draft);
              }}
              disabled={!isSameSafe}
              sx={{ mr: 1 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete draft">
            <IconButton edge="end" onClick={(e) => onDelete(draft.id, e)} color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </ListItemSecondaryAction>
      </ListItemButton>
    </ListItem>
  );
};

export default LoadTransactionDialog;
