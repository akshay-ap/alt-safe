import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { type Address, isAddress, isAddressEqual, zeroAddress } from "viem";
import { useAccount } from "wagmi";
import { usePublicClient } from "wagmi";
import { STORAGE_KEY } from "../constants";
import { useSafeWalletContext } from "../context/WalletContext";
import type { SafeAccount } from "../context/types";
import { type SafeStorage, fetchStorageData } from "../utils/storageReader";
import NameAndLabels from "./common/NameAndLabels";
import ViewSafeStorage from "./common/SafeStorage";

const ImportSafe: React.FC = () => {
  const { setSafeAccount, storage } = useSafeWalletContext();
  const account = useAccount();
  const [address, setAddress] = useState<Address>(zeroAddress);
  const [safeName, setSafeName] = useState<string>("");
  const [safeLabels, setSafeLabels] = useState<string[]>([]);
  const [error, setError] = useState<string>();
  const [imported, setImported] = useState<boolean>(false);
  const publicClient = usePublicClient();
  const [safeStorage, setSafeStorage] = useState<SafeStorage | undefined>();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();

  const steps = ["Enter Safe Address", "Verify Safe Information", "Configure Settings"];

  const handleLoadStorage = async () => {
    if (!isAddress(address) || address === zeroAddress) {
      setError("Please enter a valid Safe address");
      return;
    }

    setIsLoading(true);
    setError(undefined);
    setImported(false);

    if (isAddress(address) && publicClient) {
      try {
        const result = await fetchStorageData(address, publicClient as any);
        if (!result.storage.singleton || isAddressEqual(result.storage.singleton, zeroAddress)) {
          setError("This doesn't appear to be a valid Safe address. The singleton is empty or address(0).");
          setIsLoading(false);
          return;
        }
        setSafeStorage(result.storage);
        setActiveStep(1);
      } catch (e) {
        console.error(e);
        setError("Error fetching Safe data. Please check the address and try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setError("Invalid address format");
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => Math.max(0, prevStep - 1));
  };

  const handleImport = async () => {
    setIsLoading(true);
    setError(undefined);

    if (isAddress(address)) {
      setSafeAccount(address);
      const safeAccounts = (await storage.getItem(STORAGE_KEY.SAFE_ACCOUNTS)) as SafeAccount[];

      // No Safe accounts in storage
      if (!safeAccounts || safeAccounts.length === 0) {
        await storage.setItem(STORAGE_KEY.SAFE_ACCOUNTS, [
          { address, chainIds: [account.chainId], name: safeName, labels: safeLabels },
        ]);
        setImported(true);
        setActiveStep(3);
        setIsLoading(false);
        return;
      }

      const existingAccount = safeAccounts.find((acc) => acc.address === address);

      // No Safe account with address === import address in storage
      if (!existingAccount) {
        await storage.setItem(STORAGE_KEY.SAFE_ACCOUNTS, [
          ...safeAccounts,
          { address, chainIds: [account.chainId], name: safeName, labels: safeLabels },
        ]);
        setImported(true);
        setActiveStep(3);
        setIsLoading(false);
        return;
      }

      if (account.chainId && !existingAccount.chainIds.includes(account.chainId)) {
        // Safe account with address === import address exists but chainid is not present
        const updatedSafeAccounts = [
          ...safeAccounts.filter((acc) => acc.address !== address),
          {
            address,
            chainIds: [...existingAccount.chainIds, account.chainId],
            name: safeName || existingAccount.name,
            labels: safeLabels.length > 0 ? safeLabels : existingAccount.labels,
          },
        ];
        await storage.setItem(STORAGE_KEY.SAFE_ACCOUNTS, updatedSafeAccounts);
        setImported(true);
        setActiveStep(3);
        setIsLoading(false);
        return;
      }

      setError("This Safe account is already imported for this network.");
      setIsLoading(false);
    } else {
      setError("Invalid address format");
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: "auto" }}>
      <Typography variant="h4" gutterBottom fontWeight={500}>
        Import Existing Safe
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Import an existing Safe to manage it with this interface.
      </Typography>

      <Box sx={{ my: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 1 }}>
        {activeStep === 0 && (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Enter Safe Address
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Provide the address of your existing Safe to import it.
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="Safe Address"
              placeholder="0x..."
              value={address}
              error={!!error}
              helperText={error}
              onChange={(e) => setAddress(e.target.value as `0x${string}`)}
              sx={{ mb: 3 }}
              disabled={isLoading}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleLoadStorage}
                disabled={isLoading || !isAddress(address) || address === zeroAddress}
                startIcon={isLoading ? <CircularProgress size={20} /> : <VerifiedUserIcon />}
              >
                {isLoading ? "Loading..." : "Load Safe"}
              </Button>
            </Box>
          </>
        )}

        {activeStep === 1 && safeStorage && (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Verify Safe Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please verify this is the correct Safe you want to import.
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  mb: 3,
                  bgcolor: theme.palette.background.default,
                  borderRadius: 1,
                }}
              >
                <ViewSafeStorage safeStorage={safeStorage} />
              </Paper>

              <Alert severity="info">Please verify this is the correct Safe before continuing.</Alert>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button onClick={handleBack}>Back</Button>
              <Button variant="contained" onClick={handleNext}>
                Continue
              </Button>
            </Box>
          </>
        )}

        {activeStep === 2 && safeStorage && (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Configure Safe Settings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add a name and optional labels to help you identify this Safe.
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      borderRadius: 1,
                    }}
                  >
                    <NameAndLabels
                      name={safeName}
                      setName={setSafeName}
                      labels={safeLabels}
                      setLabels={setSafeLabels}
                      nameLabel="Safe Name (required)"
                      labelsLabel="Labels (optional)"
                    />
                  </Paper>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button onClick={handleBack}>Back</Button>
              <Button
                variant="contained"
                onClick={handleImport}
                disabled={isLoading || !safeName.trim()}
                startIcon={isLoading ? <CircularProgress size={20} /> : <AccountBalanceWalletIcon />}
              >
                Import Safe
              </Button>
              {isLoading && "Importing..."}
            </Box>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </>
        )}

        {activeStep === 3 && imported && (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 60, color: "success.main", mb: 2 }} />

            <Typography variant="h5" gutterBottom>
              Safe Successfully Imported!
            </Typography>

            <Typography variant="body1">Your Safe has been imported and is ready to use.</Typography>

            <Box sx={{ mt: 3 }}>
              <Button variant="contained" color="primary" onClick={() => navigate("/home")} sx={{ mr: 2 }}>
                Go to Dashboard
              </Button>

              <Button variant="outlined" onClick={() => navigate("/settings")}>
                View Safe Settings
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ImportSafe;
