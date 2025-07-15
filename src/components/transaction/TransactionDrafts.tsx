import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { format, formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteDraftTransaction, getDraftTransactions } from "../../api/api";
import { useSafeWalletContext } from "../../context/WalletContext";
import type { SafeTransactionDraft } from "../../context/types";

const TransactionDrafts: React.FC = () => {
  const { storage, safeAccount } = useSafeWalletContext();
  const navigate = useNavigate();

  const [drafts, setDrafts] = useState<SafeTransactionDraft[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const loadDrafts = async () => {
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
    };

    loadDrafts();
  }, [storage]);

  const handleDeleteDraft = async (draftId: string) => {
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

  const handleEditDraft = (draftId: string) => {
    localStorage.setItem("openDraftId", draftId);
    navigate("/create-transaction");
  };

  const handleCreateNew = () => {
    navigate("/create-transaction");
  };

  if (loading) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Transaction Drafts
        </Typography>
        <Grid container spacing={2}>
          {[1, 2].map((item) => (
            <Grid key={item} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={30} />
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="text" width="80%" />
                </CardContent>
                <CardActions>
                  <Skeleton variant="rectangular" width={120} height={36} />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (drafts.length === 0) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Transaction Drafts
        </Typography>
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            You don't have any saved transaction drafts
          </Typography>
          <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={handleCreateNew} sx={{ mt: 2 }}>
            Create Transaction
          </Button>
        </Card>
      </Box>
    );
  }

  // Group drafts by Safe Account
  const draftsByAccount: Record<string, SafeTransactionDraft[]> = {};

  for (const draft of drafts) {
    if (!draftsByAccount[draft.safeAccount]) {
      draftsByAccount[draft.safeAccount] = [];
    }
    draftsByAccount[draft.safeAccount].push(draft);
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">Transaction Drafts</Typography>
        <Button variant="outlined" startIcon={<AddCircleOutlineIcon />} onClick={handleCreateNew}>
          New Transaction
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(undefined)}>
          {error}
        </Alert>
      )}

      {/* Current Safe's drafts first */}
      {safeAccount && draftsByAccount[safeAccount] && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Current Safe
          </Typography>
          <Grid container spacing={2}>
            {draftsByAccount[safeAccount].map((draft) => (
              <Grid key={draft.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <DraftCard draft={draft} onDelete={handleDeleteDraft} onEdit={handleEditDraft} isCurrentSafe />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Other Safes */}
      {Object.keys(draftsByAccount)
        .filter((account) => account !== safeAccount)
        .map((account) => (
          <Box key={account} sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              Safe {account.substring(0, 6)}...{account.substring(38)}
            </Typography>
            <Grid container spacing={2}>
              {draftsByAccount[account].map((draft) => (
                <Grid key={draft.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <DraftCard
                    draft={draft}
                    onDelete={handleDeleteDraft}
                    onEdit={handleEditDraft}
                    isCurrentSafe={false}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
    </Box>
  );
};

interface DraftCardProps {
  draft: SafeTransactionDraft;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  isCurrentSafe: boolean;
}

const DraftCard: React.FC<DraftCardProps> = ({ draft, onDelete, onEdit, isCurrentSafe }) => {
  // Safely parse date with error handling
  const getFormattedDates = () => {
    try {
      const date = new Date(draft.updatedAt);

      // Check if date is valid before formatting
      if (Number.isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }

      return {
        relative: formatDistanceToNow(date, { addSuffix: true }),
        exact: format(date, "PPP p"),
      };
    } catch (error) {
      return {
        relative: "Unknown date",
        exact: "Date information unavailable",
      };
    }
  };

  const { relative: formattedDate, exact: exactDate } = getFormattedDates();

  return (
    <Card
      variant="outlined"
      sx={{
        transition: "transform 0.2s",
        "&:hover": {
          transform: isCurrentSafe ? "translateY(-4px)" : "none",
          boxShadow: isCurrentSafe ? (theme) => theme.shadows[3] : "none",
        },
        opacity: isCurrentSafe ? 1 : 0.7,
      }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {draft.name}
        </Typography>

        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <Chip size="small" label={`${draft.transactions.length} TX`} color="primary" />
          <Chip size="small" label={draft.chainId ? `Chain ${draft.chainId}` : "Unknown Chain"} variant="outlined" />
        </Box>

        <Tooltip title={exactDate} arrow>
          <Typography variant="body2" color="text.secondary">
            Last updated: {formattedDate}
          </Typography>
        </Tooltip>
      </CardContent>

      <Divider />

      <CardActions>
        <Button startIcon={<EditIcon />} onClick={() => onEdit(draft.id)} disabled={!isCurrentSafe}>
          Edit
        </Button>
        <Button startIcon={<DeleteIcon />} color="error" onClick={() => onDelete(draft.id)} sx={{ ml: "auto" }}>
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};

export default TransactionDrafts;
