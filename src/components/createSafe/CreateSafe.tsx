import { Box } from "@mui/material";
import type React from "react";
import ConfigurationPanels from "./ConfigurationPanels";
import { CreateSafeProvider } from "../../context/CreateSafeContext";
import CreateSafeHeader from "./CreateSafeHeader";
import SafePreview from "./SafePreview";

const CreateSafeContent: React.FC = () => {
  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <CreateSafeHeader />

      <Box
        sx={{
          display: "flex",
          flex: 1,
          gap: { xs: 2, md: 3 },
          p: { xs: 2, md: 3 },
          pt: 0,
          flexDirection: { xs: "column", lg: "row" },
        }}
      >
        {/* Left Configuration Panel */}
        <Box sx={{ flex: { lg: 1 }, minWidth: 0 }}>
          <ConfigurationPanels />
        </Box>

        {/* Right Preview Panel */}
        <Box
          sx={{
            width: { xs: "100%", lg: 400 },
            minWidth: { lg: 350 },
            maxWidth: { lg: 450 },
          }}
        >
          <SafePreview />
        </Box>
      </Box>
    </Box>
  );
};

const CreateSafe: React.FC = () => {
  return (
    <CreateSafeProvider>
      <CreateSafeContent />
    </CreateSafeProvider>
  );
};

export default CreateSafe;
