import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Box, Button, CircularProgress, List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material";
import type React from "react";
import AccountAddress from "../common/AccountAddress";

interface ApprovalStatusProps {
  safeTransactionHash: string;
  isHashValid: boolean;
  fetchingApprovals: boolean;
  approvals: Record<string, boolean>;
  owners: `0x${string}`[];
  onRefresh: () => void; // New prop for the refresh action
}

const ApprovalStatus: React.FC<ApprovalStatusProps> = ({
  safeTransactionHash,
  isHashValid,
  fetchingApprovals,
  approvals,
  owners,
  onRefresh,
}) => {
  if (!safeTransactionHash || !isHashValid) return null;

  return (
    <Box sx={{ marginTop: 4 }}>
      <Typography variant="h6">Approval Status</Typography>
      <Button
        variant="outlined"
        color="secondary"
        onClick={onRefresh}
        disabled={fetchingApprovals}
        startIcon={<RefreshIcon />}
        sx={{ marginBottom: 2 }}
      >
        Refresh
      </Button>
      {fetchingApprovals ? (
        <CircularProgress sx={{ display: "block", margin: "auto", marginTop: 2 }} />
      ) : (
        <List>
          {owners.map((owner) => (
            <ListItem key={owner}>
              <ListItemIcon>
                {approvals[owner] ? <CheckCircleIcon color="success" /> : <InfoOutlined color="info" />}
              </ListItemIcon>
              <ListItemText
                primary={<AccountAddress address={owner} />}
                secondary={approvals[owner] ? "Approved" : "Not Approved"}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default ApprovalStatus;
