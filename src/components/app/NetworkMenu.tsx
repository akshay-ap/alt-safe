import CheckIcon from "@mui/icons-material/Check";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useChainId, useSwitchChain } from "wagmi";
import { useRpcHealth } from "../../rpc/useRpcHealth";
import { font } from "../../theme/tokens";
import { supportedChains } from "../../wagmi";
import RpcUrlForm from "../settings/RpcUrlForm";
import StatusDot, { getRpcStatus, RPC_STATUS_LABEL } from "./StatusDot";

const hostOf = (url: string | undefined) => {
  try {
    return url ? new URL(url).host : "—";
  } catch {
    return url ?? "—";
  }
};

const NetworkMenu: React.FC = () => {
  const chainId = useChainId();
  const chain = supportedChains.find((candidate) => candidate.id === chainId);
  const { switchChain } = useSwitchChain();
  const health = useRpcHealth(chain);
  const status = getRpcStatus(health);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [rpcDialogOpen, setRpcDialogOpen] = useState(false);

  const selectChain = (id: (typeof supportedChains)[number]["id"]) => {
    setAnchor(null);
    if (id !== chainId) switchChain({ chainId: id });
  };

  return (
    <>
      <Button
        variant="outlined"
        onClick={(event) => setAnchor(event.currentTarget)}
        startIcon={<StatusDot status={status} />}
        endIcon={<ExpandMoreIcon />}
        sx={{ whiteSpace: "nowrap", minWidth: 0, "& .MuiButton-endIcon": { display: { xs: "none", sm: "inherit" } } }}
        aria-haspopup="menu"
        aria-label={`Network: ${chain?.name ?? "Unsupported"}. ${RPC_STATUS_LABEL[status]}`}
      >
        {chain?.name ?? "Unsupported network"}
      </Button>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        slotProps={{ paper: { sx: { width: 280, maxHeight: 480 } } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="caption">{RPC_STATUS_LABEL[status]}</Typography>
          <Typography sx={{ fontFamily: font.mono, fontSize: "0.75rem", overflowWrap: "anywhere" }}>
            {hostOf(health.url)}
          </Typography>
        </Box>
        <MenuItem
          onClick={() => {
            setAnchor(null);
            setRpcDialogOpen(true);
          }}
        >
          Change RPC for {chain?.name ?? "this network"}
        </MenuItem>
        <Divider />
        {supportedChains.map((candidate) => (
          <MenuItem key={candidate.id} selected={candidate.id === chainId} onClick={() => selectChain(candidate.id)}>
            <ListItemText>{candidate.name}</ListItemText>
            {candidate.id === chainId && (
              <ListItemIcon sx={{ justifyContent: "flex-end" }}>
                <CheckIcon fontSize="small" />
              </ListItemIcon>
            )}
          </MenuItem>
        ))}
      </Menu>
      {chain && (
        <Dialog open={rpcDialogOpen} onClose={() => setRpcDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>RPC for {chain.name}</DialogTitle>
          <DialogContent sx={{ pt: "8px !important" }}>
            <RpcUrlForm key={chain.id} chain={chain} autoFocus onSaved={() => setRpcDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default NetworkMenu;
