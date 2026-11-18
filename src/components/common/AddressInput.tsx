import { Box, TextField, type TextFieldProps } from "@mui/material";
import React from "react";
import { isAddress } from "viem";
import { font } from "../../theme/tokens";
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
  /** Extra controls shown after the address book button, e.g. a remove button. */
  endActions?: React.ReactNode;
}

const AddressInput: React.FC<AddressInputProps> = ({
  value,
  onChange,
  validateOnChange = true,
  helperText,
  errorText = "Invalid address format",
  allowEmpty = true,
  onValidationChange,
  showAddressBook = true,
  endActions,
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
          ...textFieldProps.slotProps,
          input: {
            endAdornment: (
              <>
                {iconButton}
                {endActions}
              </>
            ),
          },
          htmlInput: { spellCheck: false, autoComplete: "off", style: { fontFamily: font.mono } },
        }}
      />
      {menuComponent}
    </Box>
  );
};

export default AddressInput;
