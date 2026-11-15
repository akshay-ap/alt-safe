import { Alert, Box, Button, CircularProgress, Stack, TextField, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import type { Chain } from "viem";
import { describeProbeError, probeRpc } from "../../rpc/rpcProbe";
import { setRpcUrl } from "../../rpc/rpcStore";
import { useRpcUrl } from "../../rpc/useRpcUrl";

interface RpcUrlFormProps {
  chain: Chain;
  autoFocus?: boolean;
  onSaved?: () => void;
}

type FormStatus = { kind: "idle" } | { kind: "checking" } | { kind: "error"; message: string };

const RpcUrlForm: React.FC<RpcUrlFormProps> = ({ chain, autoFocus, onSaved }) => {
  const savedUrl = useRpcUrl(chain.id);
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(savedUrl ?? "");
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" });
  const publicUrl = chain.rpcUrls.default.http[0];

  const save = async (url: string) => {
    setStatus({ kind: "checking" });
    const result = await probeRpc(url, chain.id);
    if (!result.ok) return setStatus({ kind: "error", message: describeProbeError(result) });

    setRpcUrl(chain.id, url);
    setStatus({ kind: "idle" });
    // Cached reads came from the previous endpoint; refetch them from the new one.
    await queryClient.invalidateQueries();
    onSaved?.();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    save(draft);
  };

  const isChecking = status.kind === "checking";
  const isUnchanged = draft.trim() === savedUrl;

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2}>
        <TextField
          label={`${chain.name} RPC URL`}
          placeholder="https://"
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setStatus({ kind: "idle" });
          }}
          error={status.kind === "error"}
          helperText={status.kind === "error" ? status.message : `Must serve chain ID ${chain.id}.`}
          autoFocus={autoFocus}
          disabled={isChecking}
          fullWidth
          slotProps={{ htmlInput: { spellCheck: false, autoComplete: "off", inputMode: "url" } }}
        />
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ justifyContent: "flex-end" }}>
          {publicUrl && savedUrl !== publicUrl && (
            <Button variant="text" onClick={() => save(publicUrl)} disabled={isChecking}>
              Use public RPC
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={isChecking || !draft.trim() || isUnchanged}
            startIcon={isChecking ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {isChecking ? "Checking…" : "Save RPC"}
          </Button>
        </Stack>
        {savedUrl === publicUrl && (
          <Alert severity="warning" variant="outlined">
            <Typography variant="body2">
              Public RPCs are rate-limited and may drop requests. Use a private endpoint for reliable signing.
            </Typography>
          </Alert>
        )}
      </Stack>
    </Box>
  );
};

export default RpcUrlForm;
