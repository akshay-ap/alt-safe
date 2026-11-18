import AddIcon from "@mui/icons-material/Add";
import { Alert, Box, Button, Grid, Paper, Skeleton, Stack, Typography } from "@mui/material";
import type React from "react";
import { Link as RouterLink } from "react-router-dom";
import { useBalance, useReadContract } from "wagmi";
import safeABI from "../../abis/Safe.json";
import { useSafeWalletContext } from "../../context/WalletContext";
import { useSavedSafe } from "../../hooks/useSavedSafe";
import { color } from "../../theme/tokens";
import { formatTokenAmount } from "../../utils/format";
import AccountAddress from "../common/AccountAddress";
import PageHeader from "../common/PageHeader";

const Stat: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <Box sx={{ px: 2.5, py: 2 }}>
    <Typography variant="caption" component="div">
      {label}
    </Typography>
    <Typography variant="h5" component="div" sx={{ fontVariantNumeric: "tabular-nums", mt: 0.5 }}>
      {value ?? <Skeleton width={72} />}
    </Typography>
  </Box>
);

const StatStrip: React.FC = () => {
  const { safeAccount, safeStorage } = useSafeWalletContext();
  const { data: balance } = useBalance({ address: safeAccount });
  const { data: version } = useReadContract({ address: safeAccount, abi: safeABI, functionName: "VERSION" });
  const owners = safeStorage?.owners?.length;
  const stats = [
    {
      label: "Balance",
      value: balance && `${formatTokenAmount(balance.value, balance.decimals)} ${balance.symbol}`,
    },
    {
      label: "Required signatures",
      value: safeStorage && owners !== undefined && `${safeStorage.threshold} of ${owners}`,
    },
    { label: "Nonce", value: safeStorage?.nonce.toString() },
    { label: "Version", value: typeof version === "string" ? version : undefined },
  ];

  return (
    <Paper variant="outlined" sx={{ mb: 4 }}>
      <Grid
        container
        sx={{ "& > *": { borderRight: { md: `1px solid ${color.hairline}` } }, "& > *:last-child": { borderRight: 0 } }}
      >
        {stats.map((stat) => (
          <Grid key={stat.label} size={{ xs: 6, md: 3 }}>
            <Stat label={stat.label} value={stat.value || undefined} />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Box component="section">
    <Typography variant="h5" component="h2" sx={{ mb: 1.5 }}>
      {title}
    </Typography>
    <Paper variant="outlined">{children}</Paper>
  </Box>
);

const Owners: React.FC = () => {
  const { safeStorage } = useSafeWalletContext();
  if (!safeStorage?.owners) return <Skeleton variant="rounded" height={96} />;
  return (
    <Stack divider={<Box sx={{ borderTop: `1px solid ${color.hairline}` }} />}>
      {safeStorage.owners.map((owner) => (
        <Box key={owner} sx={{ px: 2.5, py: 1.5 }}>
          <AccountAddress address={owner} size="small" showExplorer />
        </Box>
      ))}
    </Stack>
  );
};

const ConfigRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <Box sx={{ px: 2.5, py: 1.5 }}>
    <Typography variant="caption" component="div" sx={{ mb: 0.25 }}>
      {label}
    </Typography>
    {children}
  </Box>
);

/** What the sidebar cannot show: how this Safe is wired on chain. */
const Configuration: React.FC = () => {
  const { safeStorage } = useSafeWalletContext();
  if (!safeStorage) return <Skeleton variant="rounded" height={96} />;
  const modules = safeStorage.modules ?? [];

  return (
    <Stack divider={<Box sx={{ borderTop: `1px solid ${color.hairline}` }} />}>
      <ConfigRow label="Singleton">
        <AccountAddress address={safeStorage.singleton} size="small" showExplorer />
      </ConfigRow>
      <ConfigRow label="Fallback handler">
        <AccountAddress address={safeStorage.fallbackHandler} size="small" showExplorer />
      </ConfigRow>
      <ConfigRow label="Guard">
        <AccountAddress address={safeStorage.guard} size="small" showExplorer />
      </ConfigRow>
      <ConfigRow label={`Modules (${modules.length})`}>
        {modules.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            None enabled
          </Typography>
        ) : (
          modules.map((module) => <AccountAddress key={module} address={module} size="small" showExplorer />)
        )}
      </ConfigRow>
    </Stack>
  );
};

const SafeInfo: React.FC = () => {
  const { safeAccount } = useSafeWalletContext();
  const saved = useSavedSafe(safeAccount);

  if (!safeAccount) {
    return <Alert severity="info">Choose a Safe from your list to see its overview.</Alert>;
  }

  return (
    <>
      <PageHeader
        title={saved?.name || "Unnamed Safe"}
        description={<AccountAddress address={safeAccount} showExplorer />}
        actions={
          <Button component={RouterLink} to="/create-transaction" variant="contained" startIcon={<AddIcon />}>
            New transaction
          </Button>
        }
      />
      <StatStrip />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Section title="Owners">
            <Owners />
          </Section>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Section title="Configuration">
            <Configuration />
          </Section>
        </Grid>
      </Grid>
    </>
  );
};

export default SafeInfo;
