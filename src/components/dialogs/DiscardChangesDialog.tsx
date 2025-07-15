import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";

interface DiscardChangesDialogProps {
  open: boolean;
  onClose: () => void;
  onDiscard: () => void;
}

const DiscardChangesDialog: React.FC<DiscardChangesDialogProps> = ({ open, onClose, onDiscard }) => {
  const handleDiscard = () => {
    onDiscard();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Discard Changes?</DialogTitle>
      <DialogContent>
        <Typography>You have unsaved changes to your transaction. Are you sure you want to discard them?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleDiscard} color="error">
          Discard Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DiscardChangesDialog;
