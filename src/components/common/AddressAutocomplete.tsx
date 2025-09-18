import { Autocomplete, Box, Chip, ListItem, TextField, type TextFieldProps, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import React from "react";
import { isAddress } from "viem";
import { useAddressBookSelector } from "./AddressBookSelector";

interface Option {
  name: string;
  value: string;
}

interface AddressAutocompleteProps extends Omit<TextFieldProps, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  label: string;
  showAddressBook?: boolean;
  helperText?: string;
  errorText?: string;
  freeSolo?: boolean;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  options,
  label,
  showAddressBook = true,
  helperText,
  errorText,
  freeSolo = true,
}) => {
  const [inputValue, setInputValue] = React.useState(value);

  // Check if current value is a valid address for validation display
  const isValidAddress = value ? isAddress(value) : true;
  const showError = !isValidAddress && value !== "";

  // Use the address book selector hook
  const { iconButton, menuComponent, hasAddresses } = useAddressBookSelector({
    showAddressBook,
    onAddressSelect: (address: string) => {
      onChange(address);
      setInputValue(address);
    },
    size: "small",
    variant: "icon",
  });

  const handleAutocompleteChange = (_event: any, newValue: unknown) => {
    const typedValue = newValue as Option | string | null;
    if (typeof typedValue === "string") {
      onChange(typedValue);
      setInputValue(typedValue);
    } else if (typedValue && typeof typedValue === "object" && "value" in typedValue) {
      onChange(typedValue.value);
      setInputValue(typedValue.value);
    } else {
      onChange("");
      setInputValue("");
    }
  };

  const handleInputChange = (_event: any, newInputValue: string) => {
    setInputValue(newInputValue);
    // For freeSolo, update the value immediately
    if (freeSolo) {
      onChange(newInputValue);
    }
  };

  // Combine options with address book entries (but we don't need them in autocomplete as they're in the menu)
  const allOptions: Option[] = options;

  const endAdornment = showAddressBook && hasAddresses ? iconButton : undefined;

  return (
    <Box>
      <Autocomplete<Option | string, false, false, boolean>
        freeSolo={freeSolo}
        options={allOptions}
        value={allOptions.find((option) => option.value === value) || value}
        inputValue={inputValue}
        getOptionLabel={(option) => {
          const typedOption = option as Option | string;
          return typeof typedOption === "string" ? typedOption : typedOption.name;
        }}
        renderOption={(props, option) => {
          const typedOption = option as Option;
          return (
            <ListItem {...props} key={`${typedOption.name}-${typedOption.value}`}>
              <Grid container justifyContent="space-between" width="100%">
                <Grid>
                  <Typography>{typedOption.name}</Typography>
                </Grid>
                <Grid>
                  <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                    {isAddress(typedOption.value)
                      ? `${typedOption.value.slice(0, 6)}...${typedOption.value.slice(-4)}`
                      : typedOption.value}
                  </Typography>
                </Grid>
              </Grid>
            </ListItem>
          );
        }}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => {
            const typedOption = option as Option | string;
            return (
              <Chip
                label={typeof typedOption === "string" ? typedOption : typedOption.name}
                {...getTagProps({ index })}
                key={typeof typedOption === "string" ? typedOption : typedOption.value}
              />
            );
          })
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            fullWidth
            variant="outlined"
            error={showError}
            helperText={showError ? errorText || "Invalid address format" : helperText}
            slotProps={{
              input: {
                ...params.InputProps,
                endAdornment: (
                  <>
                    {params.InputProps.endAdornment}
                    {endAdornment}
                  </>
                ),
              },
            }}
          />
        )}
        onChange={handleAutocompleteChange}
        onInputChange={handleInputChange}
      />

      {/* Address Book Menu */}
      {menuComponent}
    </Box>
  );
};

export default AddressAutocomplete;
