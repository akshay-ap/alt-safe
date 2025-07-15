import DeleteIcon from "@mui/icons-material/Delete";
import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import type React from "react";
import { useEffect, useState } from "react";
import type { Address } from "viem";
import { STORAGE_KEY } from "../constants";
import { type CustomDeployment, useSafeWalletContext } from "../context/WalletContext";
import { type SafeDeployment, canonicalAddresses_141 } from "../safe-contracts/addresses/addresses";
import { config } from "../wagmi";
import Title from "./common/Title";

const AddCustomDeployment: React.FC = () => {
  const [chainId, setChainId] = useState<number | "">("");
  const [singleton, setSingleton] = useState<Address>(canonicalAddresses_141.singleton);
  const [singletonL2, setSingletonL2] = useState<Address>(canonicalAddresses_141.singletonL2);
  const [proxyFactory, setProxyFactory] = useState<Address>(canonicalAddresses_141.proxyFactory);
  const [multisend, setMultisend] = useState<Address>(canonicalAddresses_141.multiSend);
  const [multisendCallOnly, setMultisendCallOnly] = useState<Address>(canonicalAddresses_141.multiSendCallOnly);
  const [fallbackHandler, setFallbackHandler] = useState<Address>(canonicalAddresses_141.fallbackHandler);
  const [customDeployments, setCustomDeployments] = useState<CustomDeployment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { storage } = useSafeWalletContext();

  useEffect(() => {
    (async () => {
      const storedDeployments = (await storage.getItem(STORAGE_KEY.CUSTOM_DEPLOYMENTS)) as CustomDeployment[];
      setCustomDeployments(storedDeployments || []);
    })();
  }, [storage]);

  const handleSubmit = async () => {
    if (!chainId) return;

    if (customDeployments.some((deployment) => deployment.chainId === chainId)) {
      setError("A deployment with this Chain ID already exists.");
      return;
    }

    if (singleton && singletonL2 && proxyFactory && multisend && multisendCallOnly && fallbackHandler) {
      const deployment: SafeDeployment = {
        singleton: singleton,
        singletonL2: singletonL2,
        proxyFactory: proxyFactory,
        fallbackHandler: fallbackHandler,
        multiSend: multisend,
        multiSendCallOnly: multisendCallOnly,
      };

      const newCustomDeployment = { chainId: chainId as number, deployment };
      const updatedDeployments = [...customDeployments, newCustomDeployment];
      await storage.setItem(STORAGE_KEY.CUSTOM_DEPLOYMENTS, updatedDeployments);
      setCustomDeployments(updatedDeployments);
    }

    setError(null); // Clear any previous error
  };

  const handleDelete = async (chainIdToDelete: number) => {
    const updatedDeployments = customDeployments.filter((deployment) => deployment.chainId !== chainIdToDelete);
    await storage.setItem(STORAGE_KEY.CUSTOM_DEPLOYMENTS, updatedDeployments);
    setCustomDeployments(updatedDeployments);
  };

  return (
    <div>
      <Title text="Manage Custom Deployments" />
      {customDeployments.length === 0 && <Typography>No custom deployments added yet.</Typography>}
      <Grid container spacing={2}>
        {customDeployments.map((deployment) => (
          <Grid size={12} key={deployment.chainId}>
            <CustomDeploymentCard deployment={deployment} onDelete={handleDelete} />
          </Grid>
        ))}
      </Grid>
      <Typography variant="h4" gutterBottom>
        Add Custom Deployment
      </Typography>
      {error && (
        <Grid size={12}>
          <Alert severity="error">{error}</Alert>
        </Grid>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <Grid container spacing={2}>
          <Grid size={12}>
            <FormControl fullWidth required>
              <InputLabel>Chain ID</InputLabel>
              <Select value={chainId} onChange={(e) => setChainId(e.target.value as number)} label="Chain ID">
                {config.chains.map((chain) => (
                  <MenuItem key={chain.id} value={chain.id}>
                    {chain.name} ({chain.id})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={12}>
            <TextField
              label="Singleton Address"
              value={singleton}
              onChange={(e) => setSingleton(e.target.value as Address)}
              fullWidth
              required
            />
          </Grid>
          <Grid size={12}>
            <TextField
              label="SingletonL2 Address"
              value={singletonL2}
              onChange={(e) => setSingletonL2(e.target.value as Address)}
              fullWidth
              required
            />
          </Grid>
          <Grid size={12}>
            <TextField
              label="Proxy Factory Address"
              value={proxyFactory}
              onChange={(e) => setProxyFactory(e.target.value as Address)}
              fullWidth
              required
            />
          </Grid>
          <Grid size={12}>
            <TextField
              label="Multisend Address"
              value={multisend}
              onChange={(e) => setMultisend(e.target.value as Address)}
              fullWidth
              required
            />
          </Grid>
          <Grid size={12}>
            <TextField
              label="Multisend Call Only Address"
              value={multisendCallOnly}
              onChange={(e) => setMultisendCallOnly(e.target.value as Address)}
              fullWidth
              required
            />
          </Grid>
          <Grid size={12}>
            <TextField
              label="Fallback Handler Address"
              value={fallbackHandler}
              onChange={(e) => setFallbackHandler(e.target.value as Address)}
              fullWidth
              required
            />
          </Grid>
          <Grid size={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Add Deployment
            </Button>
          </Grid>
        </Grid>
      </form>
    </div>
  );
};

interface CustomDeploymentCardProps {
  deployment: CustomDeployment;
  onDelete: (chainId: number) => void;
}

const CustomDeploymentCard: React.FC<CustomDeploymentCardProps> = ({ deployment, onDelete }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Chain ID: {deployment.chainId}</Typography>
        <Typography>Singleton: {deployment.deployment.singleton}</Typography>
        <Typography>SingletonL2: {deployment.deployment.singletonL2}</Typography>
        <Typography>Proxy Factory: {deployment.deployment.proxyFactory}</Typography>
        <Typography>Multisend: {deployment.deployment.multiSend}</Typography>
        <Typography>Multisend Call Only: {deployment.deployment.multiSendCallOnly}</Typography>
        <Typography>Fallback Handler: {deployment.deployment.fallbackHandler}</Typography>
      </CardContent>
      <CardActions>
        <IconButton onClick={() => onDelete(deployment.chainId)}>
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default AddCustomDeployment;
