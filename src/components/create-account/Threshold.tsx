import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

const ThresholdSelector: React.FC<{
  threshold: number;
  setThreshold: (value: number) => void;
  ownersCount: number;
}> = ({ threshold, setThreshold, ownersCount }) => (
  <FormControl fullWidth>
    <InputLabel>Threshold</InputLabel>
    <Select value={threshold} onChange={(e) => setThreshold(Number(e.target.value))}>
      {Array.from({ length: ownersCount }, (_, i) => i + 1).map((value) => (
        <MenuItem key={value} value={value}>
          {value}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

export default ThresholdSelector;
