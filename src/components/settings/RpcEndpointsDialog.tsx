import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState, useSyncExternalStore } from "react";
import type { Chain } from "viem";
import { useChainId } from "wagmi";
import { orderChainsForRpcList } from "../../rpc/rpcListOrder";
import { readRpcUrls, removeRpcUrl, subscribeRpcUrls } from "../../rpc/rpcStore";
import { useRpcUrl } from "../../rpc/useRpcUrl";
import { font } from "../../theme/tokens";
import { supportedChains } from "../../wagmi";
import RpcUrlForm from "./RpcUrlForm";

const RpcRow: React.FC<{ chain: Chain; isActive: boolean }> = ({ chain, isActive }) => {
  const url = useRpcUrl(chain.id);
  const [editing, setEditing] = useState(false);

  return (
    <Box sx={{ py: 1.5 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2">
            {chain.name}
            {isActive && (
              <Typography component="span" variant="caption" sx={{ ml: 1 }}>
                current network
              </Typography>
            )}
          </Typography>
          <Typography
            variant="body2"
            color={url ? "text.primary" : "text.secondary"}
            title={url}
            sx={{ fontFamily: url ? font.mono : undefined, fontSize: "0.75rem" }}
            noWrap
          >
            {url ?? "Public RPC (none saved)"}
          </Typography>
        </Box>
        <Tooltip title={editing ? "Close" : url ? "Change RPC" : "Set RPC"}>
          <IconButton onClick={() => setEditing((value) => !value)} aria-label={`Edit RPC for ${chain.name}`}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {url && (
          <Tooltip title="Remove and use the public RPC">
            <IconButton onClick={() => removeRpcUrl(chain.id)} aria-label={`Remove RPC for ${chain.name}`}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
      <Collapse in={editing} unmountOnExit>
        <Box sx={{ pt: 1.5 }}>
          <RpcUrlForm chain={chain} autoFocus onSaved={() => setEditing(false)} />
        </Box>
      </Collapse>
    </Box>
  );
};

/** Every network's saved RPC in one place: view, change (validated against the chain) or remove. */
const RpcEndpointsDialog: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const chainId = useChainId();
  // A string snapshot keeps useSyncExternalStore stable; re-renders when any saved URL changes.
  const savedSnapshot = useSyncExternalStore(subscribeRpcUrls, () => Object.keys(readRpcUrls()).join(","));
  const savedChainIds = new Set(savedSnapshot.split(",").filter(Boolean).map(Number));
  const chains = orderChainsForRpcList(supportedChains, savedChainIds, chainId);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
      <DialogTitle>RPC endpoints</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Saved only in this browser. Networks without one use their public RPC, which is rate-limited.
        </Typography>
        <Stack divider={<Divider flexItem />}>
          {chains.map((chain) => (
            <RpcRow key={chain.id} chain={chain} isActive={chain.id === chainId} />
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Done</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RpcEndpointsDialog;
