import {
  AccountBox as AccountBoxIcon,
  Extension as ExtensionIcon,
  Label as LabelIcon,
  Numbers as NumbersIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type React from "react";
import { Fragment, useState } from "react";
import type { Address } from "viem";
import FallbackHandlerPanel from "./panels/FallbackHandlerPanel";
import ModulesPanel from "./panels/ModulesPanel";
import NameLabelsPanel from "./panels/NameLabelsPanel";
import OwnersPanel from "./panels/OwnersPanel";
import SaltPanel from "./panels/SaltPanel";
import SingletonPanel from "./panels/SingletonPanel";

export interface ConfigurationPanelsProps {
  // Name and Labels
  safeName: string;
  setSafeName: (name: string) => void;
  safeLabels: string[];
  setSafeLabels: (labels: string[]) => void;

  // Singleton
  singleton: string;
  setSingleton: (singleton: string) => void;
  singletonL2: string;
  setSingletonL2: (singletonL2: string) => void;
  useSingletonL2: boolean;
  setUseSingletonL2: (useSingletonL2: boolean) => void;

  // Owners
  owners: Address[];
  setOwners: (owners: Address[]) => void;
  threshold: number;
  setThreshold: (threshold: number) => void;

  // Salt
  salt: bigint;
  setSalt: (salt: bigint) => void;

  // Modules (placeholder for future implementation)
  modules: Address[];
  setModules: (modules: Address[]) => void;
  setupModulesAddress: Address;
  setSetupModulesAddress: (address: Address) => void;

  // Fallback Handler
  fallbackHandler: Address;
  setFallbackHandler: (handler: Address) => void;
}

export enum ConfigurationSection {
  NAME_LABELS = "name-labels",
  SINGLETON = "singleton",
  OWNERS = "owners",
  SALT = "salt",
  MODULES = "modules",
  FALLBACK_HANDLER = "fallback-handler",
}

const NAVIGATION_ITEMS = [
  {
    id: ConfigurationSection.NAME_LABELS,
    label: "Name & Labels",
    icon: <LabelIcon />,
  },
  {
    id: ConfigurationSection.SINGLETON,
    label: "Singleton Address",
    icon: <SettingsIcon />,
  },
  {
    id: ConfigurationSection.OWNERS,
    label: "Owners & Threshold",
    icon: <AccountBoxIcon />,
  },
  {
    id: ConfigurationSection.SALT,
    label: "Salt",
    icon: <NumbersIcon />,
  },
  {
    id: ConfigurationSection.MODULES,
    label: "Modules",
    icon: <ExtensionIcon />,
  },
  {
    id: ConfigurationSection.FALLBACK_HANDLER,
    label: "Fallback Handler",
    icon: <SecurityIcon />,
  },
];

const ConfigurationPanels: React.FC<ConfigurationPanelsProps> = (props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [activeSection, setActiveSection] = useState<ConfigurationSection>(ConfigurationSection.NAME_LABELS);

  const handleTabChange = (_: React.SyntheticEvent, newValue: ConfigurationSection) => {
    setActiveSection(newValue);
  };

  const renderActivePanel = () => {
    switch (activeSection) {
      case ConfigurationSection.NAME_LABELS:
        return (
          <NameLabelsPanel
            safeName={props.safeName}
            setSafeName={props.setSafeName}
            safeLabels={props.safeLabels}
            setSafeLabels={props.setSafeLabels}
          />
        );
      case ConfigurationSection.SINGLETON:
        return (
          <SingletonPanel
            singleton={props.singleton}
            setSingleton={props.setSingleton}
            singletonL2={props.singletonL2}
            setSingletonL2={props.setSingletonL2}
            useSingletonL2={props.useSingletonL2}
            setUseSingletonL2={props.setUseSingletonL2}
          />
        );
      case ConfigurationSection.OWNERS:
        return (
          <OwnersPanel
            owners={props.owners}
            setOwners={props.setOwners}
            threshold={props.threshold}
            setThreshold={props.setThreshold}
          />
        );
      case ConfigurationSection.SALT:
        return <SaltPanel salt={props.salt} setSalt={props.setSalt} />;
      case ConfigurationSection.MODULES:
        return (
          <ModulesPanel
            modules={props.modules}
            setModules={props.setModules}
            setupModulesAddress={props.setupModulesAddress}
            setSetupModulesAddress={props.setSetupModulesAddress}
          />
        );
      case ConfigurationSection.FALLBACK_HANDLER:
        return (
          <FallbackHandlerPanel fallbackHandler={props.fallbackHandler} setFallbackHandler={props.setFallbackHandler} />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}>
      {/* Navigation - Tabs on mobile, List on desktop */}
      {isMobile ? (
        <Paper sx={{ mb: 2 }}>
          <Tabs
            value={activeSection}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            {NAVIGATION_ITEMS.map((item) => (
              <Tab
                key={item.id}
                label={item.label}
                value={item.id}
                icon={item.icon}
                iconPosition="start"
                sx={{ minHeight: 48, textTransform: "none" }}
              />
            ))}
          </Tabs>
        </Paper>
      ) : (
        <Paper
          elevation={1}
          sx={{
            width: { xs: "100%", md: 280 },
            minHeight: { xs: "auto", md: "600px" },
            borderRadius: 1,
            overflow: "hidden",
            mb: { xs: 2, md: 0 },
          }}
        >
          <Box sx={{ p: 2, bgcolor: "primary.main", color: "primary.contrastText" }}>
            <Typography variant="h6" fontWeight="bold">
              Configuration
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Customize your Safe settings
            </Typography>
          </Box>

          <List disablePadding>
            {NAVIGATION_ITEMS.map((item, index) => (
              <Fragment key={item.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={activeSection === item.id}
                    onClick={() => setActiveSection(item.id)}
                    sx={{
                      py: 1.5,
                      "&.Mui-selected": {
                        bgcolor: "primary.light",
                        color: "primary.contrastText",
                        "& .MuiListItemIcon-root": {
                          color: "primary.contrastText",
                        },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} primaryTypographyProps={{ variant: "body2", fontWeight: 500 }} />
                  </ListItemButton>
                </ListItem>
                {index < NAVIGATION_ITEMS.length - 1 && <Divider />}
              </Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Content Panel */}
      <Box sx={{ flex: 1, ml: { xs: 0, md: 2 }, minWidth: 0 }}>
        <Paper
          elevation={1}
          sx={{
            height: "100%",
            minHeight: { xs: "400px", md: "600px" },
            borderRadius: 1,
            overflow: "auto",
          }}
        >
          {renderActivePanel()}
        </Paper>
      </Box>
    </Box>
  );
};

export default ConfigurationPanels;
