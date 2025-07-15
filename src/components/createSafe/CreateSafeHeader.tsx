import { Box, Typography } from "@mui/material";
import type React from "react";

const CreateSafeHeader: React.FC = () => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Create Safe
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Configure Safe account
      </Typography>
    </Box>
  );
};

export default CreateSafeHeader;
