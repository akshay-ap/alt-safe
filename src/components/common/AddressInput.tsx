import { Box, TextField, type TextFieldProps } from "@mui/material";
import React from "react";
import { isAddress } from "viem";
import { useAddressBookSelector } from "./AddressBookSelector";

interface AddressInputProps extends Omit<TextFieldProps, "error" | "helperText" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
  validateOnChange?: boolean;
  helperText?: string;
  errorText?: string;
  allowEmpty?: boolean;
  onValidationChange?: (isValid: boolean) => void;
  showAddressBook?: boolean;
}

const AddressInput: React.FC<AddressInputProps> = ({
  value,
  onChange,
  validateOnChange = true,
  helperText = "Enter a valid Ethereum address",
  errorText = "Invalid address format",
  allowEmpty = true,
  onValidationChange,
  showAddressBook = true,
  ...textFieldProps
}) => {
  const isEmpty = !value || value.trim() === "";
  const isValidAddress = isEmpty ? allowEmpty : isAddress(value);
  const showError = validateOnChange && !isEmpty && !isValidAddress;

  // Use the address book selector hook
  const { iconButton, menuComponent } = useAddressBookSelector({
    showAddressBook,
    onAddressSelect: onChange,
    size: "small",
    variant: "icon",
  });

  // Call validation callback when validation state changes
  React.useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isValidAddress);
    }
  }, [isValidAddress, onValidationChange]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <Box>
      <TextField
        {...textFieldProps}
        value={value}
        onChange={handleChange}
        error={showError}
        helperText={showError ? errorText : helperText}
        placeholder="0x..."
        fullWidth
        variant="outlined"
        slotProps={{
          input: {
            endAdornment: iconButton,
          },
        }}
      />
      {menuComponent}
    </Box>
  );
};

export default AddressInput;
