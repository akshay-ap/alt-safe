import { Close as CloseIcon } from "@mui/icons-material";
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Paper, Typography } from "@mui/material";
import type React from "react";
import { decodeFunctionData } from "viem";
import safeABI from "../../abis/Safe.json";

interface InitDataDialogProps {
  open: boolean;
  onClose: () => void;
  initData: `0x${string}`;
  error?: string;
}

interface DecodedInitData {
  functionName: string;
  args?: readonly unknown[];
}

const InitDataDialog: React.FC<InitDataDialogProps> = ({ open, onClose, initData, error }) => {
  const decodedInitData: DecodedInitData | null =
    initData !== "0x" && error === undefined
      ? (() => {
          try {
            const { functionName, args } = decodeFunctionData({
              abi: safeABI,
              data: initData,
            });
            console.log("Decoded initData:", { functionName, args });
            return { functionName, args };
          } catch (err) {
            console.error("Failed to decode initData:", err);
            return null;
          }
        })()
      : null;

  const formatArgValue = (arg: any): string => {
    if (Array.isArray(arg)) {
      return `[${arg.map((item) => (typeof item === "string" ? item : String(item))).join(", ")}]`;
    }
    if (typeof arg === "bigint") {
      return arg.toString();
    }
    return String(arg);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        InitData Details
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {decodedInitData ? (
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
              Function: {decodedInitData.functionName}
            </Typography>

            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              Raw InitData:
            </Typography>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="body2" fontFamily="monospace" sx={{ wordBreak: "break-all" }}>
                {initData}
              </Typography>
            </Paper>

            <Typography variant="subtitle2" gutterBottom>
              Decoded Arguments:
            </Typography>
            {decodedInitData.args && decodedInitData.args.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {decodedInitData.args.map((arg: any, index: number) => (
                  <Paper key={index} sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Argument {index + 1}:
                    </Typography>
                    <Typography variant="body2" fontFamily="monospace" sx={{ wordBreak: "break-all", mt: 0.5 }}>
                      {formatArgValue(arg)}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No arguments found
              </Typography>
            )}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Unable to decode initData
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InitDataDialog;
