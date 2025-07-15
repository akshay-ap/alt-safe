import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorIcon from "@mui/icons-material/Error";
import { AppBar, Box, Button, IconButton, Toolbar, Tooltip, Typography } from "@mui/material";
import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount, useChainId, usePublicClient, useSwitchChain } from "wagmi";
import { checkRPCStatus, getChainId } from "../../api/api";
import { useSafeWalletContext } from "../../context/WalletContext";
import { config } from "../../wagmi";
import AccountAddress from "../common/AccountAddress";
import ChainSelectionDialog from "../dialogs/ChainSelectionDialog";
import ChangeAccountDialog from "../dialogs/ChangeAccountDialog";

const NavigationBar: React.FC = () => {
  const navigate = useNavigate();
  const chainId = useChainId();
  const { address, chain } = useAccount();
  const { switchChain } = useSwitchChain({ config } as any);
  const publicClient = usePublicClient();
  const { rpc } = useSafeWalletContext();
  const [chainDialogOpen, setChainDialogOpen] = useState(false); // State for chain selection dialog
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false); // State for controlling the dialog
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    (async () => {
      if (!publicClient || !rpc || !chain) {
        setConnected(false);
        return;
      }

      if (chainId && rpc) {
        const status = await checkRPCStatus(rpc);
        const chainIdFromRPC = await getChainId(rpc);
        if (chainIdFromRPC !== chainId) {
          setConnected(false);
          return;
        }
        setConnected(status);
      } else {
        setConnected(false);
      }
    })();
  }, [publicClient, chain, chainId, rpc]);

  // Handle chain dialog open/close
  const handleChainDialogOpen = () => {
    setChainDialogOpen(true);
  };

  const handleChainDialogClose = () => {
    setChainDialogOpen(false);
  };

  const handleChainChange = (_: React.SyntheticEvent, value: any) => {
    if (value) {
      switchChain({ chainId: value.id });
    }
  };

  const handleChangeClick = () => {
    setDisconnectDialogOpen(true); // Open the dialog
  };

  const handleDisconnectConfirm = () => {
    setDisconnectDialogOpen(false);
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Left Section: App Name and Buttons */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            fontWeight="bold"
            color="primary"
            variant="h6"
            sx={{ marginRight: 4, cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            &lt;ALT&gt; Safe
          </Typography>
        </Box>

        <Box>
          {address && (
            <IconButton onClick={handleChainDialogOpen} color="inherit">
              {connected ? (
                <Tooltip title="connected">
                  <CheckCircleOutlineIcon sx={{ marginRight: "5px" }} />
                </Tooltip>
              ) : (
                <Tooltip title="Error connecting to RPC. Check RPC URL">
                  <ErrorIcon color="error" sx={{ marginRight: "5px" }} />
                </Tooltip>
              )}
              {chain?.name}
            </IconButton>
          )}
          <ChainSelectionDialog open={chainDialogOpen} onClose={handleChainDialogClose} onChange={handleChainChange} />

          {address ? (
            <IconButton onClick={handleChangeClick} color="inherit">
              <AccountAddress address={address} short showCopy={false} />
            </IconButton>
          ) : (
            <Button variant="contained" onClick={handleChangeClick}>
              Connect
            </Button>
          )}
        </Box>
      </Toolbar>

      <ChangeAccountDialog
        open={disconnectDialogOpen}
        onClose={() => setDisconnectDialogOpen(false)}
        onConfirm={handleDisconnectConfirm}
      />
    </AppBar>
  );
};

export default NavigationBar;
