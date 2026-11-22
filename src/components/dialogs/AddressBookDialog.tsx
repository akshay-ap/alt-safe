import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  OutlinedInput,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import type React from "react";
import { useState } from "react";
import type { Address } from "viem";
import { isAddress } from "viem";
import { useAccount } from "wagmi";
import { type AddressBookEntry, useAddressBook } from "../../context/AddressBookContext";
import { ALL_CHAINS, chainLabel } from "../../utils/addressBookChain";
import AccountAddress from "../common/AccountAddress";

const ChainField: React.FC<{
  id: string;
  chainId: number;
  fallbackChainId: number;
  onChange: (id: number) => void;
}> = ({ id, chainId, fallbackChainId, onChange }) => {
  const allChains = chainId === ALL_CHAINS;
  return (
    <>
      <FormControl fullWidth disabled={allChains}>
        <InputLabel htmlFor={id}>Chain ID</InputLabel>
        <OutlinedInput
          id={id}
          type="number"
          value={allChains ? "" : chainId}
          onChange={(e) => onChange(Number(e.target.value) || 1)}
          label="Chain ID"
          placeholder="1"
        />
      </FormControl>
      <FormControlLabel
        control={
          <Checkbox
            size="small"
            checked={allChains}
            onChange={(e) => onChange(e.target.checked ? ALL_CHAINS : fallbackChainId)}
          />
        }
        label="All chains"
      />
      {allChains && (
        <FormHelperText>Only for wallets you control directly (EOAs), not Safes or contracts.</FormHelperText>
      )}
    </>
  );
};

interface AddressBookDialogProps {
  open: boolean;
  onClose: () => void;
}

