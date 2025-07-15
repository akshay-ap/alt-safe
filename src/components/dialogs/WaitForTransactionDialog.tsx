import { CircularProgress, Dialog, DialogContent, DialogTitle } from "@mui/material";
import { waitForTransactionReceipt } from "@wagmi/core";
import { useEffect, useRef, useState } from "react";

import { config } from "../../wagmi";

interface WaitForTransactionDialogProps {
  open: boolean;
  hash: `0x${string}` | undefined;
  onClose: () => void;
}

const WaitForTransactionDialog: React.FC<WaitForTransactionDialogProps> = ({ open, hash, onClose }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      (async () => {
        if (!hash) return;
        setLoading(true);
        await waitForTransactionReceipt(config, {
          confirmations: 1,
          hash: hash,
          onReplaced: (replacement) => console.log("Replaced tx", replacement),
        });
        setLoading(false);
        onClose();
      })();
    }
  });

  return (
    <Dialog open={open}>
      <DialogTitle>Waiting for transaciton confirmation</DialogTitle>
      <DialogContent>
        {hash}
        {loading && <CircularProgress />}
      </DialogContent>
    </Dialog>
  );
};

export default WaitForTransactionDialog;
