import { Grid, Stack } from "@mui/material";
import type React from "react";
import { useChainId, useChains } from "wagmi";
import { CreateSafeProvider } from "../../context/CreateSafeContext";
import PageHeader from "../common/PageHeader";
import ConfigurationPanels, { NameSection } from "./ConfigurationPanels";
import SafePreview from "./SafePreview";

const CreateSafe: React.FC = () => {
  const chainId = useChainId();
  const chainName = useChains().find((chain) => chain.id === chainId)?.name ?? "the selected network";

  return (
    <CreateSafeProvider>
      <PageHeader
        title="Create a Safe"
        description={`Deploys a new Safe on ${chainName} from your connected wallet.`}
      />
      <Grid container spacing={3} sx={{ alignItems: "flex-start" }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <ConfigurationPanels />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }} sx={{ position: { lg: "sticky" }, top: { lg: 80 } }}>
          <Stack spacing={2}>
            <NameSection />
            <SafePreview />
          </Stack>
        </Grid>
      </Grid>
    </CreateSafeProvider>
  );
};

export default CreateSafe;
