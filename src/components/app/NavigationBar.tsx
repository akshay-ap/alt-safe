import HelpOutlineIcon from "@mui/icons-material/HelpOutlineOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { AppBar, Box, Button, IconButton, Toolbar, Tooltip } from "@mui/material";
import type React from "react";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useAccount } from "wagmi";
import AccountAddress from "../common/AccountAddress";
import ChangeAccountDialog from "../dialogs/ChangeAccountDialog";
import AppSettingsDialog from "./AppSettingsDialog";
import Logo from "./Logo";
import NetworkMenu from "./NetworkMenu";

export const TOP_BAR_HEIGHT = 56;
const HELP_URL = "https://github.com/akshay-ap/alt-safe/discussions/2";

interface NavigationBarProps {
  /** Shown on small screens to open the Safe navigation drawer. */
  onMenuClick?: () => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ onMenuClick }) => {
  const { address } = useAccount();
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ minHeight: `${TOP_BAR_HEIGHT}px !important`, gap: 1 }}>
        {onMenuClick && (
          <IconButton onClick={onMenuClick} aria-label="Open navigation" sx={{ display: { md: "none" } }}>
            <MenuIcon />
          </IconButton>
        )}
        <Box component={RouterLink} to="/home" aria-label="ALT Safe home" sx={{ color: "inherit", mr: "auto" }}>
          <Logo />
        </Box>
        <NetworkMenu />
        <Tooltip title="Help">
          <IconButton component="a" href={HELP_URL} target="_blank" rel="noopener noreferrer" aria-label="Help">
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="App settings">
          <IconButton onClick={() => setSettingsOpen(true)} aria-label="App settings">
            <SettingsOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {address ? (
          <Button variant="outlined" onClick={() => setAccountDialogOpen(true)} aria-label="Wallet account">
            <AccountAddress address={address} short showCopy={false} />
          </Button>
        ) : (
          <Button variant="contained" onClick={() => setAccountDialogOpen(true)}>
            Connect wallet
          </Button>
        )}
      </Toolbar>
      <ChangeAccountDialog
        open={accountDialogOpen}
        onClose={() => setAccountDialogOpen(false)}
        onConfirm={() => setAccountDialogOpen(false)}
      />
      <AppSettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </AppBar>
  );
};

export default NavigationBar;
