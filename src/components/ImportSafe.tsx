import { Alert, Box, Button, CircularProgress, Paper, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAddress, isAddress } from "viem";
import { useChainId, useChains } from "wagmi";
import { STORAGE_KEY } from "../constants";
import type { SafeAccount } from "../context/types";
import { useSafeWalletContext } from "../context/WalletContext";
import { type SafeLookup, useSafeLookup } from "../hooks/useSafeLookup";
import { color, font } from "../theme/tokens";
import { upsertSafeAccount } from "../utils/safeAccounts";
import AccountAddress from "./common/AccountAddress";
import NameAndLabels from "./common/NameAndLabels";
import PageHeader from "./common/PageHeader";

const Detail: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <Box sx={{ display: "grid", gridTemplateColumns: { sm: "160px 1fr" }, gap: { xs: 0.25, sm: 2 }, py: 1 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Box sx={{ minWidth: 0 }}>{children}</Box>
  </Box>
);

const SafeDetails: React.FC<{ lookup: SafeLookup }> = ({ lookup: { storage, version } }) => (
  <Box sx={{ px: 2.5, py: 1.5, borderTop: `1px solid ${color.hairline}` }}>
    <Detail label="Version">{version ?? "Unknown"}</Detail>
    <Detail label="Required signatures">
      {storage.threshold.toString()} of {storage.owners?.length ?? storage.ownerCount.toString()} owners
    </Detail>
    <Detail label="Owners">
      <Stack spacing={0.5}>
        {storage.owners?.map((owner) => (
          <AccountAddress key={owner} address={owner} size="small" />
        ))}
      </Stack>
    </Detail>
    <Detail label="Nonce">{storage.nonce.toString()}</Detail>
    <Detail label="Modules">{storage.modules?.length ? storage.modules.length : "None"}</Detail>
  </Box>
);

const ImportSafe: React.FC = () => {
  const { setSafeAccount, storage } = useSafeWalletContext();
  const navigate = useNavigate();
  const chainId = useChainId();
  const chainName = useChains().find((chain) => chain.id === chainId)?.name ?? "this network";
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [labels, setLabels] = useState<string[]>([]);
  const [saveError, setSaveError] = useState<string>();
  const lookup = useSafeLookup(address.trim());
  const trimmed = address.trim();
  const showFormatError = trimmed.length > 0 && !isAddress(trimmed);

  const save = async () => {
    // Checksummed, so code that compares saved addresses as strings keeps working.
    const safeAddress = getAddress(trimmed);
    const accounts = ((await storage.getItem(STORAGE_KEY.SAFE_ACCOUNTS)) as SafeAccount[] | null) ?? [];
    const result = upsertSafeAccount(accounts, { address: safeAddress, chainId, name: name.trim(), labels });
    if (result.status === "exists") return setSaveError(`This Safe is already in your list for ${chainName}.`);
    await storage.setItem(STORAGE_KEY.SAFE_ACCOUNTS, result.accounts);
    setSafeAccount(safeAddress);
    navigate("/safe-info");
  };

  return (
    <Box sx={{ maxWidth: 760 }}>
      <PageHeader
        title="Add an existing Safe"
        description={`Paste a Safe address on ${chainName}. Its owners and settings are read from the chain and saved only in this browser.`}
      />
      <Stack spacing={3}>
        <Paper variant="outlined">
          <Box sx={{ p: 2.5 }}>
            <TextField
              label="Safe address"
              placeholder="0x…"
              value={address}
              onChange={(event) => {
                setAddress(event.target.value);
                setSaveError(undefined);
              }}
              error={showFormatError || lookup.isError}
              helperText={showFormatError ? "Enter a 42-character address starting with 0x." : " "}
              fullWidth
              autoFocus
              slotProps={{
                htmlInput: { spellCheck: false, autoComplete: "off", style: { fontFamily: font.mono } },
                input: {
                  endAdornment: lookup.isFetching && <CircularProgress size={18} aria-label="Looking up Safe" />,
                },
              }}
            />
            {lookup.isError && <Alert severity="error">{lookup.error.message}</Alert>}
            {lookup.data && (
              <Alert severity="success" variant="outlined">
                Safe found on {chainName}. Check the owners below before adding it.
              </Alert>
            )}
          </Box>
          {lookup.data && <SafeDetails lookup={lookup.data} />}
        </Paper>

        {lookup.data && (
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <NameAndLabels
              name={name}
              setName={setName}
              labels={labels}
              setLabels={setLabels}
              nameLabel="Name"
              labelsLabel="Labels (optional)"
            />
          </Paper>
        )}

        {saveError && <Alert severity="warning">{saveError}</Alert>}
        <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
          <Button onClick={() => navigate("/home")}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={!lookup.data || !name.trim()}>
            Add Safe
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ImportSafe;
