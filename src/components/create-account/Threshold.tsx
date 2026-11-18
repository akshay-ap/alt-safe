import { MenuItem, Stack, TextField, Typography } from "@mui/material";

const ThresholdSelector: React.FC<{
  threshold: number;
  setThreshold: (value: number) => void;
  ownersCount: number;
}> = ({ threshold, setThreshold, ownersCount }) => (
  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
    <TextField
      select
      size="small"
      label="Required signatures"
      value={threshold}
      onChange={(event) => setThreshold(Number(event.target.value))}
      sx={{ minWidth: 180 }}
    >
      {Array.from({ length: ownersCount }, (_, i) => i + 1).map((value) => (
        <MenuItem key={value} value={value}>
          {value}
        </MenuItem>
      ))}
    </TextField>
    <Typography variant="body2" color="text.secondary">
      of {ownersCount} owner{ownersCount === 1 ? "" : "s"}
    </Typography>
  </Stack>
);

export default ThresholdSelector;
