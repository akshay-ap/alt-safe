import { Alert, Box, Button, Card, CardContent, Chip, Link, Paper, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useNavigate } from "react-router-dom";
import type { Address } from "viem";
import { zeroAddress } from "viem";
import AccountAddress from "../common/AccountAddress";

interface SafePreviewProps {
  safeName: string;
  safeLabels: string[];
  owners: Address[];
  threshold: number;
  salt: bigint;
  modules: Address[];
  setupModulesAddress: Address;
  proxyAddress?: Address;
  isAlreadyDeployed: boolean;
  error?: string;
  safeCreationTxHash?: string;
  onCreateSafe: () => void;
  isCreating: boolean;
}

const SafePreview: React.FC<SafePreviewProps> = ({
  safeName,
  safeLabels,
  owners,
  threshold,
  salt,
  modules,
  setupModulesAddress,
  proxyAddress,
  isAlreadyDeployed,
  error,
  safeCreationTxHash,
  onCreateSafe,
  isCreating,
}) => {
  const navigate = useNavigate();

  return (
    <Paper sx={{ p: { xs: 2, md: 3 }, mb: { xs: 2, md: 3 } }}>
      <Typography variant="h6" gutterBottom>
        Safe Preview
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Configuration Summary
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">
                Name
              </Typography>
              <Typography variant="body1">{safeName || "Unnamed Safe"}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">
                Owners
              </Typography>
              <Typography variant="body1">{owners.length}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">
                Threshold
              </Typography>
              <Typography variant="body1">
                {threshold} out of {owners.length}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">
                Salt
              </Typography>
              <Typography variant="body1">{salt.toString()}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">
                Modules
              </Typography>
              <Typography variant="body1">{modules.length > 0 ? `${modules.length} enabled` : "None"}</Typography>
            </Grid>
          </Grid>

          {safeLabels.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Labels
              </Typography>
              <Typography variant="body1">{safeLabels.join(", ")}</Typography>
            </Box>
          )}

          {modules.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Enabled Modules
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {setupModulesAddress && setupModulesAddress !== zeroAddress && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Setup Contract:
                    </Typography>
                    <Typography variant="body2" fontFamily="monospace" sx={{ wordBreak: "break-all" }}>
                      {setupModulesAddress}
                    </Typography>
                  </Box>
                )}
                {modules.map((moduleAddress, index) => (
                  <Box key={moduleAddress} sx={{ mb: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <Chip label={`Module ${index + 1}`} size="small" variant="outlined" />
                    </Box>
                    <Typography variant="body2" fontFamily="monospace" sx={{ wordBreak: "break-all", pl: 1 }}>
                      {moduleAddress}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {proxyAddress && (
        <Box
          sx={{
            mb: 3,
            p: 2,
            bgcolor: "background.paper",
            borderRadius: 1,
            border: 1,
            borderColor: "divider",
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Deployment Address
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Your Safe will be deployed at:
          </Typography>
          <Typography variant="body1">
            <AccountAddress address={proxyAddress} />
          </Typography>
        </Box>
      )}

      {isAlreadyDeployed && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Safe already deployed with given configuration at address {proxyAddress}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {safeCreationTxHash && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body2">Safe creation transaction submitted: {safeCreationTxHash}</Typography>
          <Box sx={{ mt: 1 }}>
            <Link component="button" onClick={() => navigate("/home")} sx={{ fontWeight: 500 }}>
              Go to home to start using Safe
            </Link>
          </Box>
        </Alert>
      )}

      <Button
        variant="contained"
        onClick={onCreateSafe}
        disabled={isAlreadyDeployed || safeCreationTxHash !== undefined || isCreating}
        fullWidth
        size="large"
        sx={{ mt: 2 }}
      >
        {isCreating ? "Creating Safe..." : "Create Safe"}
      </Button>
    </Paper>
  );
};

export default SafePreview;
