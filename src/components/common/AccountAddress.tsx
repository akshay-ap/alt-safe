import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import { isAddressEqual, zeroAddress } from "viem";

interface AccountAddressProps {
  address?: `0x${string}`;
  showExplorer?: boolean;
  explorerUrl?: string;
  short?: boolean;
  size?: "small" | "medium" | "large";
  showCopy?: boolean; // New prop to control copy icon visibility
}

const AccountAddress: React.FC<AccountAddressProps> = ({
  address,
  showExplorer = false,
  explorerUrl,
  short = false,
  size = "medium",
  showCopy = true, // Default to showing the copy icon
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!address) return;

    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenExplorer = () => {
    if (!address || !explorerUrl) return;

    window.open(`${explorerUrl}/address/${address}`, "_blank");
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

  const formatAddress = (address: string) => {
    if (short) {
      // Get first 6 chars (0x + 2 bytes) and last 4 chars (2 bytes)
      return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }
    return address;
  };

  if (!address || isAddressEqual(address, zeroAddress)) {
    return (
      <Typography color="text.secondary" sx={getFontSize()}>
        {address === zeroAddress ? "0x0...0000 (Zero Address)" : "Not set"}
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", wordBreak: short ? "normal" : "break-all" }}>
      <Tooltip title={short ? address : undefined} placement="top">
        <Typography sx={{ fontFamily: "monospace", ...getFontSize() }}>{formatAddress(address)}</Typography>
      </Tooltip>

      {/* Only show this Box if at least one of the buttons is visible */}
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
            <Tooltip title="View on explorer">
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

export default AccountAddress;
