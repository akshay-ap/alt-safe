import { Box, Button, TextField, Typography } from "@mui/material";

const ImportTransactionStep: React.FC<{
  transactionImportHex: string;
  setTransactionImportHex: (value: string) => void;
  onImport: () => void;
  error?: string;
}> = ({ transactionImportHex, setTransactionImportHex, onImport, error }) => {
  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Import Transaction
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Paste the unsigned transaction data to begin the execution process.
        </Typography>
      </Box>

      <TextField
        fullWidth
        multiline
        rows={4}
        label="Transaction Data"
        value={transactionImportHex}
        onChange={(e) => setTransactionImportHex(e.target.value)}
        error={!!error}
        helperText={error}
        sx={{ mb: 3 }}
      />

      <Button
        variant="contained"
        fullWidth
        onClick={onImport}
        disabled={!transactionImportHex || transactionImportHex === "0x"}
      >
        Import Transaction
      </Button>
    </>
  );
};

export default ImportTransactionStep;
