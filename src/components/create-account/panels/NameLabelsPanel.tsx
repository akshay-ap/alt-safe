import { Autocomplete, Box, Chip, Stack, TextField, Typography } from "@mui/material";
import type React from "react";

interface NameLabelsPanelProps {
  safeName: string;
  setSafeName: (name: string) => void;
  safeLabels: string[];
  setSafeLabels: (labels: string[]) => void;
}

const uniqueTrimmed = (labels: string[]) => [...new Set(labels.map((label) => label.trim()).filter(Boolean))];

const NameLabelsPanel: React.FC<NameLabelsPanelProps> = ({ safeName, setSafeName, safeLabels, setSafeLabels }) => (
  <Box sx={{ p: 2 }}>
    <Typography variant="h6" component="h2">
      Name
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
      Saved only in this browser. You can change it later.
    </Typography>
    <Stack spacing={1.5}>
      <TextField
        label="Safe name"
        placeholder="e.g. Treasury"
        value={safeName}
        onChange={(event) => setSafeName(event.target.value)}
        size="small"
        fullWidth
      />
      <Autocomplete
        multiple
        freeSolo
        options={[]}
        value={safeLabels}
        onChange={(_, labels) => setSafeLabels(uniqueTrimmed(labels as string[]))}
        renderValue={(labels, getItemProps) =>
          labels.map((label, index) => {
            const { key, ...itemProps } = getItemProps({ index });
            return <Chip key={key} size="small" label={label} {...itemProps} />;
          })
        }
        renderInput={(params) => (
          <TextField {...params} size="small" label="Labels" placeholder="Type and press Enter" />
        )}
      />
    </Stack>
  </Box>
);

export default NameLabelsPanel;
