import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import DrawOutlinedIcon from "@mui/icons-material/DrawOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import HistoryIcon from "@mui/icons-material/History";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import TagIcon from "@mui/icons-material/Tag";
import {
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useReadContract } from "wagmi";
import safeABI from "../../abis/Safe.json";
import { useSafeWalletContext } from "../../context/WalletContext";
import { useSavedSafe } from "../../hooks/useSavedSafe";
import AccountAddress from "../common/AccountAddress";

type NavItem = { label: string; path: string; icon: React.ReactNode };

const NAV_GROUPS: { title?: string; items: NavItem[] }[] = [
  {
    items: [
      { label: "Overview", path: "/safe-info", icon: <DashboardOutlinedIcon /> },
      { label: "New transaction", path: "/create-transaction", icon: <AddIcon /> },
    ],
  },
  {
    title: "Sign & execute",
    items: [
      { label: "Collect signatures", path: "/aggregate-signatures", icon: <PlaylistAddCheckIcon /> },
      { label: "Approve transaction", path: "/approve-transaction", icon: <FactCheckOutlinedIcon /> },
      { label: "Approve hash", path: "/approve-transaction-hash", icon: <TagIcon /> },
      { label: "Sign message", path: "/sign-message", icon: <DrawOutlinedIcon /> },
    ],
  },
  {
    title: "Safe",
    items: [
      { label: "History", path: "/history", icon: <HistoryIcon /> },
      { label: "Settings", path: "/settings", icon: <SettingsOutlinedIcon /> },
    ],
  },
];

const SafeIdentity: React.FC = () => {
  const { safeAccount, safeStorage } = useSafeWalletContext();
  const saved = useSavedSafe(safeAccount);
  const { data: version } = useReadContract({ address: safeAccount, abi: safeABI, functionName: "VERSION" });
  const owners = safeStorage?.owners?.length;

  return (
    <Stack spacing={1} sx={{ px: 2, py: 2 }}>
      <Typography variant="subtitle2" noWrap title={saved?.name}>
        {saved?.name || "Unnamed Safe"}
      </Typography>
      <AccountAddress address={safeAccount} short size="small" />
      <Stack direction="row" spacing={0.5}>
        {typeof version === "string" && <Chip size="small" label={`v${version}`} />}
        {safeStorage && owners !== undefined && (
          <Chip size="small" label={`${safeStorage.threshold.toString()} of ${owners}`} />
        )}
      </Stack>
    </Stack>
  );
};

const SafeSidebar: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
  const { pathname } = useLocation();

  return (
    <Box component="nav" aria-label="Safe" sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <SafeIdentity />
      <Divider />
      <Box sx={{ flex: 1, overflowY: "auto", py: 1 }}>
        {NAV_GROUPS.map((group) => (
          <List
            key={group.title ?? "main"}
            dense
            subheader={group.title && <ListSubheader>{group.title}</ListSubheader>}
          >
            {group.items.map((item) => (
              <ListItemButton
                key={item.path}
                component={RouterLink}
                to={item.path}
                selected={pathname.startsWith(item.path)}
                onClick={onNavigate}
                sx={{ mx: 1, borderRadius: 1.5 }}
              >
                <ListItemIcon sx={{ minWidth: 32, "& svg": { fontSize: 18 } }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        ))}
      </Box>
      <Divider />
      <Button
        component={RouterLink}
        to="/home"
        onClick={onNavigate}
        startIcon={<ArrowBackIcon />}
        sx={{ m: 1, justifyContent: "flex-start", color: "text.secondary" }}
      >
        All Safes
      </Button>
    </Box>
  );
};

export default SafeSidebar;
