import { TextField } from "@mui/material";

const SaltSelector: React.FC<{
  salt: bigint;
  setSalt: (value: bigint) => void;
}> = ({ salt, setSalt }) => {
  const handleSaltChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    try {
      // Only allow numeric input
      if (/^\d*$/.test(value)) {
        setSalt(BigInt(value || 0));
      }
    } catch (error) {
      // Ignore invalid BigInt values
      console.warn("Invalid salt value:", value);
    }
  };

  return (
    <TextField
      label="Salt"
      value={salt.toString()}
      onChange={handleSaltChange}
      fullWidth
      margin="normal"
      type="number"
      helperText="A unique number that affects the final Safe address"
    />
  );
};

export default SaltSelector;
