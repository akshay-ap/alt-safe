import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { Alert, Box, Button, Card, CardContent, Typography } from "@mui/material";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import type { Address } from "viem";
import { isAddress, zeroAddress } from "viem";
import OwnerList from "../OwnerList";
import Threshold from "../Threshold";

interface OwnersPanelProps {
  owners: Address[];
  setOwners: (owners: Address[]) => void;
  threshold: number;
  setThreshold: (threshold: number) => void;
}

const OwnersPanel: React.FC<OwnersPanelProps> = ({ owners, setOwners, threshold, setThreshold }) => {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateOwners = useCallback((newOwners: Address[]) => {
    const errors: string[] = [];

    // Check for zero addresses
    const hasZeroAddress = newOwners.some((owner) => owner === zeroAddress);
    if (hasZeroAddress) {
      errors.push("Zero address (0x000...000) is not allowed as an owner");
    }

    // Check for duplicates (only among valid addresses)
    const validAddresses = newOwners.filter((owner) => isAddress(owner));
    const duplicates = validAddresses.filter(
      (owner, index) => validAddresses.findIndex((o) => o.toLowerCase() === owner.toLowerCase()) !== index,
    );
    if (duplicates.length > 0) {
      errors.push("Duplicate owner addresses are not allowed");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  }, []);

  // Validate owners whenever the owners array changes
  useEffect(() => {
    validateOwners(owners);
  }, [owners, validateOwners]);
  const handleAddOwner = useCallback(() => {
    // Add empty string instead of zero address to allow user to input valid address
    setOwners([...owners, "" as Address]);
  }, [owners, setOwners]);

  const handleRemoveOwner = useCallback(
    (index: number) => {
      const updatedOwners = owners.filter((_, i) => i !== index);
      setOwners(updatedOwners);
      if (threshold > updatedOwners.length) {
        setThreshold(updatedOwners.length);
      }
    },
    [owners, setOwners, threshold, setThreshold],
  );

  const handleOwnerChange = useCallback(
    (index: number, value: string) => {
      const updatedOwners = owners.map((owner, i) => (i === index ? value : owner)) as Address[];
      setOwners(updatedOwners);
    },
    [owners, setOwners],
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h6" gutterBottom>
        Owners & Threshold Configuration
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
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

          <Threshold threshold={threshold} setThreshold={setThreshold} ownersCount={owners.length} />
        </CardContent>
      </Card>

      {validationErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Owner validation errors:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: "1rem" }}>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}
    </Box>
  );
};

export default OwnersPanel;
