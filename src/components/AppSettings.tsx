import { Alert, Box, Button, FormControlLabel, Paper, Stack, Switch, Typography } from "@mui/material";
import { useState } from "react";
import { STORAGE_KEY } from "../constants";
import { useSafeWalletContext } from "../context/WalletContext";
import { useAddressFormat, writeAddressFormat } from "../settings/addressFormat";
import { useShowDebugView, writeShowDebugView } from "../settings/debugView";
import AccountAddress from "./common/AccountAddress";
import PageHeader from "./common/PageHeader";
import AddressBookDialog from "./dialogs/AddressBookDialog";
import RpcEndpointsDialog from "./settings/RpcEndpointsDialog";

const Section: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({
  title,
  description,
  children,
}) => (
  <Paper variant="outlined" component={Stack} spacing={1.5} sx={{ p: 2.5 }}>
    <div>
      <Typography variant="subtitle2">{title}</Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </div>
    {children}
  </Paper>
);

const PREVIEW_ADDRESS = "0xC2928299072B9918a6d62a2309b18b71b0c2Fbe5";

const AddressFormatToggle: React.FC = () => {
  const format = useAddressFormat();
  return (
    <Stack spacing={1}>
      <FormControlLabel
        control={
          <Switch
            checked={format === "grouped"}
            onChange={(event) => writeAddressFormat(event.target.checked ? "grouped" : "plain")}
          />
        }
        label="Group in fours, e.g. 0xC292 8299 072B"
      />
      <AccountAddress address={PREVIEW_ADDRESS} showCopy={false} />
    </Stack>
  );
};

const DebugViewToggle: React.FC = () => {
  const show = useShowDebugView();
  return (
    <FormControlLabel
      control={<Switch checked={show} onChange={(event) => writeShowDebugView(event.target.checked)} />}
      label="Show the Inspect button when building actions"
    />
  );
};

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

/** Settings that apply to the whole app, whichever Safe is open. */
const AppSettings: React.FC = () => {
  const [addressBookOpen, setAddressBookOpen] = useState(false);
  const [rpcDialogOpen, setRpcDialogOpen] = useState(false);

  return (
    <Box sx={{ maxWidth: 1040 }}>
      <PageHeader
        title="App settings"
        description="These apply to every Safe in this browser. Settings of the open Safe are under Safe settings."
      />
      {/* Two columns on wide screens so the page fits without scrolling. */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
        <Section title="RPC endpoints" description="View, change or remove the RPC URL saved for each network.">
          <Button variant="outlined" onClick={() => setRpcDialogOpen(true)} sx={{ alignSelf: "flex-start" }}>
            Manage RPC endpoints
          </Button>
        </Section>
        <Section title="Address book" description="Names for addresses you use often, per network.">
          <Button variant="outlined" onClick={() => setAddressBookOpen(true)} sx={{ alignSelf: "flex-start" }}>
            Manage address book
          </Button>
        </Section>
        <Section
          title="Address format"
          description="How full addresses, hashes and signatures are shown everywhere in the app. Copying always gives the exact value."
        >
          <AddressFormatToggle />
        </Section>
        <Section
          title="Debug view"
          description="Shows how each action's calldata is built from its template. For template authors and troubleshooting."
        >
          <DebugViewToggle />
        </Section>
        <Section title="App data" description="Everything ALT Safe stores lives only in this browser.">
          <ClearDataButton />
        </Section>
      </Box>
      <AddressBookDialog open={addressBookOpen} onClose={() => setAddressBookOpen(false)} />
      <RpcEndpointsDialog open={rpcDialogOpen} onClose={() => setRpcDialogOpen(false)} />
    </Box>
  );
};

export default AppSettings;
