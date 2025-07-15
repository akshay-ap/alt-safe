import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { useState } from "react";

interface TransactionHashProps {
  hash?: `0x${string}`;
  showExplorer?: boolean;
  explorerUrl?: string;
  short?: boolean;
  size?: "small" | "medium" | "large";
  showCopy?: boolean;
}

const TransactionHash: React.FC<TransactionHashProps> = ({
  hash,
  showExplorer = false,
  explorerUrl,
  short = false,
  size = "medium",
  showCopy = true,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!hash) return;

    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenExplorer = () => {
    if (!hash || !explorerUrl) return;

    window.open(`${explorerUrl}/tx/${hash}`, "_blank");
  };

  const getFontSize = () => {
    switch (size) {
      case "small":
        return { fontSize: "0.75rem" };
      case "large":
        return { fontSize: "1rem" };
      default:
        return { fontSize: "0.875rem" };
    }
  };

  const formatHash = (hash: string) => {
    if (short) {
      return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
    }
    return hash;
  };

  if (!hash) {
    return (
      <Typography color="text.secondary" sx={getFontSize()}>
        No transaction hash
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", wordBreak: short ? "normal" : "break-all" }}>
      <Tooltip title={short ? hash : undefined} placement="top">
        <Typography sx={{ fontFamily: "monospace", ...getFontSize() }}>{formatHash(hash)}</Typography>
      </Tooltip>

      {(showCopy || (showExplorer && explorerUrl)) && (
        <Box sx={{ ml: 1, display: "flex" }}>
          {showCopy && (
            <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
              <IconButton size="small" onClick={handleCopy}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {showExplorer && explorerUrl && (
            <Tooltip title="View transaction on explorer">
              <IconButton size="small" onClick={handleOpenExplorer}>
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}
    </Box>
  );
};

export default TransactionHash;
