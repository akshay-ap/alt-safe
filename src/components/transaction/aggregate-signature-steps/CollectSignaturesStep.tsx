import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoIcon from "@mui/icons-material/Info";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, TextField, Typography } from "@mui/material";
import type { SignatureImportState, Transaction } from "../../../context/types";
import AccountAddress from "../../common/AccountAddress";
import Summary from "../Summary";

const CollectSignaturesStep: React.FC<{
  signatureStates: SignatureImportState[];
  onImportSignature: (index: number, value: string) => void;
  onRefreshApprovals: () => void;
  transactions: Transaction[];
  threshold: bigint | number;
  error?: string;
  onExecute: () => void;
  onBack: () => void;
  isLoading: boolean;
  executionError?: string;
}> = ({
  signatureStates,
  onImportSignature,
  onRefreshApprovals,
  transactions,
  threshold,
  error,
  onExecute,
  onBack,
  isLoading,
  executionError,
}) => {
  const validSignatureCount = signatureStates.filter((state) => state.signature || state.isApproved).length;

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Collect Signatures
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Import signatures or verify on-chain approvals. Required: {threshold.toString()} signatures.
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Summary viewOnly transactions={transactions} handleDeleteTransaction={() => {}} />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Alert
          severity="info"
          icon={<InfoIcon />}
          action={
            <Button color="inherit" size="small" onClick={onRefreshApprovals} startIcon={<RefreshIcon />}>
              Refresh
            </Button>
          }
        >
          {validSignatureCount} out of {threshold.toString()} required signatures collected
        </Alert>
      </Box>

      {signatureStates.map((state, index) => (
        <Box key={state.owner} sx={{ mb: 2 }}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <AccountAddress address={state.owner} short showCopy={false} />
                {state.isApproved && (
                  <Chip
                    label="Approved On-chain"
                    color="success"
                    size="small"
                    icon={<CheckCircleIcon />}
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>

              {!state.isApproved && (
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Paste signature data..."
                  value={state.importHex}
                  onChange={(e) => onImportSignature(index, e.target.value)}
                  disabled={state.isApproved}
                />
              )}
            </CardContent>
          </Card>
        </Box>
      ))}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="outlined" onClick={onBack} disabled={isLoading}>
          Back
        </Button>
        <Button
          variant="contained"
          onClick={onExecute}
          disabled={isLoading || validSignatureCount < threshold}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          Execute Transaction
        </Button>
      </Box>

      {executionError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {executionError}
        </Alert>
      )}
    </>
  );
};

export default CollectSignaturesStep;
