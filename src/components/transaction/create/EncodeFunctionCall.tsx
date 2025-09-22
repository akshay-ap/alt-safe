import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useMemo, useState } from "react";
import type React from "react";
import { type AbiFunction, type AbiParameter, encodeFunctionData, parseAbiItem } from "viem";
import { type Transaction, TransactionType } from "../../../context/types";

interface EncodeFunctionCallProps {
  onAdd: (transaction: Transaction) => void;
  groupInfo: {
    name: string;
  };
}

// Type for form data to maintain separation of concerns
interface FormData {
  functionSignature: string;
  to: string;
  value: string;
  parameters: Record<string, string>;
}

const EncodeFunctionCall: React.FC<EncodeFunctionCallProps> = ({ onAdd, groupInfo }) => {
  const [formData, setFormData] = useState<FormData>({
    functionSignature: "",
    to: "",
    value: "0",
    parameters: {},
  });

  // Parse ABI item safely - follows Single Responsibility Principle
  const parsedAbiItem = useMemo((): AbiFunction | null => {
    if (!formData.functionSignature.trim()) return null;

    try {
      const abiItem = parseAbiItem(formData.functionSignature) as AbiFunction;

      // Validate it's a function
      if (abiItem.type !== "function") {
        return null;
      }

      return abiItem;
    } catch (error) {
      return null;
    }
  }, [formData.functionSignature]);

  // Handle input changes - follows DRY principle
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle parameter changes - follows DRY principle
  const handleParameterChange = (paramName: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      parameters: { ...prev.parameters, [paramName]: value },
    }));
  };

  // Convert parameter value to appropriate type - follows Single Responsibility Principle
  const convertParameterValue = (param: AbiParameter, value: string): any => {
    if (param.type.includes("uint") || param.type.includes("int")) {
      return BigInt(value);
    }
    if (param.type === "bool") {
      return value.toLowerCase() === "true" || value === "1";
    }
    if (param.type.includes("bytes") && !value.startsWith("0x")) {
      return `0x${value}`;
    }
    return value;
  };

  // Generate calldata - follows Single Responsibility Principle
  const generateCalldata = (): string | null => {
    if (!parsedAbiItem) return null;

    try {
      const args = parsedAbiItem.inputs.map((input) => {
        const value = formData.parameters[input.name || ""];
        return convertParameterValue(input, value);
      });

      return encodeFunctionData({
        abi: [parsedAbiItem],
        functionName: parsedAbiItem.name,
        args,
      });
    } catch (error) {
      console.error("Failed to generate calldata:", error);
      return null;
    }
  };

  // Handle form submission - follows Single Responsibility Principle
  const handleSubmit = () => {
    const calldata = generateCalldata();

    const transaction: Transaction = {
      type: TransactionType.CONTRACT_CALL,
      groupName: groupInfo.name,
      actionName: `${parsedAbiItem?.name || "Function Call"}`,
      to: formData.to as `0x${string}`,
      value: formData.value,
      data: calldata as `0x${string}`,
    };

    onAdd(transaction);

    // Reset form after successful submission
    setFormData({
      functionSignature: "",
      to: "",
      value: "0",
      parameters: {},
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Encode Function Call
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Enter a Solidity function signature to dynamically generate input fields and encode the function call.
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Contract Address"
            placeholder="0x..."
            value={formData.to}
            onChange={(e) => handleInputChange("to", e.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Amount of ETH to send with the transaction"
            type="number"
            value={formData.value}
            onChange={(e) => handleInputChange("value", e.target.value)}
          />
        </Grid>
        {/* Function Signature Input */}
        <Grid size={12}>
          <TextField
            fullWidth
            label="Function Signature"
            placeholder="function balanceOf(address owner) view returns (uint)"
            value={formData.functionSignature}
            onChange={(e) => handleInputChange("functionSignature", e.target.value)}
          />
        </Grid>

        {/* Function Parameters */}
        {parsedAbiItem?.inputs && parsedAbiItem.inputs.length > 0 && (
          <Grid size={12}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Parameters for {parsedAbiItem.name}
              </Typography>

              <Grid container spacing={2}>
                {parsedAbiItem.inputs.map((input, index) => (
                  <Grid size={12} key={`${input.name || index}-${input.type}`}>
                    <TextField
                      fullWidth
                      label={input.name || `Parameter ${index}`}
                      placeholder={`Enter ${input.type} value`}
                      value={formData.parameters[input.name || ""] || ""}
                      onChange={(e) => handleParameterChange(input.name || "", e.target.value)}
                      helperText={`Type: ${input.type}`}
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* Submit Button */}
        <Grid size={12}>
          <Button variant="contained" onClick={handleSubmit} disabled={!parsedAbiItem} fullWidth sx={{ mt: 2 }}>
            Add Function Call to Batch
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EncodeFunctionCall;
