import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import type React from "react";
import type { Address } from "viem";
import AddressInput from "../../common/AddressInput";

interface FallbackHandlerPanelProps {
  fallbackHandler: Address;
  setFallbackHandler: (handler: Address) => void;
}

const FallbackHandlerPanel: React.FC<FallbackHandlerPanelProps> = ({ fallbackHandler, setFallbackHandler }) => {
  // Get default values from environment variables
  const defaultFallbackHandler = import.meta.env.VITE_FALLBACK_HANDLER_ADDRESS || "";

  const resetToDefault = () => {
    setFallbackHandler(defaultFallbackHandler as Address);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h6" gutterBottom>
        Fallback Handler Configuration
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure the fallback handler that processes calls to function selectors that Safe Singleton does not support.
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        <Chip label={`Default: ${defaultFallbackHandler}`} variant="outlined" size="small" />
      </Stack>

      <AddressInput
        label="Fallback Handler Address"
        value={fallbackHandler}
        onChange={(value) => setFallbackHandler(value as Address)}
        helperText="Contract address that handles unknown function calls"
        sx={{ mb: 2 }}
      />

      <Button variant="outlined" onClick={resetToDefault}>
        Reset to Default
      </Button>
    </Box>
  );
};

export default FallbackHandlerPanel;
