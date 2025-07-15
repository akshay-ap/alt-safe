import CancelIcon from "@mui/icons-material/Cancel";
import { Box, IconButton, List, ListItem, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import type React from "react";
import AccountAddress from "../common/AccountAddress";
import { type Transaction, TransactionType } from "./types";

interface TransactionCardProps {
  transaction: Transaction & { id: number };
  onDelete: (id: number) => void;
  viewOnly?: boolean;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, onDelete, viewOnly = false }) => {
  return (
    <Grid size={12}>
      <List>
        {transaction.type === TransactionType.ETH_TRANSFER && (
          <EthTransferCard transaction={transaction} onDelete={onDelete} viewOnly={viewOnly} />
        )}
        {transaction.type === TransactionType.CONTRACT_CALL && (
          <ContractCallCard transaction={transaction} onDelete={onDelete} viewOnly={viewOnly} />
        )}
      </List>
    </Grid>
  );
};

const EthTransferCard: React.FC<TransactionCardProps> = ({ transaction, onDelete, viewOnly }) => (
  <ListItem
    secondaryAction={
      !viewOnly && (
        <IconButton edge="end" aria-label="cancel" onClick={() => onDelete(transaction.id)}>
          <CancelIcon />
        </IconButton>
      )
    }
  >
    <Box sx={{ marginLeft: 2 }}>
      <Typography gutterBottom sx={{ color: "text.secondary", fontSize: 14 }}>
        ETH Transfer
      </Typography>
      <Typography>
        To: <AccountAddress address={transaction.to} short />
      </Typography>
      <Typography>Value: {transaction.value}</Typography>
    </Box>
  </ListItem>
);

const ContractCallCard: React.FC<TransactionCardProps> = ({ transaction, onDelete, viewOnly }) => (
  <ListItem
    secondaryAction={
      !viewOnly && (
        <IconButton edge="end" aria-label="cancel" onClick={() => onDelete(transaction.id)}>
          <CancelIcon />
        </IconButton>
      )
    }
  >
    <Box sx={{ marginLeft: 2 }}>
      <Typography gutterBottom sx={{ color: "text.secondary", fontSize: 14 }}>
        Contract Call
      </Typography>
      <Typography>
        To: <AccountAddress address={transaction.to} short />
      </Typography>
      <Typography>Data: {transaction.data}</Typography>
    </Box>
  </ListItem>
);

export default TransactionCard;
