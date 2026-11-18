import { Autocomplete, Button, Dialog, DialogContent, DialogTitle, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useChainId, useSwitchChain } from "wagmi";
import { useRpcUrl } from "../../rpc/useRpcUrl";
import { supportedChains } from "../../wagmi";
import RpcUrlForm from "./RpcUrlForm";

/** Asks for an RPC URL whenever the active network has none, on first load and after every network switch. */
const RpcSetupDialog: React.FC = () => {
  const chainId = useChainId();
  const savedUrl = useRpcUrl(chainId);
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const [skippedChainIds, setSkippedChainIds] = useState<ReadonlySet<number>>(new Set());
  const chain = supportedChains.find((candidate) => candidate.id === chainId);

  if (!chain || savedUrl !== undefined || skippedChainIds.has(chainId)) return null;

  const skip = () => setSkippedChainIds((previous) => new Set(previous).add(chainId));

  return (
    <Dialog open maxWidth="sm" fullWidth aria-labelledby="rpc-setup-title">
      <DialogTitle id="rpc-setup-title">Set up an RPC for {chain.name}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            ALT Safe has no backend. It reads Safe state directly from the RPC endpoint you choose, saved only in this
            browser. You can change it any time from the network menu.
          </Typography>
          <Autocomplete
            options={supportedChains}
            value={chain}
            disableClearable
            disabled={isSwitching}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(_, next) => switchChain({ chainId: next.id })}
            renderInput={(params) => <TextField {...params} label="Network" />}
          />
          <RpcUrlForm key={chain.id} chain={chain} autoFocus />
          <Button variant="text" color="inherit" onClick={skip} sx={{ alignSelf: "flex-start" }}>
            Not now
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default RpcSetupDialog;
