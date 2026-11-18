import { Typography } from "@mui/material";
import HexValue, { type HexValueSize } from "./HexValue";

interface TransactionHashProps {
  hash?: `0x${string}`;
  showExplorer?: boolean;
  explorerUrl?: string;
  short?: boolean;
  size?: HexValueSize;
  showCopy?: boolean;
}

const TransactionHash: React.FC<TransactionHashProps> = ({ hash, short = false, size = "medium", ...rest }) => {
  if (!hash) {
    return (
      <Typography component="span" variant="body2" sx={{ color: "text.secondary" }}>
        No transaction hash
      </Typography>
    );
  }
  return (
    <HexValue
      value={hash}
      noun="hash"
      explorerPath="tx"
      shortenTo={short ? { head: 10, tail: 8 } : undefined}
      size={size}
      {...rest}
    />
  );
};

export default TransactionHash;
