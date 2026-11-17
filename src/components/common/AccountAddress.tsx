import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Box, IconButton, Snackbar, Tooltip, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { zeroAddress } from "viem";
import { useChainId, useChains } from "wagmi";
import { font } from "../../theme/tokens";
import { chunkHex } from "../../utils/address";

interface AccountAddressProps {
  address?: `0x${string}`;
  showExplorer?: boolean;
  /** Defaults to the active chain's block explorer. */
  explorerUrl?: string;
  short?: boolean;
  size?: "small" | "medium" | "large";
  showCopy?: boolean;
}

const FONT_SIZES = { small: "0.75rem", medium: "0.8125rem", large: "1rem" } as const;
const COPIED_FEEDBACK_MS = 1500;

const useExplorerUrl = (override: string | undefined) => {
  const chainId = useChainId();
  const chain = useChains().find((candidate) => candidate.id === chainId);
  return override ?? chain?.blockExplorers?.default.url;
};

// Gaps come from margins, not spaces, so selecting and copying yields the exact address.
// Inline-blocks let lines wrap only between groups, never inside one.
const ChunkedHex: React.FC<{ value: string }> = ({ value }) => (
  <>
    {chunkHex(value).map((group, index) => (
      <Box
        component="span"
        key={`${index}-${group}`}
        sx={{ display: "inline-block", whiteSpace: "nowrap", mr: "0.4em", "&:last-of-type": { mr: 0 } }}
      >
        {group}
      </Box>
    ))}
  </>
);

const AccountAddress: React.FC<AccountAddressProps> = ({
  address,
  showExplorer = false,
  explorerUrl,
  short = false,
  size = "medium",
  showCopy = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(copiedTimer.current), []);
  const explorer = useExplorerUrl(explorerUrl);
  const fontSize = FONT_SIZES[size];

  // A plain comparison: this also renders values that are not valid addresses, which isAddressEqual would throw on.
  if (!address || address.toLowerCase() === zeroAddress) {
    return (
      <Typography component="span" sx={{ color: "text.secondary", fontSize }}>
        {address ? "Zero address" : "Not set"}
      </Typography>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      setCopyFailed(true);
      return;
    }
    setCopied(true);
    clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
  };

  return (
    <Box
      component="span"
      sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, minWidth: 0, maxWidth: "100%" }}
    >
      <Tooltip title={short ? address : ""} placement="top">
        <Typography component="span" sx={{ fontFamily: font.mono, fontSize, fontVariantLigatures: "none" }}>
          {short ? `${address.slice(0, 6)}…${address.slice(-4)}` : <ChunkedHex value={address} />}
        </Typography>
      </Tooltip>
      {showCopy && (
        <Tooltip title={copied ? "Copied" : "Copy address"}>
          <IconButton size="small" onClick={handleCopy} aria-label="Copy address">
            {copied ? <CheckIcon sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
          </IconButton>
        </Tooltip>
      )}
      {showExplorer && explorer && (
        <Tooltip title="View on block explorer">
          <IconButton
            size="small"
            component="a"
            href={`${explorer}/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View on block explorer"
          >
            <OpenInNewIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      )}
      <Snackbar
        open={copyFailed}
        autoHideDuration={4000}
        onClose={() => setCopyFailed(false)}
        message="Could not copy to the clipboard"
      />
    </Box>
  );
};

export default AccountAddress;
