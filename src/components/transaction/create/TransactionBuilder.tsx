import { Box, Paper, Typography } from "@mui/material";
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
  handleAddTransaction: (newTransaction: Transaction) => void;
}

// On wide screens each column scrolls on its own so the page never grows past the viewport.
const COLUMN_SCROLL = { height: { lg: "100%" }, overflowY: { lg: "auto" }, minHeight: 0 } as const;

const TransactionBuilder: React.FC<TransactionBuilderProps> = ({ handleAddTransaction }) => {
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
                <TransactionInputForm handleAddTransaction={handleAddTransaction} />
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
      Pick what this transaction should do from the list: send the native token, transfer an ERC-20 or call any
      contract. You can add several actions to one batch; they run in order when the Safe executes, and if one fails,
      none of them take effect.
    </Typography>
  </Paper>
);

const TransactionInputForm: React.FC<{
  handleAddTransaction: (newTransaction: Transaction) => void;
}> = ({ handleAddTransaction }) => {
  const { txBuilderSpec } = useSafeWalletContext();
  const { group, type } = useParams();

  const groupSpec = txBuilderSpec.find((spec) => spec.groupName === group);
  const transactionSpec = groupSpec?.actions.find((action) => action.name === type);

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
