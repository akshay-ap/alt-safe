import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import type React from "react";
import { useEffect, useState } from "react";
import { isAddressEqual, zeroAddress } from "viem";
import { useAccount } from "wagmi";
import { STORAGE_KEY } from "../constants";
import { useSafeWalletContext } from "../context/WalletContext";
import type { SafeAccount } from "../context/types";
import AccountAddress from "./common/AccountAddress";
import ViewSafeStorage from "./common/SafeStorage";
import Title from "./common/Title";

const Settings: React.FC = () => {
  const { safeStorage, loadStorage, safeAccount, storage } = useSafeWalletContext();
  const { isConnected } = useAccount();
  const [editNameOpen, setEditNameOpen] = useState(false);
  const [editLabelsOpen, setEditLabelsOpen] = useState(false);
  const [safeName, setSafeName] = useState("");
  const [safeLabels, setSafeLabels] = useState<string[]>([]);
  const [newLabel, setNewLabel] = useState("");

  useEffect(() => {
    if (safeAccount && isConnected && !isAddressEqual(safeAccount, zeroAddress)) {
      loadStorage(safeAccount);
      loadSafeInfo();
    }
  }, [isConnected, safeAccount, loadStorage]);

  const loadSafeInfo = async () => {
    if (!safeAccount) return;

    const safeAccounts = (await storage.getItem(STORAGE_KEY.SAFE_ACCOUNTS)) as SafeAccount[];
    if (!safeAccounts) return;

    const account = safeAccounts.find((acc) => acc.address === safeAccount);
    if (account) {
      setSafeName(account.name || "");
      setSafeLabels(account.labels || []);
    }
  };

  const handleSaveNameAndLabels = async (newName?: string, newLabels?: string[]) => {
    if (!safeAccount) return;

    const safeAccounts = (await storage.getItem(STORAGE_KEY.SAFE_ACCOUNTS)) as SafeAccount[];
    if (!safeAccounts) return;

    const updatedAccounts = safeAccounts.map((acc) => {
      if (acc.address === safeAccount) {
        return {
          ...acc,
          name: newName !== undefined ? newName : acc.name,
          labels: newLabels !== undefined ? newLabels : acc.labels,
        };
      }
      return acc;
    });

    await storage.setItem(STORAGE_KEY.SAFE_ACCOUNTS, updatedAccounts);

    if (newName !== undefined) setSafeName(newName);
    if (newLabels !== undefined) setSafeLabels(newLabels);
  };

  const handleAddLabel = () => {
    if (!newLabel.trim() || safeLabels.includes(newLabel.trim())) {
      return;
    }

    const updatedLabels = [...safeLabels, newLabel.trim()];
    setSafeLabels(updatedLabels);
    handleSaveNameAndLabels(undefined, updatedLabels);
    setNewLabel("");
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    const updatedLabels = safeLabels.filter((label) => label !== labelToRemove);
    setSafeLabels(updatedLabels);
    handleSaveNameAndLabels(undefined, updatedLabels);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Title text="Safe Settings" />
      </Box>

      {!safeAccount || isAddressEqual(safeAccount, zeroAddress) ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          Please connect to a Safe Account to view and manage settings.
        </Alert>
      ) : (
        <Box>
          <Grid container spacing={3}>
            {/* Safe Account Info Section */}
            <Grid size={{ xs: 12, md: 12 }}>
              <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">Safe Account</Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Address
                  </Typography>
                  <AccountAddress address={safeAccount} />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Name
                    </Typography>
                    <IconButton size="small" onClick={() => setEditNameOpen(true)} sx={{ p: 0.5 }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography variant="body1">{safeName || "Unnamed Safe"}</Typography>
                </Box>

                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Labels
                    </Typography>
                    <IconButton size="small" onClick={() => setEditLabelsOpen(true)} sx={{ p: 0.5 }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {safeLabels.length > 0 ? (
                      safeLabels.map((label) => <Chip key={label} label={label} size="small" variant="outlined" />)
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No labels
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Safe Storage Section */}
          <Paper elevation={0} variant="outlined" sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Safe Storage
            </Typography>

            <Divider sx={{ mb: 2 }} />

            {safeStorage && <ViewSafeStorage safeStorage={safeStorage} />}
          </Paper>
        </Box>
      )}

      {/* Edit Name Dialog */}
      <Dialog open={editNameOpen} onClose={() => setEditNameOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit Safe Name
          <IconButton
            aria-label="close"
            onClick={() => setEditNameOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Safe Name"
            fullWidth
            variant="outlined"
            value={safeName}
            onChange={(e) => setSafeName(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditNameOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              handleSaveNameAndLabels(safeName);
              setEditNameOpen(false);
            }}
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Labels Dialog */}
      <Dialog open={editLabelsOpen} onClose={() => setEditLabelsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit Safe Labels
          <IconButton
            aria-label="close"
            onClick={() => setEditLabelsOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Labels help you organize and categorize your Safe accounts.
          </Typography>

          <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
            <TextField
              label="Add new label"
              variant="outlined"
              size="small"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              fullWidth
            />
            <Button
              variant="contained"
              onClick={handleAddLabel}
              disabled={!newLabel.trim() || safeLabels.includes(newLabel.trim())}
            >
              Add
            </Button>
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {safeLabels.map((label) => (
              <Chip key={label} label={label} onDelete={() => handleRemoveLabel(label)} sx={{ m: 0.5 }} />
            ))}
            {safeLabels.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                No labels added yet
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditLabelsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
