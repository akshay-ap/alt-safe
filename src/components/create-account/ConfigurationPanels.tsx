import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Accordion, AccordionDetails, AccordionSummary, Divider, Paper, Stack, Typography } from "@mui/material";
import type React from "react";
import { useCreateSafeContext } from "../../context/CreateSafeContext";
import FallbackHandlerPanel from "./panels/FallbackHandlerPanel";
import ModulesPanel from "./panels/ModulesPanel";
import NameLabelsPanel from "./panels/NameLabelsPanel";
import OwnersPanel from "./panels/OwnersPanel";
import SaltPanel from "./panels/SaltPanel";
import SingletonPanel from "./panels/SingletonPanel";
import VersionPanel from "./panels/VersionPanel";

/** Each panel renders its own heading; this only frames it. */
const Section: React.FC<{ children: React.ReactNode }> = ({ children }) => <Paper variant="outlined">{children}</Paper>;

const AdvancedSettings: React.FC = () => {
  const {
    singleton,
    setSingleton,
    singletonL2,
    setSingletonL2,
    useSingletonL2,
    setUseSingletonL2,
    salt,
    setSalt,
    fallbackHandler,
    setFallbackHandler,
  } = useCreateSafeContext();

  return (
    <Accordion variant="outlined" disableGutters sx={{ "&::before": { display: "none" } }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 3 }}>
        <div>
          <Typography variant="h6" component="h2">
            Advanced settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Singleton, salt nonce, modules and fallback handler. The defaults suit most Safes.
          </Typography>
        </div>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <Stack divider={<Divider />}>
          <SingletonPanel
            singleton={singleton}
            setSingleton={setSingleton}
            singletonL2={singletonL2}
            setSingletonL2={setSingletonL2}
            useSingletonL2={useSingletonL2}
            setUseSingletonL2={setUseSingletonL2}
          />
          <SaltPanel salt={salt} setSalt={setSalt} />
          <ModulesPanel />
          <FallbackHandlerPanel fallbackHandler={fallbackHandler} setFallbackHandler={setFallbackHandler} />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export const NameSection: React.FC = () => {
  const { safeName, setSafeName, safeLabels, setSafeLabels } = useCreateSafeContext();
  return (
    <Section>
      <NameLabelsPanel
        safeName={safeName}
        setSafeName={setSafeName}
        safeLabels={safeLabels}
        setSafeLabels={setSafeLabels}
      />
    </Section>
  );
};

const ConfigurationPanels: React.FC = () => {
  const { owners, setOwners, threshold, setThreshold } = useCreateSafeContext();

  return (
    <Stack spacing={2}>
      <Section>
        <VersionPanel />
      </Section>
      <Section>
        <OwnersPanel owners={owners} setOwners={setOwners} threshold={threshold} setThreshold={setThreshold} />
      </Section>
      <AdvancedSettings />
    </Stack>
  );
};

export default ConfigurationPanels;
