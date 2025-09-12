import AddIcon from "@mui/icons-material/Add";
import ContactsIcon from "@mui/icons-material/Contacts";
import DeleteIcon from "@mui/icons-material/Delete";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  IconButton,
  Paper,
  Snackbar,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { getChains } from "@wagmi/core";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Address } from "viem";
import { formatUnits } from "viem";
import { useAccount, useBalance } from "wagmi";
import { STORAGE_KEY } from "../constants";
import { type AddressBookEntry, useAddressBook } from "../context/AddressBookContext";
import { useSafeWalletContext } from "../context/WalletContext";
import type { SafeAccount } from "../context/types";
import { config } from "../wagmi";
import AccountAddress from "./common/AccountAddress";

const ExistingSafeAccounts: React.FC = () => {
  const [safeAccounts, setSafeAccounts] = useState<SafeAccount[]>([]);
  const { setSafeAccount, storage } = useSafeWalletContext();
  const { importEntries } = useAddressBook();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [copySnackbar, setCopySnackbar] = useState({ open: false, message: "" });
  const [importAlert, setImportAlert] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const storageAccounts = (await storage.getItem(STORAGE_KEY.SAFE_ACCOUNTS)) as SafeAccount[];
      setSafeAccounts(storageAccounts || []);
    })();
  }, [storage]);

  const handleDelete = async (addressToDelete: Address) => {
    const updatedAccounts = safeAccounts.filter((account: SafeAccount) => account.address !== addressToDelete);
    setSafeAccounts(updatedAccounts);
    await storage.setItem(STORAGE_KEY.SAFE_ACCOUNTS, updatedAccounts);
  };

  const handleAddressClick = async (address: Address) => {
    setSafeAccount(address);
    await storage.setItem(STORAGE_KEY.LAST_SELECTED_SAFE_ACCOUNT, address);
    navigate("/safe-info");
  };

  const handleSettingsClick = async (address: Address) => {
    setSafeAccount(address);
    await storage.setItem(STORAGE_KEY.LAST_SELECTED_SAFE_ACCOUNT, address);
    navigate("/settings");
  };

  const handleCreateSafe = () => {
    navigate("/create");
  };

  const handleImportSafe = () => {
    navigate("/import");
  };

  const handleCopyToClipboard = (address: Address) => {
    navigator.clipboard.writeText(address);
    setCopySnackbar({ open: true, message: "Address copied to clipboard!" });
  };

  const handleCloseSnackbar = () => {
    setCopySnackbar({ ...copySnackbar, open: false });
  };

  const handleImportCSV = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length === 0) {
        setImportAlert({ open: true, message: "CSV file is empty", severity: "error" });
        return;
      }

      const entries: AddressBookEntry[] = [];
      const headers = lines[0]
        .toLowerCase()
        .split(",")
        .map((h) => h.trim());

      // Validate headers
      const requiredHeaders = ["address", "name", "chainid"];
      const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));
      if (missingHeaders.length > 0) {
        setImportAlert({
          open: true,
          message: `CSV must include headers: ${requiredHeaders.join(", ")}`,
          severity: "error",
        });
        return;
      }

      const addressIndex = headers.indexOf("address");
      const nameIndex = headers.indexOf("name");
      const chainIdIndex = headers.indexOf("chainid");

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        if (values.length < 3) continue;

        const address = values[addressIndex];
        const name = values[nameIndex];
        const chainId = Number.parseInt(values[chainIdIndex]);

        if (address && name && !Number.isNaN(chainId)) {
          entries.push({ address: address as Address, name, chainId });
        }
      }

      if (entries.length > 0) {
        await importEntries(entries);
        setImportAlert({
          open: true,
          message: `Successfully imported ${entries.length} address${entries.length !== 1 ? "es" : ""}`,
          severity: "success",
        });
      } else {
        setImportAlert({ open: true, message: "No valid entries found in CSV", severity: "error" });
      }
    } catch (error) {
      console.error("Error importing CSV:", error);
      setImportAlert({ open: true, message: "Error reading CSV file", severity: "error" });
    }

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCloseImportAlert = () => {
    setImportAlert({ ...importAlert, open: false });
  };

  const calculateListHeight = () => {
    // Calculate a reasonable height for the list that leaves room for the header and buttons
    return "calc(100vh - 240px)";
  };

  return (
    <Container maxWidth="lg" sx={{ pb: 8, pt: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Safe Accounts
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {safeAccounts.length} {safeAccounts.length === 1 ? "Account" : "Accounts"}
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          height: calculateListHeight(),
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          mb: 3,
        }}
      >
        {safeAccounts.length > 0 ? (
          <Box sx={{ overflow: "auto", flex: 1, p: 1 }}>
            {safeAccounts.map((safeAccount) => (
              <AccountCard
                key={safeAccount.address}
                safeAccount={safeAccount}
                onAddressClick={handleAddressClick}
                onSettingsClick={handleSettingsClick}
                onDeleteClick={handleDelete}
                onCopyClick={handleCopyToClipboard}
              />
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              p: 4,
              textAlign: "center",
            }}
          >
            <Typography variant="h6" gutterBottom>
              No Safe Accounts
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mb: 2 }}>
              You don't have any Safe accounts yet. Create a new Safe account or import an existing one to get started.
            </Typography>
            <Box sx={{ "& > img": { maxHeight: 120, opacity: 0.7, mb: 2 } }}>
              <img
                src="/empty-state-illustration.svg"
                alt="No accounts"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </Box>
          </Box>
        )}
      </Paper>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: isMobile ? "center" : "flex-start",
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateSafe} fullWidth={isMobile}>
          Create New Safe
        </Button>
        <Button variant="outlined" startIcon={<FileUploadIcon />} onClick={handleImportSafe} fullWidth={isMobile}>
          Import Safe
        </Button>
        <Button variant="outlined" startIcon={<ContactsIcon />} onClick={handleImportCSV} fullWidth={isMobile}>
          Import Address Book
        </Button>
        <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} style={{ display: "none" }} />
      </Box>

      <Snackbar
        open={copySnackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={copySnackbar.message}
      />

      <Snackbar
        open={importAlert.open}
        autoHideDuration={6000}
        onClose={handleCloseImportAlert}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseImportAlert} severity={importAlert.severity} sx={{ width: "100%" }}>
          {importAlert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

const AccountCard: React.FC<{
  safeAccount: SafeAccount;
  onAddressClick: (address: Address) => void;
  onSettingsClick: (address: Address) => void;
  onDeleteClick: (address: Address) => void;
  onCopyClick: (address: Address) => void;
}> = ({ safeAccount, onAddressClick, onSettingsClick, onDeleteClick }) => {
  const theme = useTheme();
  const chains = getChains(config);

  const address = safeAccount.address;
  const { data: balance } = useBalance({ address });
  const { chainId } = useAccount();

  const isDisabled = !chainId || !safeAccount.chainIds.includes(chainId);

  const chainName = safeAccount.chainIds
    .map((id) => chains.find((chain) => chain.id === id)?.name || `Chain #${id}`)
    .join(", ");

  return (
    <Card
      variant="outlined"
      sx={{
        mb: 2,
        opacity: isDisabled ? 0.6 : 1,
        pointerEvents: isDisabled ? "none" : "auto",
        transition: "transform 0.2s, box-shadow 0.2s",
        cursor: isDisabled ? "not-allowed" : "pointer",
        "&:hover": {
          boxShadow: isDisabled ? "none" : theme.shadows[3],
        },
      }}
      onClick={() => !isDisabled && onAddressClick(address)}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Grid container spacing={2}>
          {/* Left section with account info */}
          <Grid size={{ xs: 12, sm: 8 }}>
            <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
              {/* Account name and network */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                <Typography variant="h6" component="div" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                  {safeAccount.name || "Unnamed Safe"}
                </Typography>
                <Chip
                  size="small"
                  label={chainName}
                  sx={{
                    fontSize: "0.75rem",
                    height: 22,
                    backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                  }}
                />
              </Box>

              {/* Account address with copy button */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 1,
                }}
                onClick={(e) => e.stopPropagation()} // Prevent card click when clicking address
              >
                <AccountAddress address={address} />
              </Box>

              {/* Balance */}
              <Typography variant="body2" color="text.secondary">
                {formatUnits(balance?.value || 0n, 18)} {balance?.symbol}
              </Typography>
            </Box>
          </Grid>

          {/* Right section with tags and actions */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
              {/* Tags */}
              <Box sx={{ mb: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {safeAccount.labels?.map((label) => (
                  <Chip key={label} label={label} size="small" sx={{ fontSize: "0.75rem", height: 24 }} />
                ))}
              </Box>

              {/* Action buttons */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  mt: "auto",
                  pt: 1,
                }}
                onClick={(e) => e.stopPropagation()} // Prevent card click when clicking buttons
              >
                <Tooltip title="Settings">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSettingsClick(address);
                    }}
                  >
                    <SettingsIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteClick(address);
                    }}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ExistingSafeAccounts;
