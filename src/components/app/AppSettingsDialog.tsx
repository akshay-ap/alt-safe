import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { STORAGE_KEY } from "../../constants";
import { useSafeWalletContext } from "../../context/WalletContext";
import AddressBookDialog from "../dialogs/AddressBookDialog";

interface AppSettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

const Section: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({
  title,
  description,
  children,
}) => (
  <Stack spacing={1.5}>
    <div>
      <Typography variant="subtitle2">{title}</Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </div>
    {children}
  </Stack>
);

const ClearDataButton: React.FC = () => {
  const { storage } = useSafeWalletContext();
  const [confirming, setConfirming] = useState(false);

  const clear = async () => {
    for (const key of Object.values(STORAGE_KEY)) await storage.removeItem(key);
    // In-memory state still holds the cleared data; a reload starts from a clean slate.
    window.location.assign("/");
  };

  if (!confirming) {
    return (
      <Button variant="outlined" color="error" onClick={() => setConfirming(true)} sx={{ alignSelf: "flex-start" }}>
        Clear app data…
      </Button>
    );
  }
  return (
    <Alert
      severity="error"
      action={
        <Stack direction="row" spacing={1}>
          <Button color="inherit" size="small" onClick={() => setConfirming(false)}>
            Cancel
          </Button>
          <Button color="error" variant="contained" size="small" onClick={clear}>
            Clear data
          </Button>
        </Stack>
      }
    >
      Removes saved Safes, drafts, the address book and RPC URLs from this browser.
    </Alert>
  );
};

const AppSettingsDialog: React.FC<AppSettingsDialogProps> = ({ open, onClose }) => {
  const [addressBookOpen, setAddressBookOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>App settings</DialogTitle>
        <DialogContent>
          <Stack spacing={3} divider={<Divider flexItem />} sx={{ pt: 1 }}>
            <Section title="Address book" description="Names for addresses you use often, per network.">
              <Button variant="outlined" onClick={() => setAddressBookOpen(true)} sx={{ alignSelf: "flex-start" }}>
                Manage address book
              </Button>
            </Section>
            <Section title="App data" description="Everything ALT Safe stores lives only in this browser.">
              <ClearDataButton />
            </Section>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Done</Button>
        </DialogActions>
      </Dialog>
      <AddressBookDialog open={addressBookOpen} onClose={() => setAddressBookOpen(false)} />
    </>
  );
};

export default AppSettingsDialog;
