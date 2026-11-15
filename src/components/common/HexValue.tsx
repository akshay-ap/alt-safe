import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Box, IconButton, Snackbar, Tooltip, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useChainId, useChains } from "wagmi";
import { font } from "../../theme/tokens";
import { chunkHex } from "../../utils/address";

export type HexValueSize = "small" | "medium" | "large";

export interface HexValueProps {
  value: string;
  /** Explorer path segment, e.g. "address" or "tx". Omit when the value has no explorer page. */
  explorerPath?: "address" | "tx";
  showExplorer?: boolean;
  /** Defaults to the active chain's block explorer. */
  explorerUrl?: string;
  showCopy?: boolean;
  /** Characters kept on each side when shortened; undefined shows the full value. */
  shortenTo?: { head: number; tail: number };
  size?: HexValueSize;
  noun: string;
}

const FONT_SIZES: Record<HexValueSize, string> = { small: "0.75rem", medium: "0.8125rem", large: "1rem" };
const COPIED_FEEDBACK_MS = 1500;

const useExplorerUrl = (override: string | undefined) => {
  const chainId = useChainId();
  const chain = useChains().find((candidate) => candidate.id === chainId);
  return override ?? chain?.blockExplorers?.default.url;
};

// Gaps come from margins, not spaces, so selecting and copying yields the exact value.
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

const HexValue: React.FC<HexValueProps> = ({
  value,
  explorerPath,
  showExplorer = false,
  explorerUrl,
  showCopy = true,
  shortenTo,
  size = "medium",
  noun,
}) => {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(copiedTimer.current), []);
  const explorer = useExplorerUrl(explorerUrl);
  const shortened = shortenTo && `${value.slice(0, shortenTo.head)}…${value.slice(-shortenTo.tail)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
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
      <Tooltip title={shortened ? value : ""} placement="top">
        <Typography
          component="span"
          sx={{ fontFamily: font.mono, fontSize: FONT_SIZES[size], fontVariantLigatures: "none" }}
        >
          {shortened ?? <ChunkedHex value={value} />}
        </Typography>
      </Tooltip>
      {showCopy && (
        <Tooltip title={copied ? "Copied" : `Copy ${noun}`}>
          <IconButton size="small" onClick={handleCopy} aria-label={`Copy ${noun}`}>
            {copied ? <CheckIcon sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
          </IconButton>
        </Tooltip>
      )}
      {showExplorer && explorer && explorerPath && (
        <Tooltip title="View on block explorer">
          <IconButton
            size="small"
            component="a"
            href={`${explorer}/${explorerPath}/${value}`}
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

export default HexValue;
