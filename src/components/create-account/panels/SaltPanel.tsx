import { Box, Card, CardContent, Typography } from "@mui/material";
import type React from "react";
import SaltSelector from "../SaltSelector";

interface SaltPanelProps {
  salt: bigint;
  setSalt: (salt: bigint) => void;
}

const SaltPanel: React.FC<SaltPanelProps> = ({ salt, setSalt }) => {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h6" gutterBottom>
        Salt
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Customize the salt value to generate a different Safe address with the same configuration
      </Typography>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Salt Value
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            A unique number that affects the final Safe address. Different salt values will produce different addresses.
          </Typography>

          <SaltSelector salt={salt} setSalt={setSalt} />
        </CardContent>
      </Card>
    </Box>
  );
};

export default SaltPanel;
