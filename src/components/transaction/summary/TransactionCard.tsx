import { Alert, Paper, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import type React from "react";
import { decodeFunctionData, formatEther, isAddress, isAddressEqual } from "viem";
import { useAccount } from "wagmi";
import safeABI from "../../../abis/Safe.json";
import { type Transaction, TransactionType } from "../../../context/types";
import { useSafeWalletContext } from "../../../context/WalletContext";
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

const decodeSafeCall = (data: `0x${string}`) => {
  try {
    const { functionName, args } = decodeFunctionData({ abi: safeABI, data });
    return `${functionName}(${(args ?? []).map(String).join(", ")})`;
  } catch {
    return undefined;
  }
};

// A call to the Safe itself can add owners, change the threshold, or enable modules and guards.
const SelfCallWarning: React.FC<TransactionCardProps> = ({ transaction: { to, data } }) => {
  const { safeAccount } = useSafeWalletContext();
  if (!safeAccount || !isAddress(to, { strict: false }) || !isAddressEqual(to, safeAccount)) return null;
  const decoded = decodeSafeCall(data);
  return (
    <Grid size={12}>
      <Alert severity="warning">
        This call targets your Safe itself and can change its owners, threshold, modules or guard.{" "}
        {decoded ? (
          <>
            It calls{" "}
            <Typography component="span" sx={{ fontFamily: "monospace", fontSize: "0.85em", overflowWrap: "anywhere" }}>
              {decoded}
            </Typography>
            .
          </>
        ) : (
          "Its data is not a known Safe function. Check it carefully before signing."
        )}
      </Alert>
    </Grid>
  );
};

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
    <SelfCallWarning transaction={transaction} />

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
