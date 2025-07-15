import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Link,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { simulateContract, writeContract } from "@wagmi/core";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type Address, zeroAddress } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import safeProxyFactoryABI from "../../abis/SafeProxyFactory.json";
import { STORAGE_KEY } from "../../constants";
import { useSafeWalletContext } from "../../context/WalletContext";
import type { SafeAccount } from "../../context/types";
import { calculateInitData, getProxyAddress } from "../../utils/utils";
import { config } from "../../wagmi";
import AccountAddress from "../common/AccountAddress";
import NameAndLabels from "../common/NameAndLabels";
import OwnerList from "./OwnerList";
import SaltSelector from "./SaltSelector";
import ThresholdSelector from "./Threshold";

const CreateSafe: React.FC = () => {
  const account = useAccount();
  const publicClient = usePublicClient();
  const navigate = useNavigate();
  const { safeDeployment, storage } = useSafeWalletContext();

  const [owners, setOwners] = useState<Address[]>([account.address || zeroAddress]);
  const [threshold, setThreshold] = useState<number>(1);
  const [salt, setSalt] = useState<bigint>(BigInt(0));
  const [initData, setInitData] = useState<`0x${string}`>("0x");
  const [proxyAddress, setProxyAddress] = useState<Address>();
  const [isAlreadyDeployed, setIsAlreadyDeployed] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const [safeCreationTxHash, setSafeCreationTxHash] = useState<string>();

  const [proxyFactory, setProxyFactory] = useState<string>(safeDeployment?.proxyFactory || "");
  const [fallbackHandler, setFallbackHandler] = useState<string>(safeDeployment?.fallbackHandler || "");
  const [singletonL2, setSingletonL2] = useState<string>(safeDeployment?.singletonL2 || "");
  const [singleton, setSingleton] = useState<string>(safeDeployment?.singleton || "");
  const [useSingletonL2, setUseSingletonL2] = useState<boolean>(publicClient?.chain.sourceId !== undefined);

  // New state for account name and labels
  const [safeName, setSafeName] = useState<string>("");
  const [safeLabels, setSafeLabels] = useState<string[]>([]);

  // Current active step in the stepper
  const [activeStep, setActiveStep] = useState<number>(0);

  // State for advanced settings accordion
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Update initData when owners or threshold change
  useEffect(() => {
    if (safeDeployment) {
      setProxyFactory(safeDeployment.proxyFactory);
      setFallbackHandler(safeDeployment.fallbackHandler);
      setSingletonL2(safeDeployment.singletonL2);
      setSingleton(safeDeployment.singleton);
    }
  }, [safeDeployment]);

  // Update initData when owners or threshold change
  useEffect(() => {
    if (safeDeployment) setInitData(calculateInitData(owners, threshold, safeDeployment.fallbackHandler));
  }, [owners, threshold, safeDeployment]);

  // Update proxyAddress when initData, safeDeployment, or salt change
  useEffect(() => {
    if (safeDeployment && initData !== "0x") {
      const safeSingleton = (useSingletonL2 ? safeDeployment.singletonL2 : safeDeployment.singleton) as `0x${string}`;
      setProxyAddress(getProxyAddress(safeDeployment.proxyFactory, safeSingleton, initData, salt));
    }
  }, [initData, safeDeployment, salt, useSingletonL2]);

  // Check if the Safe is already deployed
  useEffect(() => {
    if (proxyAddress && publicClient) {
      (async () => {
        const code = await publicClient.getCode({ address: proxyAddress });
        if (code !== undefined && code !== "0x") {
          setIsAlreadyDeployed(true);
        } else {
          setIsAlreadyDeployed(false);
        }
      })();
    }
  }, [proxyAddress, publicClient]);

  const handleAddOwner = () => {
    setOwners([...owners, zeroAddress]);
  };

  const handleRemoveOwner = (index: number) => {
    const updatedOwners = owners.filter((_, i) => i !== index);
    setOwners(updatedOwners);
    if (threshold > updatedOwners.length) {
      setThreshold(updatedOwners.length);
    }
  };

  const handleOwnerChange = (index: number, value: string) => {
    const updatedOwners = owners.map((owner, i) => (i === index ? value : owner)) as Address[];
    setOwners(updatedOwners);
  };

  const handleNextStep = () => {
    setActiveStep((prev) => Math.min(prev + 1, 2));
  };

  const handleBackStep = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleCreateSafe = async () => {
    if (proxyAddress && safeDeployment) {
      try {
        // Create the Safe
        const result = await simulateContract(config, {
          abi: safeProxyFactoryABI,
          address: safeDeployment.proxyFactory,
          functionName: "createProxyWithNonce",
          args: [useSingletonL2 ? safeDeployment.singletonL2 : safeDeployment.singleton, initData, salt],
        });

        const newSafeAddress = result.result;

        if (newSafeAddress !== proxyAddress) {
          setError("Expected proxy address does not match the calculated proxy address");
          return;
        }

        const txHash = await writeContract(config, result.request);
        setSafeCreationTxHash(txHash);

        if (
          safeDeployment.proxyFactory &&
          (useSingletonL2 ? safeDeployment.singletonL2 : safeDeployment.singleton) &&
          initData
        ) {
          setProxyAddress(newSafeAddress);
          const existingAccounts = (await storage.getItem(STORAGE_KEY.SAFE_ACCOUNTS)) as SafeAccount[];

          // No account in storage
          if (!existingAccounts) {
            await storage.setItem(STORAGE_KEY.SAFE_ACCOUNTS, [
              { address: newSafeAddress, chainIds: [account.chainId], name: safeName, labels: safeLabels },
            ]);
            return;
          }

          const safeAccount = existingAccounts.find((acc) => acc.address === newSafeAddress);
          // No Safe account with address === new Safe address in storage
          if (!safeAccount) {
            await storage.setItem(STORAGE_KEY.SAFE_ACCOUNTS, [
              ...existingAccounts,
              { address: newSafeAddress, chainIds: [account.chainId], name: safeName, labels: safeLabels },
            ]);
          } else {
            const updatedSafeAccounts = [
              ...existingAccounts.filter((acc) => acc.address !== newSafeAddress),
              {
                address: newSafeAddress,
                chainIds: [...safeAccount.chainIds, account.chainId],
                name: safeName,
                labels: safeLabels,
              },
            ];
            await storage.setItem(STORAGE_KEY.SAFE_ACCOUNTS, updatedSafeAccounts);
          }
        }
      } catch (err) {
        console.error("Error creating Safe:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      }
    }
  };

  // Steps content based on active step
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              Name Your Safe
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Give your Safe a recognizable name and optional labels for easy identification
            </Typography>
            <NameAndLabels name={safeName} setName={setSafeName} labels={safeLabels} setLabels={setSafeLabels} />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              Add Owners and Set Threshold
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add the owners who will manage this Safe and set the number of confirmations required
            </Typography>

            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Owners
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Each owner can propose and confirm transactions
                </Typography>
                <OwnerList owners={owners} onOwnerChange={handleOwnerChange} onRemoveOwner={handleRemoveOwner} />

                <Button variant="outlined" startIcon={<AddCircleOutlineIcon />} onClick={handleAddOwner} sx={{ mt: 2 }}>
                  Add Owner
                </Button>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Threshold
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Set how many owner confirmations are required for transactions
                </Typography>
                <ThresholdSelector threshold={threshold} setThreshold={setThreshold} ownersCount={owners.length} />
              </CardContent>
            </Card>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              Review and Create
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Review your Safe settings before deployment
            </Typography>

            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Safe Configuration
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="body1">{safeName || "Unnamed Safe"}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Owners
                    </Typography>
                    <Typography variant="body1">{owners.length}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Threshold
                    </Typography>
                    <Typography variant="body1">
                      {threshold} out of {owners.length}
                    </Typography>
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
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Salt
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Customize salt value to generate a different Safe address
                </Typography>
                <SaltSelector salt={salt} setSalt={setSalt} />
              </CardContent>
            </Card>

            <Accordion expanded={showAdvanced} onChange={() => setShowAdvanced(!showAdvanced)} sx={{ mb: 3 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Advanced Settings</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Proxy Factory"
                      value={proxyFactory}
                      slotProps={{
                        input: {
                          readOnly: true,
                        },
                      }}
                      onChange={(e) => setProxyFactory(e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Fallback Handler"
                      value={fallbackHandler}
                      slotProps={{
                        input: {
                          readOnly: true,
                        },
                      }}
                      onChange={(e) => setFallbackHandler(e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <FormControlLabel
                      control={
                        <Checkbox checked={useSingletonL2} onChange={(e) => setUseSingletonL2(e.target.checked)} />
                      }
                      label="Use SingletonL2"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    {useSingletonL2 ? (
                      <TextField
                        label="Singleton L2"
                        value={singletonL2}
                        slotProps={{
                          input: {
                            readOnly: true,
                          },
                        }}
                        onChange={(e) => setSingletonL2(e.target.value)}
                        fullWidth
                      />
                    ) : (
                      <TextField
                        label="Singleton"
                        slotProps={{
                          input: {
                            readOnly: true,
                          },
                        }}
                        value={singleton}
                        onChange={(e) => setSingleton(e.target.value)}
                        fullWidth
                      />
                    )}
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {account.status === "connected" && proxyAddress && (
              <Box
                sx={{ mb: 3, p: 2, bgcolor: "background.paper", borderRadius: 1, border: 1, borderColor: "divider" }}
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
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create Safe Account
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Set up a new Safe multi-signature wallet to securely manage your assets
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        <Step>
          <StepLabel>Name Your Safe</StepLabel>
        </Step>
        <Step>
          <StepLabel>Add Owners & Threshold</StepLabel>
        </Step>
        <Step>
          <StepLabel>Review & Create</StepLabel>
        </Step>
      </Stepper>

      <Card sx={{ mb: 3 }}>{renderStepContent()}</Card>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
        <Button variant="outlined" onClick={handleBackStep} disabled={activeStep === 0}>
          Back
        </Button>

        {activeStep < 2 ? (
          <Button variant="contained" onClick={handleNextStep}>
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleCreateSafe}
            disabled={isAlreadyDeployed || safeCreationTxHash !== undefined || account.status !== "connected"}
          >
            Create Safe
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default CreateSafe;
