import { Card, CardContent, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import type React from "react";
import { useEffect, useState } from "react";
import { STORAGE_KEY } from "../constants";
import { type SafeTransactionInfo, useSafeWalletContext } from "../context/WalletContext";
import AccountAddress from "./common/AccountAddress";
import Title from "./common/Title";

const SafeTransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<SafeTransactionInfo[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<SafeTransactionInfo[]>([]);
  const [searchAddress, setSearchAddress] = useState<string>("");
  const [searchChainId, setSearchChainId] = useState<number | "">("");
  const { storage } = useSafeWalletContext();

  useEffect(() => {
    (async () => {
      const storedTransactions = (await storage.getItem(STORAGE_KEY.SAFE_TRANSACTIONS)) as SafeTransactionInfo[];
      setTransactions(storedTransactions || []);
      setFilteredTransactions(storedTransactions || []);
    })();
  }, [storage]);

  useEffect(() => {
    let filtered = transactions;

    if (searchAddress) {
      filtered = filtered.filter((transaction) =>
        transaction.safeAccount.toLowerCase().includes(searchAddress.toLowerCase()),
      );
    }

    if (searchChainId !== "") {
      filtered = filtered.filter((transaction) => transaction.chainId === searchChainId);
    }

    setFilteredTransactions(filtered);
  }, [searchAddress, searchChainId, transactions]);

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Title text="Transaction History" />
      </Grid>
      <Grid size={12}>
        <TextField
          label="Search by Account Address"
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
          fullWidth
          margin="normal"
        />
      </Grid>
      <Grid size={12}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Search by Chain ID</InputLabel>
          <Select
            value={searchChainId}
            onChange={(e) => setSearchChainId(e.target.value as number)}
            label="Search by Chain ID"
          >
            <MenuItem value="">All</MenuItem>
            {Array.from(new Set(transactions.map((transaction) => transaction.chainId))).map((chainId) => (
              <MenuItem key={chainId} value={chainId}>
                {chainId}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      {filteredTransactions.length > 0 ? (
        filteredTransactions.map((transaction, index) => (
          <Grid size={12} key={transaction.transactionHash}>
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <Typography variant="h6">Transaction {index + 1}</Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography>Safe Account:</Typography>
                    <AccountAddress address={transaction.safeAccount} />
                  </Grid>
                  <Grid size={12}>
                    <Typography>ChainId:</Typography>
                    <Typography>{transaction.chainId}</Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography>Transaction Hash:</Typography>
                    <Typography>{transaction.transactionHash}</Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography>Status:</Typography>
                    <Typography>{transaction.status}</Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography>Block Number:</Typography>
                    <Typography>{transaction.blockNumber?.toString()}</Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography>Block Hash:</Typography>
                    <Typography>{transaction.blockHash}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))
      ) : (
        <Grid size={12}>
          <Typography>No transactions found.</Typography>
        </Grid>
      )}
    </Grid>
  );
};

export default SafeTransactionHistory;
