import { TextField } from "@mui/material";
import type React from "react";

interface TransactionHashInputProps {
  safeTransactionHash: string;
  setSafeTransactionHash: (hash: string) => void;
  isHashValid: boolean;
}

const TransactionHashInput: React.FC<TransactionHashInputProps> = ({
  safeTransactionHash,
  setSafeTransactionHash,
  isHashValid,
}) => {
  return (
    <TextField
      label="Transaction Hash"
      variant="outlined"
      fullWidth
      value={safeTransactionHash}
      onChange={(e) => setSafeTransactionHash(e.target.value)}
      placeholder="0x..."
      error={!isHashValid}
      helperText={!isHashValid ? "Invalid transaction hash. Must be a 32-byte string with 0x prefix." : ""}
      sx={{ marginBottom: 2 }}
    />
  );
};

export default TransactionHashInput;
