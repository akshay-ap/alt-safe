import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Box, Button, Typography } from "@mui/material";
import TransactionHash from "../../common/TransactionHash";

const ExecutionCompleteStep: React.FC<{
  transactionHash: `0x${string}`;
  onReset: () => void;
}> = ({ transactionHash, onReset }) => {
  return (
    <Box sx={{ textAlign: "center" }}>
      <CheckCircleIcon
        sx={{
          fontSize: 64,
          color: "success.main",
          mb: 2,
        }}
      />

      <Typography variant="h6" gutterBottom color="success.main">
        Transaction Executed Successfully
      </Typography>

      <Typography variant="body2" color="text.secondary" paragraph>
        Your transaction has been submitted to the blockchain.
      </Typography>

      <Box
        sx={{
          bgcolor: "background.default",
          p: 2,
          borderRadius: 1,
          mb: 3,
        }}
      >
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Transaction Hash
        </Typography>
        <TransactionHash hash={transactionHash} />
      </Box>

      <Button variant="outlined" onClick={onReset}>
        Create New Transaction
      </Button>
    </Box>
  );
};

export default ExecutionCompleteStep;
