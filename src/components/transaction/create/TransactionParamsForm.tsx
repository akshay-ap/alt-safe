import { Box, Button, TextField, Typography } from "@mui/material";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import type { Address } from "viem";
import { useCreateTransactionContext } from "../../../context/CreateTransactionContext";

const TransactionParamsForm: React.FC = () => {
  const {
    nonce,
    gasPrice,
    baseGas,
    safeTxGas,
    refundTokenAddress,
    refundToAddress,
    setNonce,
    setGasPrice,
    setSafeTxGas,
    setBaseGas,
    setRefundToAddress,
    setRefundTokenAddress,
  } = useCreateTransactionContext();

  const [newNonce, setNewNonce] = useState<bigint>(nonce);
  const [newGasPrice, setNewGasPrice] = useState<bigint>(gasPrice);
  const [newBaseGas, setNewBaseGas] = useState<bigint>(baseGas);
  const [newSafeTxGas, setNewSafeTxGas] = useState<bigint>(safeTxGas);
  const [newRefundTokenAddress, setNewRefundTokenAddress] = useState<Address>(refundTokenAddress);
  const [newRefundToAddress, setNewRefundToAddress] = useState<Address>(refundToAddress);

  // Track if user has manually edited fields
  const hasUserEditedNonce = useRef(false);
  const hasUserEditedGasPrice = useRef(false);
  const hasUserEditedBaseGas = useRef(false);
  const hasUserEditedSafeTxGas = useRef(false);

  // Only sync with context if user hasn't manually edited
  useEffect(() => {
    if (!hasUserEditedNonce.current) {
      setNewNonce(nonce);
    }
  }, [nonce]);

  useEffect(() => {
    if (!hasUserEditedGasPrice.current) {
      setNewGasPrice(gasPrice);
    }
  }, [gasPrice]);

  useEffect(() => {
    if (!hasUserEditedBaseGas.current) {
      setNewBaseGas(baseGas);
    }
  }, [baseGas]);

  useEffect(() => {
    if (!hasUserEditedSafeTxGas.current) {
      setNewSafeTxGas(safeTxGas);
    }
  }, [safeTxGas]);

  useEffect(() => {
    setNewRefundTokenAddress(refundTokenAddress);
  }, [refundTokenAddress]);

  useEffect(() => {
    setNewRefundToAddress(refundToAddress);
  }, [refundToAddress]);

  const handleSave = () => {
    setNonce(newNonce);
    setGasPrice(newGasPrice);
    setSafeTxGas(newSafeTxGas);
    setBaseGas(newBaseGas);
    setRefundTokenAddress(newRefundTokenAddress);
    setRefundToAddress(newRefundToAddress);

    // Reset edit flags after saving
    hasUserEditedNonce.current = false;
    hasUserEditedGasPrice.current = false;
    hasUserEditedBaseGas.current = false;
    hasUserEditedSafeTxGas.current = false;
  };

  const handleNonceChange = (value: string) => {
    hasUserEditedNonce.current = true;
    setNewNonce(BigInt(value));
  };

  const handleGasPriceChange = (value: string) => {
    hasUserEditedGasPrice.current = true;
    setNewGasPrice(BigInt(value));
  };

  const handleBaseGasChange = (value: string) => {
    hasUserEditedBaseGas.current = true;
    setNewBaseGas(BigInt(value));
  };

  const handleSafeTxGasChange = (value: string) => {
    hasUserEditedSafeTxGas.current = true;
    setNewSafeTxGas(BigInt(value));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }} id="transaction-params-form">
      <Typography variant="h6" gutterBottom id="transaction-params-title">
        Transaction Defaults
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} id="transaction-params-description">
        Configure default parameters that will be applied to all transactions. Leave fields empty to use automatic
        values.
      </Typography>

      <TextField
        id="nonce-input"
        fullWidth
        label="Nonce"
        value={newNonce.toString()}
        onChange={(e) => handleNonceChange(e.target.value)}
        size="small"
        helperText="Set custom nonce."
      />

      <TextField
        id="gas-price-input"
        fullWidth
        label="Gas Price"
        value={newGasPrice.toString()}
        onChange={(e) => handleGasPriceChange(e.target.value)}
        size="small"
        helperText="Set a custom gas price."
      />

      <TextField
        id="base-gas-input"
        fullWidth
        label="Base gas"
        value={newBaseGas.toString()}
        onChange={(e) => handleBaseGasChange(e.target.value)}
        size="small"
        helperText="Set a custom base gas."
      />

      <TextField
        id="safeTx-gas-input"
        fullWidth
        label="Safe Tx gas"
        value={newSafeTxGas.toString()}
        onChange={(e) => handleSafeTxGasChange(e.target.value)}
        size="small"
        helperText="Set a custom safeTx gas."
      />

      <TextField
        id="refund-token-address-input"
        fullWidth
        label="Refund Token Address"
        value={newRefundTokenAddress}
        onChange={(e) => setNewRefundTokenAddress(e.target.value as Address)}
        placeholder="0x... (default: ETH)"
        size="small"
        helperText="Token address for transaction fee refunds. Default is ETH (0x0000000000000000000000000000000000000000)."
      />

      <TextField
        id="refund-to-address-input"
        fullWidth
        label="Refund To Address"
        value={newRefundToAddress}
        onChange={(e) => setNewRefundToAddress(e.target.value as Address)}
        placeholder="0x... (default: tx.origin)"
        size="small"
        helperText="Address to receive transaction fee refunds. Default is the transaction originator."
      />

      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
        <Button id="save-params-button" variant="contained" color="primary" onClick={handleSave} sx={{ flex: 1 }}>
          Save
        </Button>
      </Box>
    </Box>
  );
};

export default TransactionParamsForm;
