import RestoreIcon from "@mui/icons-material/Restore";
import {
  Alert,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Chain } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { STORAGE_KEY } from "../../constants";
import { useSafeWalletContext } from "../../context/WalletContext";
import { supportedChains } from "../../wagmi";
import AddressBookDialog from "./AddressBookDialog";

interface ChainSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onChange: (event: React.SyntheticEvent, value: any) => void;
}

const ChainSelectionDialog: React.FC<ChainSelectionDialogProps> = ({ open, onClose, onChange }) => {
  const theme = useTheme();
  const publicClient = usePublicClient();
  const { rpc, setRpc, storage } = useSafeWalletContext();
  const [cleared, setCleared] = useState(false);
  const [addressBookOpen, setAddressBookOpen] = useState(false);
  const account = useAccount();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // Checks if screen is < sm
  const navigate = useNavigate();

  const handleResetRPC = () => {
    const defaultRPC = publicClient
      ? publicClient.chain.rpcUrls.default.http[0]
      : account.chain?.rpcUrls.default.http[0];
    setRpc(defaultRPC);
  };

  const handleAddCustomDeployment = () => {
    navigate("/add-custom-deployment");
    onClose();
  };

  const handleClearStorage = async () => {
    for (const key of Object.values(STORAGE_KEY)) {
      await storage.removeItem(`${key}`);
    }
    setCleared(true);
  };

  return (
    <>
      <Dialog
        fullScreen={isSmallScreen}
        open={open}
        onClose={onClose}
        PaperProps={{
          style: {
            width: isSmallScreen ? "100vw" : "50vw", // 100% width on small screens, 50% on larger screens
            minHeight: isSmallScreen ? "100vh" : "50vh", // 100% height on small screens, 50% on larger screens
            maxWidth: "none",
          },
        }}
      >
        <DialogTitle>Settings</DialogTitle>
        <DialogContent>
          <Grid container spacing={1}>
            <Grid size={12}>
              <Typography variant="h6">Select chain</Typography>
            </Grid>
            <Grid size={12}>
              <Autocomplete
                options={supportedChains}
                value={supportedChains.find((chain: Chain) => chain.id === account.chainId)}
                fullWidth
                getOptionLabel={(option) => option.name}
                renderInput={(params) => <TextField {...params} label="Search Chains" variant="outlined" />}
                onChange={onChange}
              />
            </Grid>
            <Grid size={12}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel htmlFor="input-rpc">RPC</InputLabel>
                <OutlinedInput
                  id="input-rpc"
                  type="text"
                  fullWidth
                  endAdornment={
                    <InputAdornment position="end">
                      <Tooltip title="Reset to default">
                        <IconButton aria-label="Reset to default" onClick={handleResetRPC} edge="end">
                          <RestoreIcon />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  }
                  label="RPC"
                  value={rpc}
                  onChange={(e) => setRpc(e.target.value)}
                />
              </FormControl>
            </Grid>
            <Grid size={12}>
              <Alert severity="info">Refresh page after updating RPC</Alert>
            </Grid>
            <Grid size={12}>
              <Button fullWidth variant="contained" onClick={() => window.location.reload()}>
                Refresh page
              </Button>
            </Grid>

            <Divider />

            <Grid size={12}>
              <Typography variant="h6">Address Book</Typography>
            </Grid>

            <Grid size={12}>
              <Button fullWidth onClick={() => setAddressBookOpen(true)} variant="outlined">
                Manage Address Book
              </Button>
            </Grid>

            <Divider />

            <Grid size={12}>
              <Typography variant="h6">Safe deployment addresses</Typography>
            </Grid>

            <Grid size={12}>
              <Button fullWidth onClick={handleAddCustomDeployment} variant="outlined">
                Use custom contract addresses (only v1.4.1)
              </Button>
            </Grid>

            <Grid size={12}>
              <Typography variant="h6">Clear storage</Typography>
            </Grid>

            <Grid size={12}>
              <Alert severity="warning">This will clear local storage used by the app.</Alert>
            </Grid>
            <Grid size={12}>
              <Button fullWidth disabled={cleared} onClick={handleClearStorage} variant="outlined">
                Clear App State
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <AddressBookDialog open={addressBookOpen} onClose={() => setAddressBookOpen(false)} />
    </>
  );
};

export default ChainSelectionDialog;
