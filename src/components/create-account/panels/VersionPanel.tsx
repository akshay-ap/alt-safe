import { Box, Chip, CircularProgress, FormControlLabel, Radio, RadioGroup, Stack, Typography } from "@mui/material";
import type React from "react";
import { useChainId, useChains } from "wagmi";
import { useCreateSafeContext } from "../../../context/CreateSafeContext";
import { DEFAULT_SAFE_VERSION, SAFE_VERSIONS } from "../../../safe-contracts/addresses/addresses";
import type { DeploymentOption, DeploymentOptionId } from "../../../safe-contracts/deploymentOptions";
import { useDeploymentAvailability } from "../../../safe-contracts/useDeploymentAvailability";

const describeOption = (id: DeploymentOptionId): string => {
  if (id === SAFE_VERSIONS[0]) return "Latest release.";
  if (id === DEFAULT_SAFE_VERSION) return "The version ALT Safe has used so far.";
  return "Older release, for compatibility with existing tooling.";
};

const AvailabilityChip: React.FC<{ available: boolean | undefined; chainName: string }> = ({
  available,
  chainName,
}) => {
  if (available === undefined) return <CircularProgress size={14} aria-label="Checking deployment" />;
  return available ? (
    <Chip size="small" color="success" variant="outlined" label="Deployed" />
  ) : (
    <Chip size="small" color="warning" variant="outlined" label={`Not on ${chainName}`} />
  );
};

const OptionLabel: React.FC<{ option: DeploymentOption; available: boolean | undefined; chainName: string }> = ({
  option,
  available,
  chainName,
}) => (
  <Box sx={{ py: 1 }}>
    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
      <Typography variant="subtitle2">{option.label}</Typography>
      {option.id === DEFAULT_SAFE_VERSION && <Chip size="small" label="Default" />}
      <AvailabilityChip available={available} chainName={chainName} />
    </Stack>
    <Typography variant="body2" color="text.secondary">
      {describeOption(option.id)}
    </Typography>
  </Box>
);

const VersionPanel: React.FC = () => {
  const { deploymentOptions, deploymentId, setDeploymentId } = useCreateSafeContext();
  const availability = useDeploymentAvailability(deploymentOptions);
  const chainId = useChainId();
  const chainName = useChains().find((chain) => chain.id === chainId)?.name ?? "this network";

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h6" gutterBottom>
        Safe version
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        The contract version your new Safe runs. Switching version resets the singleton, proxy factory and fallback
        handler to that version's official addresses.
      </Typography>
      <RadioGroup
        value={deploymentId}
        onChange={(event) => setDeploymentId(event.target.value as DeploymentOptionId)}
        aria-label="Safe version"
      >
        {deploymentOptions.map((option) => (
          <FormControlLabel
            key={option.id}
            value={option.id}
            control={<Radio />}
            disabled={availability[option.id] === false}
            label={<OptionLabel option={option} available={availability[option.id]} chainName={chainName} />}
          />
        ))}
      </RadioGroup>
    </Box>
  );
};

export default VersionPanel;
