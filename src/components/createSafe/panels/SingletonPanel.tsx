import { Alert, Box, Button, Checkbox, Chip, FormControlLabel, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import type React from "react";
import AddressInput from "../../common/AddressInput";

interface SingletonPanelProps {
  singleton: string;
  setSingleton: (singleton: string) => void;
  singletonL2: string;
  setSingletonL2: (singletonL2: string) => void;
  useSingletonL2: boolean;
  setUseSingletonL2: (useSingletonL2: boolean) => void;
}

const SingletonPanel: React.FC<SingletonPanelProps> = ({
  singleton,
  setSingleton,
  singletonL2,
  setSingletonL2,
  useSingletonL2,
  setUseSingletonL2,
}) => {
  // Get default values from environment variables
  const defaultSingleton = import.meta.env.VITE_SINGLETON_ADDRESS || "";
  const defaultSingletonL2 = import.meta.env.VITE_SINGLETON_L2_ADDRESS || "";

  const resetToDefaults = () => {
    setSingleton(defaultSingleton);
    setSingletonL2(defaultSingletonL2);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h6" gutterBottom>
        Singleton Address Configuration
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure the Safe singleton address that contains the Safe contract logic. L2 singleton is optimized for Layer
        2 networks.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Singleton Address:</strong> The master copy contract that contains the Safe logic. All Safe proxies
          delegate calls to this address.
        </Typography>
      </Alert>

      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        <Chip label={`Default Singleton: ${defaultSingleton.slice(0, 10)}...`} variant="outlined" size="small" />
        <Chip label={`Default L2: ${defaultSingletonL2.slice(0, 10)}...`} variant="outlined" size="small" />
      </Stack>

      <Grid container spacing={3}>
        <Grid size={12}>
          <FormControlLabel
            control={<Checkbox checked={useSingletonL2} onChange={(e) => setUseSingletonL2(e.target.checked)} />}
            label="Use Singleton L2 (Optimized for Layer 2 networks)"
          />
        </Grid>

        <Grid size={12}>
          {useSingletonL2 ? (
            <AddressInput
              label="Singleton L2 Address"
              value={singletonL2}
              onChange={setSingletonL2}
              helperText="Layer 2 singleton contract address"
              allowEmpty={false}
            />
          ) : (
            <AddressInput
              label="Singleton Address"
              value={singleton}
              onChange={setSingleton}
              helperText="Standard singleton contract address"
              allowEmpty={false}
            />
          )}
        </Grid>
      </Grid>

      <Button variant="outlined" onClick={resetToDefaults}>
        Reset to Default
      </Button>
    </Box>
  );
};

export default SingletonPanel;
