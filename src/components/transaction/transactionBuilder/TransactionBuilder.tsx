import { Button, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import type React from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import { useSafeWalletContext } from "../../../context/WalletContext";
import type { Transaction, TransactionSpec } from "../../../context/types";
import ErrorBoundary from "../../common/ErrorBoundary";
import EncodeFunctionCall from "./EncodeFunctionCall";
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

  return (
    <Grid container spacing={2} id="transaction-builder-container">
      <Grid
        size={4}
        sx={{ overflowY: "scroll", height: "60vh", scrollbarWidth: "thin" }}
        id="transaction-type-panel-container"
      >
        <TransactionTypePanel onSelect={handleTransactionTypeSelect} />
      </Grid>

      <Grid
        size={8}
        sx={{ overflowY: "scroll", height: "60vh", scrollbarWidth: "thin" }}
        id="transaction-input-panel-container"
      >
        <Routes>
          <Route
            path="/:group/:type"
            element={
              <Grid id="tx-action-input-form" size={12}>
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
      <div id="import-transaction-form">
        <Typography variant="h6" id="import-transaction-title">
          Import Transactions
        </Typography>
        <TextField
          id="import-hex-input"
          label="Hex Encoded JSON"
          value={importHex}
          onChange={(e) => setImportHex(e.target.value as `0x${string}`)}
          fullWidth
          margin="normal"
        />
        <Button id="import-transaction-button" variant="contained" color="primary" onClick={handleImportTransactions}>
          Import
        </Button>
      </div>
    );
  }

  if (type === "encodeFunctionCall") {
    return (
      <div id="encode-function-call-form">
        <EncodeFunctionCall
          onAdd={handleAddTransaction}
          groupInfo={{
            name: group as string,
          }}
        />
      </div>
    );
  }

  if (transactionSpec && groupSpec) {
    return (
      <div id={`transaction-input-form-${group}-${type}`}>
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
      </div>
    );
  }

  return (
    <div id="invalid-transaction-type">
      <Typography variant="body1">Invalid transaction type selected.</Typography>
    </div>
  );
};

export default TransactionBuilder;
