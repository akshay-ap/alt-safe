import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { Alert, Box, Button, Typography } from "@mui/material";
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
      errors.push("The zero address cannot be an owner.");
    }

    // Check for duplicates (only among valid addresses)
    const validAddresses = newOwners.filter((owner) => isAddress(owner));
    const duplicates = validAddresses.filter(
      (owner, index) => validAddresses.findIndex((o) => o.toLowerCase() === owner.toLowerCase()) !== index,
    );
    if (duplicates.length > 0) {
      errors.push("Each owner can only be listed once.");
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
      <Typography variant="h6" component="h2">
        Owners and signatures
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Owners can propose and sign transactions. A transaction runs once it has the required number of signatures.
      </Typography>

      <OwnerList owners={owners} onOwnerChange={handleOwnerChange} onRemoveOwner={handleRemoveOwner} />
      <Button startIcon={<AddCircleOutlineIcon />} onClick={handleAddOwner} sx={{ mt: 1.5, mb: 3 }}>
        Add owner
      </Button>

      <Threshold threshold={threshold} setThreshold={setThreshold} ownersCount={owners.length} />

      {validationErrors.length > 0 && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {validationErrors.map((error) => (
            <div key={error}>{error}</div>
          ))}
        </Alert>
      )}
    </Box>
  );
};

export default OwnersPanel;
