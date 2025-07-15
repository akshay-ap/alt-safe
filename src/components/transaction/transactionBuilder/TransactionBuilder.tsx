import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Button, IconButton, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import type React from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import { useSafeWalletContext } from "../../../context/WalletContext";
import type { Transaction, TransactionSpec } from "../../../context/types";
import ErrorBoundary from "../../common/ErrorBoundary";
import TransactionInputBuilder from "./TransactionInputBuilder";
import TransactionTypePanel from "./TransactionTypePanel";

interface TransactionBuilderProps {
  importHex: `0x${string}`;
  setImportHex: (value: `0x${string}`) => void;
  handleAddTransaction: (newTransaction: Transaction) => void;
  handleImportTransactions: () => void;
}

const TransactionBuilder: React.FC<TransactionBuilderProps> = ({
  importHex,
  setImportHex,
  handleAddTransaction,
  handleImportTransactions,
}) => {
  const navigate = useNavigate();

  const handleTransactionTypeSelect = (group: string, type: string) => {
    navigate(`/create-transaction/${group}/${type}`);
  };

  const handleBackClick = () => {
    navigate("/create-transaction");
  };

  return (
    <Grid container spacing={2} sx={{ overflowY: "scroll", height: "60vh", scrollbarWidth: "thin" }}>
      <Routes>
        {/* Default route to show TransactionTypePanel */}
        <Route path="/" element={<TransactionTypePanel onSelect={handleTransactionTypeSelect} />} />

        {/* Route for transaction input form */}
        <Route
          path="/:group/:type"
          element={
            <Grid id="tx-action-input-form" size={12}>
              <IconButton onClick={handleBackClick} sx={{ marginBottom: 2 }}>
                <ArrowBackIcon />
              </IconButton>
              <TransactionInputForm
                importHex={importHex}
                setImportHex={setImportHex}
                handleAddTransaction={handleAddTransaction}
                handleImportTransactions={handleImportTransactions}
              />
            </Grid>
          }
        />
      </Routes>
    </Grid>
  );
};

const TransactionInputForm: React.FC<{
  importHex: `0x${string}`;
  setImportHex: (value: `0x${string}`) => void;
  handleAddTransaction: (newTransaction: Transaction) => void;
  handleImportTransactions: () => void;
}> = ({ importHex, setImportHex, handleAddTransaction, handleImportTransactions }) => {
  const { txBuilderSpec } = useSafeWalletContext();
  const { group, type } = useParams();

  const groupSpec = txBuilderSpec.find((spec) => spec.groupName === group);
  const transactionSpec = groupSpec?.actions.find((action) => action.name === type);

  if (type === "Import") {
    return (
      <>
        <Typography variant="h6">Import Transactions</Typography>
        <TextField
          label="Hex Encoded JSON"
          value={importHex}
          onChange={(e) => setImportHex(e.target.value as `0x${string}`)}
          fullWidth
          margin="normal"
        />
        <Button variant="contained" color="primary" onClick={handleImportTransactions}>
          Import
        </Button>
      </>
    );
  }

  if (transactionSpec && groupSpec) {
    return (
      <ErrorBoundary key={`error-boundary-${group}-${type}`}>
        <TransactionInputBuilder
          key={`${group}-${type}`}
          onAdd={handleAddTransaction}
          spec={transactionSpec as TransactionSpec}
          groupInfo={{
            name: group as string,
          }}
        />
      </ErrorBoundary>
    );
  }

  return <Typography variant="body1">Invalid transaction type selected.</Typography>;
};

export default TransactionBuilder;
