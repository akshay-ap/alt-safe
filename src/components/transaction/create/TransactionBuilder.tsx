import { Box, Typography } from "@mui/material";
import type React from "react";
import { useState } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import type { Transaction, TransactionSpec } from "../../../context/types";
import { useSafeWalletContext } from "../../../context/WalletContext";
import { ENCODE_FUNCTION_CALL } from "../../../utils/actionCatalog";
import ErrorBoundary from "../../common/ErrorBoundary";
import EncodeFunctionCall from "./EncodeFunctionCall";
import { ProtocolGrid, ProtocolHeader } from "./ProtocolPicker";
import TransactionInputBuilder from "./TransactionInputBuilder";

interface TransactionBuilderProps {
  handleAddTransaction: (newTransaction: Transaction) => void;
}

// On wide screens each column scrolls on its own so the page never grows past the viewport.
const COLUMN_SCROLL = { height: { lg: "100%" }, overflowY: { lg: "auto" }, minHeight: 0 } as const;

const TransactionBuilder: React.FC<TransactionBuilderProps> = ({ handleAddTransaction }) => {
  const navigate = useNavigate();
  // Bumped after each add so the form starts empty for the next action of the same protocol.
  const [addedCount, setAddedCount] = useState(0);

  const select = (group: string, action: string) => navigate(`/create-transaction/${group}/${action}`);
  const addAndReset = (transaction: Transaction) => {
    handleAddTransaction(transaction);
    setAddedCount((count) => count + 1);
  };

  return (
    <Box id="transaction-builder-container" sx={{ minWidth: 0, ...COLUMN_SCROLL }}>
      <Routes>
        <Route index element={<ProtocolGrid onSelect={select} />} />
        <Route
          path="/:group/:type"
          element={
            <ActionView
              onSelect={select}
              onBack={() => navigate("/create-transaction")}
              handleAddTransaction={addAndReset}
              formKey={addedCount}
            />
          }
        />
      </Routes>
    </Box>
  );
};

const ActionView: React.FC<{
  onSelect: (group: string, action: string) => void;
  onBack: () => void;
  handleAddTransaction: (transaction: Transaction) => void;
  formKey: number;
}> = ({ onSelect, onBack, handleAddTransaction, formKey }) => {
  const { group = "", type = "" } = useParams();
  return (
    <Box id="tx-action-input-form">
      <ProtocolHeader group={group} action={type} onSelect={onSelect} onBack={onBack} />
      <TransactionInputForm key={formKey} handleAddTransaction={handleAddTransaction} />
    </Box>
  );
};

const TransactionInputForm: React.FC<{
  handleAddTransaction: (newTransaction: Transaction) => void;
}> = ({ handleAddTransaction }) => {
  const { txBuilderSpec } = useSafeWalletContext();
  const { group, type } = useParams();

  const groupSpec = txBuilderSpec.find((spec) => spec.groupName === group);
  const transactionSpec = groupSpec?.actions.find((action) => action.name === type);

  if (group === ENCODE_FUNCTION_CALL.group && type === ENCODE_FUNCTION_CALL.actions[0]) {
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
