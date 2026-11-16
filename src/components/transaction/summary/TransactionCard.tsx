import { Paper, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import type React from "react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { type Transaction, TransactionType } from "../../../context/types";
import AccountAddress from "../../common/AccountAddress";

interface TransactionCardProps {
  transaction: Transaction;
}

// Exact amount, never rounded: this is what the Safe will send. Long values wrap instead of overflowing.
const NativeAmount: React.FC<{ value: string }> = ({ value }) => {
  const symbol = useAccount().chain?.nativeCurrency.symbol ?? "ETH";
  return (
    <Typography variant="body1" sx={{ fontWeight: 500, overflowWrap: "anywhere", fontVariantNumeric: "tabular-nums" }}>
      {formatEther(BigInt(value))} {symbol}
    </Typography>
  );
};

const TransactionCard: React.FC<TransactionCardProps> = ({ transaction }) => {
  if (transaction.type === TransactionType.ETH_TRANSFER) return <EthTransferCard transaction={transaction} />;

  if (transaction.type === TransactionType.CONTRACT_CALL) return <ContractCallCard transaction={transaction} />;

  return null;
};

const EthTransferCard: React.FC<TransactionCardProps> = ({ transaction }) => (
  <Grid container spacing={2}>
    <Grid size={{ xs: 12, md: 6 }}>
      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
        }}
      >
        Recipient
      </Typography>
      <AccountAddress showCopy={false} short address={transaction.to} />
    </Grid>

    <Grid size={{ xs: 12, md: 6 }}>
      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
        }}
      >
        Amount
      </Typography>
      <NativeAmount value={transaction.value} />
    </Grid>
  </Grid>
);

const ContractCallCard: React.FC<TransactionCardProps> = ({ transaction }) => (
  <Grid container spacing={2}>
    <Grid size={12}>
      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
        }}
      >
        Contract
      </Typography>
      <AccountAddress showCopy={false} short address={transaction.to} />
    </Grid>

    {transaction.value && BigInt(transaction.value) > 0n && (
      <Grid size={{ xs: 12, md: 6 }}>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
          }}
        >
          Value
        </Typography>
        <NativeAmount value={transaction.value} />
      </Grid>
    )}

    <Grid size={{ xs: 12 }}>
      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
        }}
      >
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
