import BuildIcon from "@mui/icons-material/Build";
import DoneIcon from "@mui/icons-material/Done";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { Box, Button, IconButton, Paper, Typography } from "@mui/material";
import type React from "react";
import type { Transaction } from "../../../context/types";
import Summary from "./Summary";

interface TransactionSummaryPanelProps {
  transactions: Transaction[];
  handleDeleteTransaction: (id: number) => void;
  viewOnly?: boolean;
  isMobile: boolean;
  isSummaryExpanded?: boolean;
  toggleSummaryExpanded?: () => void;
  height?: string;
}

const TransactionSummaryPanel: React.FC<TransactionSummaryPanelProps> = ({
  transactions,
  handleDeleteTransaction,
  viewOnly = false,
  isMobile,
  isSummaryExpanded,
  toggleSummaryExpanded,
}) => {
  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        display: "flex",
        flexDirection: "column",
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
