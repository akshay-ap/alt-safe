import AddIcon from "@mui/icons-material/Add";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  Alert,
  Box,
  Button,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
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

const SIGNING_TOOLS = [
  {
    title: "Collect signatures and execute",
    description: "Import a transaction, gather owner signatures, then execute it.",
    path: "/aggregate-signatures",
  },
  {
    title: "Approve a transaction",
    description: "Review a shared transaction and approve or sign it as an owner.",
    path: "/approve-transaction",
  },
  {
    title: "Approve a hash",
    description: "Approve a Safe transaction hash on chain.",
    path: "/approve-transaction-hash",
  },
  { title: "Sign a message", description: "Sign an off-chain message on behalf of this Safe.", path: "/sign-message" },
];

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
          <Section title="Sign & execute">
            <List disablePadding>
              {SIGNING_TOOLS.map((tool) => (
                <ListItemButton key={tool.path} component={RouterLink} to={tool.path} sx={{ px: 2.5, py: 1.5 }}>
                  <ListItemText primary={tool.title} secondary={tool.description} />
                  <ChevronRightIcon fontSize="small" sx={{ color: "text.secondary" }} />
                </ListItemButton>
              ))}
            </List>
          </Section>
        </Grid>
      </Grid>
    </>
  );
};

export default SafeInfo;
