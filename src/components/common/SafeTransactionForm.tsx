import { TextField } from "@mui/material";
import Grid from "@mui/material/Grid2";
import type React from "react";
import type { SafeTransactionParams } from "../../utils/utils";

interface SafeTransactionFormProps {
  transaction: SafeTransactionParams;
  readOnly?: boolean; // Determines if the form is read-only
  onChange?: (field: keyof SafeTransactionParams, value: string | number) => void; // Change handler
}

const SafeTransactionForm: React.FC<SafeTransactionFormProps> = ({ transaction, readOnly = false, onChange }) => {
  const handleFieldChange = (field: keyof SafeTransactionParams) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(field, event.target.value);
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <TextField
          label="To"
          placeholder="0x"
          defaultValue={transaction.to}
          fullWidth
          slotProps={{
            input: {
              readOnly: readOnly,
            },
          }}
          onChange={handleFieldChange("to")}
          variant="outlined"
        />
      </Grid>
      <Grid size={12}>
        <TextField
          label="Value"
          placeholder="0"
          defaultValue={transaction.value.toString()}
          fullWidth
          slotProps={{
            input: {
              readOnly: readOnly,
            },
          }}
          onChange={handleFieldChange("value")}
          variant="outlined"
        />
      </Grid>
      <Grid size={12}>
        <TextField
          label="Data"
          defaultValue={transaction.data}
          placeholder={transaction.data}
          fullWidth
          multiline
          minRows={3}
          slotProps={{
            input: {
              readOnly: readOnly,
            },
          }}
          onChange={handleFieldChange("data")}
          variant="outlined"
        />
      </Grid>
      <Grid size={12}>
        <TextField
          label="Operation"
          placeholder="0"
          defaultValue={transaction.operation.toString()}
          fullWidth
          slotProps={{
            input: {
              readOnly: readOnly,
            },
          }}
          onChange={handleFieldChange("operation")}
          variant="outlined"
        />
      </Grid>
      <Grid size={12}>
        <TextField
          label="SafeTxGas"
          defaultValue={transaction.safeTxGas.toString()}
          fullWidth
          slotProps={{
            input: {
              readOnly: readOnly,
            },
          }}
          onChange={handleFieldChange("safeTxGas")}
          variant="outlined"
        />
      </Grid>
      <Grid size={12}>
        <TextField
          label="BaseGas"
          defaultValue={transaction.baseGas.toString()}
          fullWidth
          slotProps={{
            input: {
              readOnly: readOnly,
            },
          }}
          onChange={handleFieldChange("baseGas")}
          variant="outlined"
        />
      </Grid>
      <Grid size={12}>
        <TextField
          label="GasPrice"
          defaultValue={transaction.gasPrice.toString()}
          fullWidth
          slotProps={{
            input: {
              readOnly: readOnly,
            },
          }}
          onChange={handleFieldChange("gasPrice")}
          variant="outlined"
        />
      </Grid>
      <Grid size={12}>
        <TextField
          label="GasToken"
          defaultValue={transaction.gasToken}
          fullWidth
          slotProps={{
            input: {
              readOnly: readOnly,
            },
          }}
          onChange={handleFieldChange("gasToken")}
          variant="outlined"
        />
      </Grid>
      <Grid size={12}>
        <TextField
          label="RefundReceiver"
          defaultValue={transaction.refundReceiver}
          fullWidth
          slotProps={{
            input: {
              readOnly: readOnly,
            },
          }}
          onChange={handleFieldChange("refundReceiver")}
          variant="outlined"
        />
      </Grid>
      <Grid size={12}>
        <TextField
          label="Nonce"
          defaultValue={transaction.nonce.toString()}
          fullWidth
          slotProps={{
            input: {
              readOnly: readOnly,
            },
          }}
          onChange={handleFieldChange("nonce")}
          variant="outlined"
        />
      </Grid>
    </Grid>
  );
};

export default SafeTransactionForm;
