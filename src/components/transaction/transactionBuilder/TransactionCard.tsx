import { Paper, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import type React from "react";
import { formatEther } from "viem";
import { type Transaction, TransactionType } from "../../../context/types";
import AccountAddress from "../../common/AccountAddress";

interface TransactionCardProps {
  transaction: Transaction;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ transaction }) => {
  if (transaction.type === TransactionType.ETH_TRANSFER) return <EthTransferCard transaction={transaction} />;

  if (transaction.type === TransactionType.CONTRACT_CALL) return <ContractCallCard transaction={transaction} />;

  return null;
};

const EthTransferCard: React.FC<TransactionCardProps> = ({ transaction }) => (
  <Grid container spacing={2}>
    <Grid size={{ xs: 12, md: 6 }}>
      <Typography variant="body2" color="text.secondary">
        Recipient
      </Typography>
      <AccountAddress showCopy={false} short address={transaction.to} />
    </Grid>

    <Grid size={{ xs: 12, md: 6 }}>
      <Typography variant="body2" color="text.secondary">
        Amount
      </Typography>
      <Typography variant="body1" fontWeight={500}>
        {formatEther(BigInt(transaction.value))} ETH
      </Typography>
    </Grid>
  </Grid>
);

const ContractCallCard: React.FC<TransactionCardProps> = ({ transaction }) => (
  <Grid container spacing={2}>
    <Grid size={12}>
      <Typography variant="body2" color="text.secondary">
        Contract
      </Typography>
      <AccountAddress showCopy={false} short address={transaction.to} />
    </Grid>

    {transaction.value && BigInt(transaction.value) > 0n && (
      <Grid size={{ xs: 12, md: 6 }}>
        <Typography variant="body2" color="text.secondary">
          Value
        </Typography>
        <Typography variant="body1">{formatEther(BigInt(transaction.value))} ETH</Typography>
      </Grid>
    )}

    <Grid size={{ xs: 12 }}>
      <Typography variant="body2" color="text.secondary">
        Data
      </Typography>
      <Paper
        variant="outlined"
        sx={{
          p: 1,
          mt: 0.5,
          fontFamily: "monospace",
          fontSize: "0.75rem",
          wordBreak: "break-all",
          maxHeight: "80px",
          overflow: "auto",
        }}
      >
        {transaction.data}
      </Paper>
    </Grid>
  </Grid>
);

export default TransactionCard;
