import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import {
  Alert,
  Avatar,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useRef } from "react";
import { type Connector, useAccount, useConnect, useDisconnect } from "wagmi";
import AccountAddress from "../common/AccountAddress";

interface WalletDialogProps {
  open: boolean;
  onClose: () => void;
}

// EIP-6963 wallets announce themselves with their own id; wagmi's built-in connectors use these.
const GENERIC_CONNECTOR_IDS = new Set(["injected", "coinbaseWalletSDK"]);
const GENERIC_LABELS: Record<string, string> = {
  injected: "Other browser wallet",
  coinbaseWalletSDK: "Coinbase Wallet (app or extension)",
};

const describeError = (error: Error) =>
  error.name === "UserRejectedRequestError" ? "The request was rejected in your wallet." : error.message;

const ConnectorIcon: React.FC<{ connector: Connector }> = ({ connector }) => (
  <Avatar src={connector.icon} alt="" variant="rounded" sx={{ width: 32, height: 32, bgcolor: "action.hover" }}>
    <AccountBalanceWalletOutlinedIcon fontSize="small" />
  </Avatar>
);

const ConnectorList: React.FC<{ title: string; connectors: readonly Connector[] }> = ({ title, connectors }) => {
  const { connect, isPending, variables } = useConnect();
  if (connectors.length === 0) return null;

  return (
    <List subheader={<ListSubheader disableSticky>{title}</ListSubheader>} disablePadding>
      {connectors.map((connector) => {
        const isConnecting = isPending && variables?.connector === connector;
        return (
          <ListItemButton
            key={connector.uid}
            onClick={() => connect({ connector })}
            disabled={isPending}
            sx={{ borderRadius: 1.5 }}
          >
            <ListItemAvatar sx={{ minWidth: 44 }}>
              <ConnectorIcon connector={connector} />
            </ListItemAvatar>
            <ListItemText primary={GENERIC_LABELS[connector.id] ?? connector.name} />
            {isConnecting && <CircularProgress size={18} aria-label="Waiting for wallet" />}
          </ListItemButton>
        );
      })}
    </List>
  );
};

const ConnectView: React.FC = () => {
  const { connectors, error } = useConnect();
  const detected = connectors.filter((connector) => !GENERIC_CONNECTOR_IDS.has(connector.id));
  const others = connectors.filter((connector) => GENERIC_CONNECTOR_IDS.has(connector.id));

  return (
    <Stack spacing={1}>
      {detected.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No wallet extension announced itself in this browser. Use one of the options below.
        </Typography>
      )}
      <ConnectorList title="Detected in this browser" connectors={detected} />
      <ConnectorList title="Other options" connectors={others} />
      {error && <Alert severity="error">{describeError(error)}</Alert>}
    </Stack>
  );
};

const ConnectedView: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { address, chain, connector } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        {connector && <ConnectorIcon connector={connector} />}
        <div>
          <Typography variant="subtitle2">{connector?.name ?? "Wallet"}</Typography>
          <Typography variant="caption">{chain?.name ?? "Unsupported network"}</Typography>
        </div>
      </Stack>
      <AccountAddress address={address} showExplorer />
      <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
        <Button
          color="error"
          onClick={() => {
            disconnect();
            onClose();
          }}
        >
          Disconnect
        </Button>
        <Button variant="contained" onClick={onClose}>
          Done
        </Button>
      </Stack>
    </Stack>
  );
};

const WalletDialog: React.FC<WalletDialogProps> = ({ open, onClose }) => {
  const { isConnected } = useAccount();
  const wasConnected = useRef(isConnected);

  // Close once a connection made from this dialog succeeds; reopening shows the connected view.
  useEffect(() => {
    if (open && isConnected && !wasConnected.current) onClose();
    wasConnected.current = isConnected;
  }, [open, isConnected, onClose]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth aria-labelledby="wallet-dialog-title">
      <DialogTitle id="wallet-dialog-title">{isConnected ? "Connected wallet" : "Connect a wallet"}</DialogTitle>
      <DialogContent>{isConnected ? <ConnectedView onClose={onClose} /> : <ConnectView />}</DialogContent>
    </Dialog>
  );
};

export default WalletDialog;
