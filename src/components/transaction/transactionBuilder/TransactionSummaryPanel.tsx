import BuildIcon from "@mui/icons-material/Build";
import DoneIcon from "@mui/icons-material/Done";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { Box, Button, IconButton, Paper, Typography } from "@mui/material";
import type React from "react";
import type { Transaction } from "../../../context/types";
import Summary from "../Summary";

interface TransactionSummaryPanelProps {
  transactions: Transaction[];
  handleDeleteTransaction: (id: number) => void;
  viewOnly?: boolean;
  isMobile: boolean;
  isSummaryExpanded?: boolean;
  toggleSummaryExpanded?: () => void;
  height?: string;
  step?: number; // Add step prop to adjust height based on step
}

const TransactionSummaryPanel: React.FC<TransactionSummaryPanelProps> = ({
  transactions,
  handleDeleteTransaction,
  viewOnly = false,
  isMobile,
  isSummaryExpanded,
  toggleSummaryExpanded,
  height = "calc(100vh - 200px)",
  step = 0,
}) => {
  // Adjust height based on step to ensure consistent heights
  // Step 0: Build, Step 1: Review & Sign, Step 2: Execute
  const stepHeight =
    step === 0
      ? "calc(100vh - 250px)" // Build step needs more space adjustment
      : "calc(100vh - 200px)"; // Review and Execute steps

  const finalHeight = height === "calc(100vh - 200px)" ? stepHeight : height;

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        height: isMobile ? (viewOnly ? "auto" : finalHeight) : finalHeight,
        display: "flex",
        flexDirection: "column",
        maxHeight: finalHeight, // Ensure it doesn't exceed the calculated height
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">
          Transaction Summary
          <Typography component="span" color="text.secondary" sx={{ ml: 1 }}>
            ({transactions.length})
          </Typography>
        </Typography>

        {/* Mobile-only toggle button for non-viewOnly mode */}
        {isMobile && !viewOnly && toggleSummaryExpanded && (
          <IconButton onClick={toggleSummaryExpanded} size="small" color="primary">
            {isSummaryExpanded ? <KeyboardArrowLeftIcon /> : <KeyboardArrowRightIcon />}
          </IconButton>
        )}
      </Box>

      <Box sx={{ flex: 1, overflow: "auto", p: 1 }}>
        <Summary
          viewOnly={viewOnly}
          transactions={transactions}
          handleDeleteTransaction={handleDeleteTransaction}
          expanded={true}
        />
      </Box>

      {/* Mobile-only toggle button at bottom for non-viewOnly mode */}
      {isMobile && !viewOnly && toggleSummaryExpanded && isSummaryExpanded !== undefined && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={toggleSummaryExpanded}
            startIcon={isSummaryExpanded ? <BuildIcon /> : <DoneIcon />}
          >
            {isSummaryExpanded ? "Add More Transactions" : "View Transaction Summary"}
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default TransactionSummaryPanel;
