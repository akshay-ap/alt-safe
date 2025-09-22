import CancelIcon from "@mui/icons-material/Cancel";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  IconButton,
  List,
  ListItemText,
  Typography,
} from "@mui/material";
import type React from "react";
import type { Transaction } from "../../context/types";
import TransactionCard from "./create/TransactionCard";

interface SummaryProps {
  transactions: Transaction[];
  safeTransactionHash?: `0x${string}`;
  handleDeleteTransaction: (id: number) => void;
  viewOnly?: boolean;
  expanded?: boolean;
}

const Summary: React.FC<SummaryProps> = ({
  transactions,
  handleDeleteTransaction,
  viewOnly = false,
  expanded = false,
}) => {
  if (transactions.length === 0) {
    return (
      <Typography
        color="text.secondary"
        sx={{
          p: 2,
          textAlign: "center",
          fontStyle: "italic",
        }}
      >
        No transactions added yet.
      </Typography>
    );
  }

  return (
    <List disablePadding>
      {transactions.map((transaction, index) => (
        <Accordion
          key={`${transaction.type}-${index}`}
          defaultExpanded={expanded}
          disableGutters
          sx={{
            mb: 1,
            "&:before": { display: "none" },
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              px: 2,
              borderBottom: expanded ? 1 : 0,
              borderColor: "divider",
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <ListItemText
              primary={transaction.actionName}
              secondary={
                <Typography variant="caption" color="text.secondary">
                  {transaction.groupName}
                </Typography>
              }
              sx={{ mr: 1 }}
            />
            <Chip size="small" label={transaction.type} sx={{ mr: 1 }} />
          </AccordionSummary>

          <AccordionDetails sx={{ px: 2, py: 1, position: "relative" }}>
            <TransactionCard transaction={transaction} />
            {!viewOnly && (
              <IconButton
                size="small"
                aria-label="remove"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTransaction(index);
                }}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                }}
                color="error"
              >
                <CancelIcon fontSize="small" />
              </IconButton>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </List>
  );
};

export default Summary;
