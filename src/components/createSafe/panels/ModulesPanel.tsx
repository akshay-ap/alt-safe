import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  FormGroup,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import type React from "react";
import { useState } from "react";
import type { Address } from "viem";
import { isAddress } from "viem";
import { useCreateSafeContext } from "../../../context/CreateSafeContext";
import AddressInput from "../../common/AddressInput";

const ModulesPanel: React.FC = () => {
  const { modules, setModules, setupModulesAddress, setSetupModulesAddress, defaultModules } = useCreateSafeContext();

  const [newModuleAddress, setNewModuleAddress] = useState<string>("");
  const [isValidAddress, setIsValidAddress] = useState<boolean>(false);
  const [selectedDefaultModules, setSelectedDefaultModules] = useState<Address[]>([]);

  const handleAddModule = () => {
    if (isValidAddress && isAddress(newModuleAddress) && !modules.includes(newModuleAddress as Address)) {
      setModules([...modules, newModuleAddress as Address]);
      setNewModuleAddress("");
    }
  };

  const handleRemoveModule = (index: number) => {
    const updatedModules = modules.filter((_, i) => i !== index);
    setModules(updatedModules);
  };

  const handleDefaultModuleToggle = (moduleAddress: Address) => {
    setSelectedDefaultModules((prev) => {
      if (prev.includes(moduleAddress)) {
        return prev.filter((addr) => addr !== moduleAddress);
      }
      return [...prev, moduleAddress];
    });
  };

  const handleAddSelectedDefaultModules = () => {
    const newModules = selectedDefaultModules.filter((addr) => !modules.includes(addr));
    if (newModules.length > 0) {
      setModules([...modules, ...newModules]);
      setSelectedDefaultModules([]);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h6" gutterBottom>
        Modules Configuration
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Modules are contracts that can execute transactions on behalf of the Safe. They extend Safe functionality but
        should be used with caution.
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Security Warning:</strong> Modules have full control over your Safe. Only add modules from trusted
          sources and that you fully understand.
        </Typography>
      </Alert>

      {/* Default Modules Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Default Modules
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select from pre-configured trusted modules
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <FormGroup>
            {defaultModules.map((module) => (
              <FormControlLabel
                key={module.address}
                control={
                  <Checkbox
                    checked={selectedDefaultModules.includes(module.address)}
                    onChange={() => handleDefaultModuleToggle(module.address)}
                    disabled={modules.includes(module.address)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {module.name}
                    </Typography>
                    <Typography variant="caption" fontFamily="monospace" color="text.secondary">
                      {module.address}
                    </Typography>
                    {modules.includes(module.address) && (
                      <Chip size="small" label="Already Added" color="success" sx={{ ml: 1 }} />
                    )}
                  </Box>
                }
              />
            ))}
          </FormGroup>
          {selectedDefaultModules.length > 0 && (
            <Button
              variant="contained"
              onClick={handleAddSelectedDefaultModules}
              sx={{ mt: 2 }}
              startIcon={<AddCircleOutlineIcon />}
            >
              Add Selected ({selectedDefaultModules.length})
            </Button>
          )}
        </Paper>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Setup Modules Contract Address
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Contract address for setting up modules during Safe creation
        </Typography>
        <AddressInput
          label="Setup Modules Address"
          value={setupModulesAddress}
          onChange={(value) => setSetupModulesAddress(value as Address)}
          showAddressBook={true}
          helperText="Contract address for module setup"
          allowEmpty={true}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Add Module
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <AddressInput
            label="Module Address"
            value={newModuleAddress}
            onChange={setNewModuleAddress}
            showAddressBook={true}
            helperText="Enter a valid contract address"
            allowEmpty={false}
            onValidationChange={setIsValidAddress}
          />
        </Box>
      </Box>

      <Button
        sx={{ mb: 2 }}
        variant="contained"
        onClick={handleAddModule}
        disabled={!isValidAddress || modules.includes(newModuleAddress as Address)}
        startIcon={<AddCircleOutlineIcon />}
      >
        Add
      </Button>

      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Configured Modules ({modules.length})
        </Typography>

        {modules.length === 0 ? (
          <Alert severity="info">No modules configured. Your Safe will use only basic multisig functionality.</Alert>
        ) : (
          <List>
            {modules.map((module) => (
              <ListItem
                key={module}
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: "background.paper",
                }}
                secondaryAction={
                  <IconButton edge="end" onClick={() => handleRemoveModule(modules.indexOf(module))} color="error">
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip label={`Module ${modules.indexOf(module) + 1}`} size="small" />
                      <Typography variant="body2" fontFamily="monospace">
                        {module}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default ModulesPanel;
