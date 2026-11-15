import { Typography } from "@mui/material";
import { zeroAddress } from "viem";
import HexValue, { type HexValueSize } from "./HexValue";

interface AccountAddressProps {
  address?: `0x${string}`;
  showExplorer?: boolean;
  explorerUrl?: string;
  short?: boolean;
  size?: HexValueSize;
  showCopy?: boolean;
}

const AccountAddress: React.FC<AccountAddressProps> = ({ address, short = false, size = "medium", ...rest }) => {
  // A plain comparison: this also renders values that are not valid addresses, which isAddressEqual would throw on.
  if (!address || address.toLowerCase() === zeroAddress) {
    return (
      <Typography component="span" variant="body2" sx={{ color: "text.secondary" }}>
        {address ? "Zero address" : "Not set"}
      </Typography>
    );
  }
  return (
    <HexValue
      value={address}
      noun="address"
      explorerPath="address"
      shortenTo={short ? { head: 6, tail: 4 } : undefined}
      size={size}
      {...rest}
    />
  );
};

export default AccountAddress;
