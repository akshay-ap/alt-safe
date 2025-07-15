import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Chip, FormHelperText, TextField, Typography } from "@mui/material";
import type React from "react";
import { useState } from "react";

interface NameAndLabelsProps {
  name: string;
  setName: (name: string) => void;
  labels: string[];
  setLabels: (labels: string[]) => void;
  nameLabel?: string;
  labelsLabel?: string;
}

const NameAndLabels: React.FC<NameAndLabelsProps> = ({
  name,
  setName,
  labels,
  setLabels,
  nameLabel = "Name",
  labelsLabel = "Labels",
}) => {
  const [newLabel, setNewLabel] = useState("");
  const [labelError, setLabelError] = useState("");

  const handleAddLabel = () => {
    if (!newLabel.trim()) {
      setLabelError("Label cannot be empty");
      return;
    }

    if (labels.includes(newLabel.trim())) {
      setLabelError("Label already exists");
      return;
    }

    setLabels([...labels, newLabel.trim()]);
    setNewLabel("");
    setLabelError("");
  };

  const handleDeleteLabel = (labelToDelete: string) => {
    setLabels(labels.filter((label) => label !== labelToDelete));
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={500} gutterBottom>
          {nameLabel}
        </Typography>
        <TextField
          fullWidth
          placeholder="Enter a name to easily identify this account"
          value={name}
          onChange={(e) => setName(e.target.value)}
          size="medium"
        />
      </Box>

      <Box>
        <Typography variant="subtitle1" fontWeight={500} gutterBottom>
          {labelsLabel}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Add labels to categorize and easily find this account later
        </Typography>

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            value={newLabel}
            onChange={(e) => {
              setNewLabel(e.target.value);
              setLabelError("");
            }}
            placeholder="Add a label"
            fullWidth
            error={!!labelError}
            size="medium"
            onKeyPress={(e) => {
              if (e.key === "Enter" && newLabel.trim()) {
                e.preventDefault();
                handleAddLabel();
              }
            }}
          />
          <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddLabel} disabled={!newLabel.trim()}>
            Add
          </Button>
        </Box>

        {labelError && <FormHelperText error>{labelError}</FormHelperText>}

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
          {labels.map((label) => (
            <Chip key={label} label={label} onDelete={() => handleDeleteLabel(label)} sx={{ m: 0.5 }} />
          ))}
          {labels.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              No labels added yet
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default NameAndLabels;