const AddressBookDialog: React.FC<AddressBookDialogProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const account = useAccount();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const { addressBook, addEntry, updateEntry, removeEntry } = useAddressBook();

  const [isAdding, setIsAdding] = useState(false);
  const [editingEntry, setEditingEntry] = useState<AddressBookEntry | null>(null);
  // The entry's chain before editing, since the form can change it.
  const [editingChainId, setEditingChainId] = useState(0);
  const [newEntry, setNewEntry] = useState({
    address: "",
    name: "",
    chainId: account.chainId || 1,
  });
  const [error, setError] = useState("");

  const handleAddEntry = async () => {
    if (!newEntry.address || !newEntry.name) {
      setError("Address and name are required");
      return;
    }

    if (!isAddress(newEntry.address)) {
      setError("Invalid address format");
      return;
    }

    try {
      await addEntry({
        address: newEntry.address as Address,
        name: newEntry.name,
        chainId: newEntry.chainId,
      });
      setNewEntry({ address: "", name: "", chainId: account.chainId || 1 });
      setIsAdding(false);
      setError("");
    } catch (err) {
      setError("Failed to add entry");
    }
  };

  const handleEditEntry = async () => {
    if (!editingEntry || !editingEntry.name) {
      setError("Name is required");
      return;
    }

    try {
      await updateEntry(editingEntry.address, editingChainId, {
        name: editingEntry.name,
        chainId: editingEntry.chainId,
      });
      setEditingEntry(null);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update entry");
    }
  };

  const handleDeleteEntry = async (address: Address, chainId: number) => {
    try {
      await removeEntry(address, chainId);
    } catch (err) {
      setError("Failed to delete entry");
    }
  };

  const handleExportCSV = () => {
    if (addressBook.length === 0) {
      setError("No entries to export");
      return;
    }

    const csvContent = [
      "address,name,Chainid",
      ...addressBook.map((entry) => `${entry.address},${entry.name},${entry.chainId}`),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `address-book-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingEntry(null);
    setNewEntry({ address: "", name: "", chainId: account.chainId || 1 });
    setError("");
  };

  return (
    <Dialog
      fullScreen={isSmallScreen}
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          style: {
            width: isSmallScreen ? "100vw" : "60vw",
            minHeight: isSmallScreen ? "100vh" : "60vh",
            maxWidth: "none",
          },
        },
      }}
    >
      <DialogTitle>Manage Address Book</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {error && (
            <Grid size={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}

          {/* Add new entry form */}
          {isAdding && (
            <>
              <Grid size={12}>
                <Typography variant="subtitle1">Add New Entry</Typography>
              </Grid>
              <Grid size={12}>
                <FormControl fullWidth>
                  <InputLabel htmlFor="new-address">Address</InputLabel>
                  <OutlinedInput
                    id="new-address"
                    value={newEntry.address}
                    onChange={(e) => setNewEntry((prev) => ({ ...prev, address: e.target.value }))}
                    label="Address"
                    placeholder="0x..."
                  />
                </FormControl>
              </Grid>
              <Grid size={8}>
                <FormControl fullWidth>
                  <InputLabel htmlFor="new-name">Name</InputLabel>
                  <OutlinedInput
                    id="new-name"
                    value={newEntry.name}
                    onChange={(e) => setNewEntry((prev) => ({ ...prev, name: e.target.value }))}
                    label="Name"
                    placeholder="Enter a name"
                  />
                </FormControl>
              </Grid>
              <Grid size={4}>
                <ChainField
                  id="new-chainid"
                  chainId={newEntry.chainId}
                  fallbackChainId={account.chainId || 1}
                  onChange={(chainId) => setNewEntry((prev) => ({ ...prev, chainId }))}
                />
              </Grid>
              <Grid size={12}>
                <Button variant="contained" onClick={handleAddEntry} sx={{ mr: 1 }}>
                  Add Entry
                </Button>
                <Button variant="outlined" onClick={handleCancel}>
                  Cancel
                </Button>
              </Grid>
              <Grid size={12}>
                <Divider />
              </Grid>
            </>
          )}

          {/* Edit entry form */}
          {editingEntry && (
            <>
              <Grid size={12}>
                <Typography variant="subtitle1">Edit Entry</Typography>
              </Grid>
              <Grid size={12}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                  }}
                >
                  <AccountAddress address={editingEntry.address} size="small" />
                </Typography>
              </Grid>
              <Grid size={8}>
                <FormControl fullWidth>
                  <InputLabel htmlFor="edit-name">Name</InputLabel>
                  <OutlinedInput
                    id="edit-name"
                    value={editingEntry.name}
                    onChange={(e) => setEditingEntry((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                    label="Name"
                  />
                </FormControl>
              </Grid>
              <Grid size={4}>
                <ChainField
                  id="edit-chainid"
                  chainId={editingEntry.chainId}
                  fallbackChainId={editingChainId || account.chainId || 1}
                  onChange={(chainId) => setEditingEntry((prev) => (prev ? { ...prev, chainId } : null))}
                />
              </Grid>
              <Grid size={12}>
                <Button variant="contained" onClick={handleEditEntry} sx={{ mr: 1 }}>
                  Save Changes
                </Button>
                <Button variant="outlined" onClick={handleCancel}>
                  Cancel
                </Button>
              </Grid>
              <Grid size={12}>
                <Divider />
              </Grid>
            </>
          )}

          {/* Add button */}
          {!isAdding && !editingEntry && (
            <>
              <Grid size={8}>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsAdding(true)} fullWidth>
                  Add New Address
                </Button>
              </Grid>
              <Grid size={4}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportCSV}
                  fullWidth
                  disabled={addressBook.length === 0}
                >
                  Export CSV
                </Button>
              </Grid>
            </>
          )}

          {/* Address list */}
          <Grid size={12}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              All Saved Addresses ({addressBook.length})
            </Typography>
            {addressBook.length === 0 ? (
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                }}
              >
                No addresses saved
              </Typography>
            ) : (
              <List>
                {addressBook.map((entry) => (
                  <ListItem
                    key={`${entry.address}-${entry.chainId}`}
                    secondaryAction={
                      <div>
                        <IconButton
                          edge="end"
                          aria-label="edit"
                          onClick={() => {
                            setEditingEntry(entry);
                            setEditingChainId(entry.chainId);
                          }}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteEntry(entry.address, entry.chainId)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </div>
                    }
                  >
                    <ListItemText
                      primary={entry.name}
                      secondary={
                        <>
                          <AccountAddress address={entry.address} size="small" showCopy={false} /> ·{" "}
                          {chainLabel(entry.chainId)}
                        </>
                      }
                      slotProps={{ secondary: { component: "div" } }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddressBookDialog;
