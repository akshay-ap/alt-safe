import { FormControl, InputLabel, TextField } from "@mui/material";

const SaltSelector: React.FC<{
  salt: bigint;
  setSalt: (value: bigint) => void;
}> = ({ salt, setSalt }) => (
  <FormControl fullWidth>
    <InputLabel>Salt</InputLabel>
    <TextField value={salt.toString()} onChange={(e) => setSalt(BigInt(e.target.value))} fullWidth margin="normal" />
  </FormControl>
);

export default SaltSelector;
