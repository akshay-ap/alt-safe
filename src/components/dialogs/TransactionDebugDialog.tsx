import { Close as CloseIcon, Code as CodeIcon } from "@mui/icons-material";
import { Dialog, DialogContent, DialogTitle, IconButton, useMediaQuery, useTheme } from "@mui/material";
import type React from "react";
import type { TransactionSpec } from "../../context/types";
import TransactionDebugView from "../transaction/transactionBuilder/TransactionDebugView";

interface TransactionDebugDialogProps {
  open: boolean;
  onClose: () => void;
  spec: TransactionSpec;
  context: Record<string, any>;
  inputs: Record<string, string>;
  errors: Record<string, { id: string; errorMessage: string }[]>;
}

const TransactionDebugDialog: React.FC<TransactionDebugDialogProps> = ({
  open,
  onClose,
  spec,
  context,
  inputs,
  errors,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={fullScreen}
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: fullScreen ? 0 : 2,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
          borderBottom: 1,
          borderColor: "divider",
          backgroundColor: theme.palette.mode === "dark" ? "grey.800" : "grey.100",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CodeIcon color="primary" />
          <span style={{ fontWeight: "bold", color: theme.palette.primary.main }}>Calldata Debug Information</span>
        </div>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "text.secondary",
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflow: "auto" }}>
        <TransactionDebugView spec={spec} context={context} inputs={inputs} errors={errors} />
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDebugDialog;
