import { Box, Chip, FormControlLabel, Radio, RadioGroup, Stack, Typography } from "@mui/material";
import type React from "react";
import { useChainId, useChains } from "wagmi";
import { useCreateSafeContext } from "../../../context/CreateSafeContext";
import { DEFAULT_SAFE_VERSION } from "../../../safe-contracts/addresses/addresses";
import type { DeploymentOption, DeploymentOptionId } from "../../../safe-contracts/deploymentOptions";
import { useDeploymentAvailability } from "../../../safe-contracts/useDeploymentAvailability";

const OptionLabel: React.FC<{ option: DeploymentOption; available: boolean | undefined; chainName: string }> = ({
  option,
}) => (
  <Box sx={{ py: 1 }}>
    <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 0.5 }}>
      <Typography variant="subtitle2">{option.label}</Typography>
      {option.id === DEFAULT_SAFE_VERSION && <Chip size="small" label="Default" />}
    </Stack>
  </Box>
);

const VersionPanel: React.FC = () => {
  const { deploymentOptions, deploymentId, setDeploymentId } = useCreateSafeContext();
  const availability = useDeploymentAvailability(deploymentOptions);
  const chainId = useChainId();
  const chainName = useChains().find((chain) => chain.id === chainId)?.name ?? "this network";

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h6" component="h2">
        Safe version
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Switching version resets the singleton, proxy factory and fallback handler to that version's addresses.
      </Typography>
      <RadioGroup
        value={deploymentId}
        onChange={(event) => setDeploymentId(event.target.value as DeploymentOptionId)}
        aria-label="Safe version"
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: { xs: "1fr", md: `repeat(${deploymentOptions.length}, minmax(0, 1fr))` },
        }}
      >
        {deploymentOptions.map((option) => (
          <FormControlLabel
            key={option.id}
            value={option.id}
            sx={{
              m: 0,
              pr: 1.5,
              alignItems: "flex-start",
              border: 1,
              borderRadius: 1.5,
              borderColor: option.id === deploymentId ? "primary.main" : "divider",
            }}
            control={<Radio sx={{ mt: 0.5 }} />}
            disabled={availability[option.id] === false}
            label={<OptionLabel option={option} available={availability[option.id]} chainName={chainName} />}
          />
        ))}
      </RadioGroup>
    </Box>
  );
};

export default VersionPanel;
