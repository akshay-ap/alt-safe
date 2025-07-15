import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import type React from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import AccountAddress from "../common/AccountAddress";

interface DisconnectDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ChangeAccountDialog: React.FC<DisconnectDialogProps> = ({ open, onClose, onConfirm }) => {
  const { connectors, connect, error } = useConnect();
  const { status, address, chain } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="account-title">
      <DialogTitle id="account-title">Account</DialogTitle>
      <DialogContent>
        <DialogContentText />
        <Grid container spacing={2}>
          {status === "connected" ? (
            <Grid size={12}>
              <Grid size={12}>
                Address: <AccountAddress address={address} />
              </Grid>
              <Grid size={12}>Chain: {chain?.name}</Grid>
            </Grid>
          ) : null}
          {status === "connected" ? (
            <Grid size={12}>
              <Button fullWidth onClick={() => disconnect()} variant="outlined">
                Disconnect
              </Button>
            </Grid>
          ) : (
            <Grid container size={12}>
              <Typography variant="h2">Connect</Typography>
              {connectors.map((connector, index) => (
                <Grid size={12} key={`${index}-${connector.id}`}>
                  <Button
                    fullWidth
                    variant="contained"
                    key={connector.id}
                    onClick={() => connect({ connector })}
                    type="button"
                  >
                    {connector.name}
                  </Button>
                </Grid>
              ))}
              {error?.message && <Alert severity="error">{error?.message}</Alert>}
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onConfirm} autoFocus variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangeAccountDialog;
