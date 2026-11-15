import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { Box, Button, Chip, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import type { Address } from "viem";
import { useBalance, useChainId, useChains, useSwitchChain } from "wagmi";
import type { SafeAccount } from "../../context/types";
import { color } from "../../theme/tokens";
import { formatTokenAmount } from "../../utils/format";
import AccountAddress from "../common/AccountAddress";

interface SafeRowProps {
  safe: SafeAccount;
  onOpen: (address: Address) => void;
  onSettings: (address: Address) => void;
  onRemove: (safe: SafeAccount) => void;
}

const Balance: React.FC<{ address: Address }> = ({ address }) => {
  const { data } = useBalance({ address });
  if (!data) return null;
  return (
    <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: "tabular-nums" }}>
      {formatTokenAmount(data.value, data.decimals)} {data.symbol}
    </Typography>
  );
};

const SafeRow: React.FC<SafeRowProps> = ({ safe, onOpen, onSettings, onRemove }) => {
  const chainId = useChainId();
  const chains = useChains();
  const { switchChain, isPending } = useSwitchChain();
  const isOnActiveChain = safe.chainIds.includes(chainId);
  const firstChain = chains.find((chain) => safe.chainIds.includes(chain.id));
  const chainNames = safe.chainIds.map((id) => chains.find((chain) => chain.id === id)?.name ?? `Chain ${id}`);

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        alignItems: "center",
        px: 2.5,
        py: 2,
        "&:not(:last-of-type)": { borderBottom: `1px solid ${color.hairline}` },
      }}
    >
      <Stack spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 0.5 }}>
          <Typography variant="subtitle2">{safe.name || "Unnamed Safe"}</Typography>
          {chainNames.map((name) => (
            <Chip key={name} size="small" variant="outlined" label={name} />
          ))}
          {safe.labels?.map((label) => (
            <Chip key={label} size="small" label={label} />
          ))}
        </Stack>
        <AccountAddress address={safe.address} size="small" />
        {isOnActiveChain && <Balance address={safe.address} />}
      </Stack>
      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", flexShrink: 0 }}>
        <Tooltip title="Safe settings">
          <span>
            <IconButton onClick={() => onSettings(safe.address)} disabled={!isOnActiveChain} aria-label="Safe settings">
              <SettingsOutlinedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Remove from this browser">
          <IconButton onClick={() => onRemove(safe)} aria-label="Remove Safe">
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {isOnActiveChain ? (
          <Button variant="contained" onClick={() => onOpen(safe.address)} endIcon={<ChevronRightIcon />}>
            Open
          </Button>
        ) : (
          firstChain && (
            <Button variant="outlined" onClick={() => switchChain({ chainId: firstChain.id })} disabled={isPending}>
              Switch to {firstChain.name}
            </Button>
          )
        )}
      </Stack>
    </Box>
  );
};

export default SafeRow;
