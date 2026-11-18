import {
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import type React from "react";
import { useEffect, useState } from "react";
import { useChains } from "wagmi";
import { STORAGE_KEY } from "../constants";
import { type SafeTransactionInfo, useSafeWalletContext } from "../context/WalletContext";
import { TOP_BAR_HEIGHT } from "./app/NavigationBar";
import AccountAddress from "./common/AccountAddress";
import Title from "./common/Title";
import TransactionHash from "./common/TransactionHash";

// Header, description and filters above the table; the table body scrolls within the rest.
const TABLE_OFFSET = TOP_BAR_HEIGHT + 260;

const matches = (transaction: SafeTransactionInfo, address: string, chainId: number | "") =>
  transaction.safeAccount.toLowerCase().includes(address.trim().toLowerCase()) &&
  (chainId === "" || transaction.chainId === chainId);

const HistoryRow: React.FC<{ transaction: SafeTransactionInfo }> = ({ transaction }) => {
  const chain = useChains().find((candidate) => candidate.id === transaction.chainId);
  return (
    <TableRow hover>
      <TableCell sx={{ fontVariantNumeric: "tabular-nums" }}>
        {transaction.safeTransactionParams.nonce.toString()}
      </TableCell>
      <TableCell>
        <AccountAddress address={transaction.safeAccount} short size="small" />
      </TableCell>
      <TableCell>{chain?.name ?? `Chain ${transaction.chainId}`}</TableCell>
      <TableCell>
        <TransactionHash
          hash={transaction.transactionHash}
          short
          size="small"
          showExplorer
          explorerUrl={chain?.blockExplorers?.default.url}
        />
      </TableCell>
      <TableCell sx={{ fontVariantNumeric: "tabular-nums" }}>{transaction.blockNumber?.toString() ?? "—"}</TableCell>
      <TableCell>{transaction.status ?? "—"}</TableCell>
    </TableRow>
  );
};

const SafeTransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<SafeTransactionInfo[]>([]);
  const [searchAddress, setSearchAddress] = useState<string>("");
  const [searchChainId, setSearchChainId] = useState<number | "">("");
  const { storage } = useSafeWalletContext();
  const chains = useChains();

  useEffect(() => {
    (async () => {
      const stored = (await storage.getItem(STORAGE_KEY.SAFE_TRANSACTIONS)) as SafeTransactionInfo[] | null;
      setTransactions(stored ?? []);
    })();
  }, [storage]);

  const filtered = transactions.filter((transaction) => matches(transaction, searchAddress, searchChainId));
  const chainIds = [...new Set(transactions.map((transaction) => transaction.chainId))];

  return (
    <>
      <Title
        text="History"
        description="Transactions executed from this browser. ALT Safe has no indexer, so executions made elsewhere are not listed."
      />
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Filter by Safe address"
          value={searchAddress}
          onChange={(event) => setSearchAddress(event.target.value)}
          size="small"
          sx={{ flex: 1 }}
        />
        <TextField
          select
          label="Network"
          value={searchChainId}
          onChange={(event) => setSearchChainId(event.target.value === "" ? "" : Number(event.target.value))}
          size="small"
          sx={{ minWidth: 220 }}
          slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
        >
          <MenuItem value="">All networks</MenuItem>
          {chainIds.map((chainId) => (
            <MenuItem key={chainId} value={chainId}>
              {chains.find((chain) => chain.id === chainId)?.name ?? `Chain ${chainId}`}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ maxHeight: { md: `calc(100vh - ${TABLE_OFFSET}px)` } }}
      >
        <Table stickyHeader size="small" aria-label="Executed transactions">
          <TableHead>
            <TableRow>
              <TableCell>Nonce</TableCell>
              <TableCell>Safe</TableCell>
              <TableCell>Network</TableCell>
              <TableCell>Transaction</TableCell>
              <TableCell>Block</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((transaction) => (
              <HistoryRow key={transaction.transactionHash} transaction={transaction} />
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2.5 }}>
            {transactions.length === 0
              ? "No transactions executed from this browser yet."
              : "No transactions match these filters."}
          </Typography>
        )}
      </TableContainer>
    </>
  );
};

export default SafeTransactionHistory;
