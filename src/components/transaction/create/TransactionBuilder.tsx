import DataObjectIcon from "@mui/icons-material/DataObject";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import TollOutlinedIcon from "@mui/icons-material/TollOutlined";
import { Box, Card, CardActionArea, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import type React from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import type { Transaction, TransactionSpec } from "../../../context/types";
import { useSafeWalletContext } from "../../../context/WalletContext";
import { availableQuickActions, buildActionCatalog, ENCODE_FUNCTION_CALL } from "../../../utils/actionCatalog";
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
          <Route index element={<QuickStart onSelect={handleTransactionTypeSelect} />} />
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

const QUICK_ICONS: Record<string, React.ReactNode> = {
  "Send native token": <SendOutlinedIcon />,
  "Send tokens": <TollOutlinedIcon />,
  "Call a contract": <DataObjectIcon />,
};

/** Start screen: the few common actions as tiles; everything else is in the list. */
const QuickStart: React.FC<{ onSelect: (group: string, action: string) => void }> = ({ onSelect }) => {
  const { chainId } = useAccount();
  const { txBuilderSpec } = useSafeWalletContext();
  const quickActions = availableQuickActions(buildActionCatalog(txBuilderSpec, chainId, ""));

  return (
    <Box sx={{ pt: { md: 1 } }}>
      <Typography variant="h5" component="h2">
        What would you like to do?
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Start here, or pick any action from the list.
      </Typography>
      <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" } }}>
        {quickActions.map((quick) => (
          <Card key={quick.title}>
            <CardActionArea onClick={() => onSelect(quick.group, quick.action)} sx={{ p: 2, height: "100%" }}>
              <Box sx={{ color: "primary.main", mb: 1.5, display: "flex" }}>{QUICK_ICONS[quick.title]}</Box>
              <Typography variant="subtitle2">{quick.title}</Typography>
              <Typography variant="caption">{quick.subtitle}</Typography>
            </CardActionArea>
          </Card>
        ))}
      </Box>
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
