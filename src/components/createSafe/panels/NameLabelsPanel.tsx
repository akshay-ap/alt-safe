import { Box, Typography } from "@mui/material";
import type React from "react";
import NameAndLabels from "../../common/NameAndLabels";

interface NameLabelsPanelProps {
  safeName: string;
  setSafeName: (name: string) => void;
  safeLabels: string[];
  setSafeLabels: (labels: string[]) => void;
}

const NameLabelsPanel: React.FC<NameLabelsPanelProps> = ({ safeName, setSafeName, safeLabels, setSafeLabels }) => {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h6" gutterBottom>
        Name & Labels
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Give your Safe a recognizable name and optional labels for easy identification. This is stroed locally and not
        on-chain. You can change it later.
      </Typography>

      <NameAndLabels name={safeName} setName={setSafeName} labels={safeLabels} setLabels={setSafeLabels} />
    </Box>
  );
};

export default NameLabelsPanel;
