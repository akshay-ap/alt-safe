import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import type React from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import type { Transaction, TransactionSpec } from "../../../context/types";
import { useSafeWalletContext } from "../../../context/WalletContext";
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

// On wide screens each column scrolls on its own so the page never grows past the viewport.
const COLUMN_SCROLL = { height: { lg: "100%" }, overflowY: { lg: "auto" }, minHeight: 0 } as const;

const TransactionBuilder: React.FC<TransactionBuilderProps> = ({
  importHex,
  setImportHex,
  handleAddTransaction,
  handleImportTransactions,
}) => {
  const navigate = useNavigate();

  const handleTransactionTypeSelect = (group: string, type: string) => navigate(`/create-transaction/${group}/${type}`);

  return (
    <Box
      id="transaction-builder-container"
      sx={{
        display: "grid",
        gap: 3,
        alignItems: "start",
        gridTemplateColumns: { xs: "1fr", md: "260px minmax(0, 1fr)" },
        height: { lg: "100%" },
        gridTemplateRows: { lg: "minmax(0, 1fr)" },
      }}
    >
      <Box id="transaction-type-panel-container" sx={COLUMN_SCROLL}>
        <TransactionTypePanel onSelect={handleTransactionTypeSelect} />
      </Box>

      <Box id="transaction-input-panel-container" sx={{ minWidth: 0, ...COLUMN_SCROLL }}>
        <Routes>
          <Route index element={<EmptyForm />} />
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
      </Box>
    </Box>
  );
};

const EmptyForm: React.FC = () => (
  <Paper variant="outlined" sx={{ p: 3, borderStyle: "dashed" }}>
    <Typography variant="h6" component="h2" gutterBottom>
      Choose an action
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Pick what this transaction should do from the list: send the native token, transfer an ERC-20, call any contract,
      or import a transaction someone shared with you. You can add several actions to one batch; they run in order when
      the Safe executes, and if one fails, none of them take effect.
    </Typography>
  </Paper>
);

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
