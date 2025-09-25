import { Box, Button, TextField, Typography } from "@mui/material";
import React, { useState } from "react";

interface TransactionParamsFormProps {
  onSave?: (params: TransactionParams) => void;
}

export interface TransactionParams {
  nonce?: string;
  gasLimit?: string;
  refundTokenAddress?: string;
  refundTokenAmount?: string;
  refundToAddress?: string;
}

const TransactionParamsForm: React.FC<TransactionParamsFormProps> = ({ onSave }) => {
  const [nonce, setNonce] = useState<string>("");
  const [gasLimit, setGasLimit] = useState<string>("");
  const [refundTokenAddress, setRefundTokenAddress] = useState<string>("");
  const [refundTokenAmount, setRefundTokenAmount] = useState<string>("");
  const [refundToAddress, setRefundToAddress] = useState<string>("");

  const handleSave = () => {
    const params: TransactionParams = {
      nonce: nonce.trim() || undefined,
      gasLimit: gasLimit.trim() || undefined,
      refundTokenAddress: refundTokenAddress.trim() || undefined,
      refundTokenAmount: refundTokenAmount.trim() || undefined,
      refundToAddress: refundToAddress.trim() || undefined,
    };
    
    onSave?.(params);
  };

  const handleReset = () => {
    setNonce("");
    setGasLimit("");
    setRefundTokenAddress("");
    setRefundTokenAmount("");
    setRefundToAddress("");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }} id="transaction-params-form">
      <Typography variant="h6" gutterBottom id="transaction-params-title">
        Transaction Defaults
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} id="transaction-params-description">
        Configure default parameters that will be applied to all transactions. Leave fields empty to use automatic values.
      </Typography>
      
      <TextField
        id="nonce-input"
        fullWidth
        label="Nonce"
        value={nonce}
        onChange={(e) => setNonce(e.target.value)}
        placeholder="Leave empty for automatic nonce"
        size="small"
        helperText="Override the transaction nonce. Leave empty for automatic calculation."
      />
      
      <TextField
        id="gas-limit-input"
        fullWidth
        label="Gas Limit"
        value={gasLimit}
        onChange={(e) => setGasLimit(e.target.value)}
        placeholder="Leave empty for automatic estimation"
        size="small"
        helperText="Set a custom gas limit. Leave empty for automatic gas estimation."
      />
      
      <TextField
        id="refund-token-address-input"
        fullWidth
        label="Refund Token Address"
        value={refundTokenAddress}
        onChange={(e) => setRefundTokenAddress(e.target.value)}
        placeholder="0x... (default: ETH)"
        size="small"
        helperText="Token address for transaction fee refunds. Default is ETH (0x0000000000000000000000000000000000000000)."
      />
      
      <TextField
        id="refund-token-amount-input"
        fullWidth
        label="Refund Token Amount"
        value={refundTokenAmount}
        onChange={(e) => setRefundTokenAmount(e.target.value)}
        placeholder="0"
        size="small"
        helperText="Maximum amount of refund tokens to pay for transaction fees."
      />
      
      <TextField
        id="refund-to-address-input"
        fullWidth
        label="Refund To Address"
        value={refundToAddress}
        onChange={(e) => setRefundToAddress(e.target.value)}
        placeholder="0x... (default: tx.origin)"
        size="small"
        helperText="Address to receive transaction fee refunds. Default is the transaction originator."
      />

      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
        <Button
          id="save-params-button"
          variant="contained"
          color="primary"
          onClick={handleSave}
          sx={{ flex: 1 }}
        >
          Save Defaults
        </Button>
        
        <Button
          id="reset-params-button"
          variant="outlined"
          color="secondary"
          onClick={handleReset}
          sx={{ flex: 1 }}
        >
          Reset
        </Button>
      </Box>
    </Box>
  );
};

export default TransactionParamsForm;