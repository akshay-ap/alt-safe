import AddIcon from "@mui/icons-material/Add";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Paper,
  Snackbar,
  Typography,
} from "@mui/material";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type Address, isAddressEqual } from "viem";
import { useChainId } from "wagmi";
import { STORAGE_KEY } from "../constants";
import { useAddressBook } from "../context/AddressBookContext";
import type { SafeAccount } from "../context/types";
import { useSafeWalletContext } from "../context/WalletContext";
import { parseAddressBookCsv } from "../utils/addressBookCsv";
import PageHeader from "./common/PageHeader";
import SafeRow from "./home/SafeRow";

type Notice = { severity: "success" | "error"; message: string };

const useSavedSafes = () => {
  const { storage } = useSafeWalletContext();
  const [safes, setSafes] = useState<SafeAccount[]>([]);

  useEffect(() => {
    (async () => setSafes(((await storage.getItem(STORAGE_KEY.SAFE_ACCOUNTS)) as SafeAccount[] | null) ?? []))();
  }, [storage]);

  const remove = async (address: Address) => {
    const remaining = safes.filter((safe) => !isAddressEqual(safe.address, address));
    setSafes(remaining);
    await storage.setItem(STORAGE_KEY.SAFE_ACCOUNTS, remaining);
  };

  return { safes, remove };
};

const StartOption: React.FC<{ title: string; description: string; onClick: () => void }> = ({
  title,
  description,
  onClick,
}) => (
  <Card sx={{ height: "100%" }}>
    <CardActionArea onClick={onClick} sx={{ height: "100%", p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardActionArea>
  </Card>
);

const EmptyState: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6 }}>
        <StartOption
          title="Create a new Safe"
          description="Choose a version, owners and how many of them must sign. Deploys from your connected wallet."
          onClick={() => navigate("/create")}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <StartOption
          title="Add an existing Safe"
          description="Enter its address. ALT Safe reads owners and settings from the chain; nothing is uploaded."
          onClick={() => navigate("/import")}
        />
      </Grid>
    </Grid>
  );
};

const RemoveSafeDialog: React.FC<{ safe?: SafeAccount; onCancel: () => void; onConfirm: () => void }> = ({
  safe,
  onCancel,
  onConfirm,
}) => (
  <Dialog open={Boolean(safe)} onClose={onCancel} maxWidth="xs" fullWidth>
    <DialogTitle>Remove {safe?.name || "this Safe"}?</DialogTitle>
    <DialogContent>
      <DialogContentText>
        It disappears from this browser only. The Safe, its funds and its owners are not affected, and you can add it
        again any time.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Cancel</Button>
      <Button color="error" variant="contained" onClick={onConfirm}>
        Remove
      </Button>
    </DialogActions>
  </Dialog>
);

const ExistingSafeAccounts: React.FC = () => {
  const { safes, remove } = useSavedSafes();
  const { setSafeAccount } = useSafeWalletContext();
  const { importEntries } = useAddressBook();
  const navigate = useNavigate();
  const chainId = useChainId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingRemoval, setPendingRemoval] = useState<SafeAccount>();
  const [notice, setNotice] = useState<Notice>();

  const openSafe = (address: Address, path: string) => {
    setSafeAccount(address);
    navigate(path);
  };

  const importCsv = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const result = parseAddressBookCsv(await file.text());
    if (!result.ok) return setNotice({ severity: "error", message: result.error });
    await importEntries(result.entries);
    const count = result.entries.length;
    setNotice({ severity: "success", message: `Imported ${count} address${count === 1 ? "" : "es"}.` });
  };

  // Safes usable on the active network come first.
  const sorted = [...safes].sort((a, b) => Number(b.chainIds.includes(chainId)) - Number(a.chainIds.includes(chainId)));

  return (
    <>
      <PageHeader
        title="Your Safes"
        description="Safes you created or added in this browser. Open one to build, sign and execute transactions."
        actions={
          <>
            <Button startIcon={<FileDownloadOutlinedIcon />} onClick={() => fileInputRef.current?.click()}>
              Import address book
            </Button>
            <Button variant="outlined" onClick={() => navigate("/import")}>
              Add existing Safe
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/create")}>
              Create Safe
            </Button>
          </>
        }
      />
      <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={importCsv} hidden />

      {safes.length === 0 ? (
        <EmptyState />
      ) : (
        <Paper variant="outlined">
          {sorted.map((safe) => (
            <SafeRow
              key={safe.address}
              safe={safe}
              onOpen={(address) => openSafe(address, "/safe-info")}
              onSettings={(address) => openSafe(address, "/settings")}
              onRemove={setPendingRemoval}
            />
          ))}
        </Paper>
      )}

      <RemoveSafeDialog
        safe={pendingRemoval}
        onCancel={() => setPendingRemoval(undefined)}
        onConfirm={() => {
          if (pendingRemoval) remove(pendingRemoval.address);
          setPendingRemoval(undefined);
        }}
      />
      <Snackbar open={Boolean(notice)} autoHideDuration={6000} onClose={() => setNotice(undefined)}>
        <Box>
          {notice && (
            <Alert severity={notice.severity} onClose={() => setNotice(undefined)}>
              {notice.message}
            </Alert>
          )}
        </Box>
      </Snackbar>
    </>
  );
};

export default ExistingSafeAccounts;
