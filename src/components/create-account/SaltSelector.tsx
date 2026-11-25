import { TextField } from "@mui/material";
import { parseSalt } from "../../utils/utils";

const SaltSelector: React.FC<{
  salt: bigint;
  setSalt: (value: bigint) => void;
}> = ({ salt, setSalt }) => {
  const handleSaltChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const salt = parseSalt(event.target.value);
    if (salt !== undefined) setSalt(salt);
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
