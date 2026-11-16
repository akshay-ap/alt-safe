import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import type React from "react";
import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAccount } from "wagmi";
import { useSafeWalletContext } from "../../../context/WalletContext";
import { buildActionCatalog } from "../../../utils/actionCatalog";

interface TransactionTypePanelProps {
  onSelect: (group: string, type: string) => void;
}

// The selected action is part of the URL (/create-transaction/:group/:type), so deep links highlight too.
const useSelectedAction = () => {
  const [, , group, action] = useLocation().pathname.split("/").map(decodeURIComponent);
  return { group, action };
};

const TransactionTypePanel: React.FC<TransactionTypePanelProps> = ({ onSelect }) => {
  const { chainId } = useAccount();
  const { txBuilderSpec } = useSafeWalletContext();
  const [query, setQuery] = useState("");
  const selected = useSelectedAction();
  const sections = useMemo(() => buildActionCatalog(txBuilderSpec, chainId, query), [txBuilderSpec, chainId, query]);
  const isSelected = (group: string, action: string) => selected.group === group && selected.action === action;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }} id="transaction-type-panel">
      <TextField
        id="transaction-search-input"
        size="small"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search actions"
        aria-label="Search actions"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
      <Paper variant="outlined" sx={{ overflow: "hidden" }}>
        <List id="transaction-types-list" dense disablePadding component="nav" aria-label="Transaction actions">
          {sections.map((section) => (
            <li key={section.group}>
              <List dense disablePadding>
                <ListSubheader disableSticky sx={{ lineHeight: "32px", bgcolor: "transparent" }}>
                  {section.group}
                </ListSubheader>
                {section.actions.map((action) => (
                  <ListItemButton
                    key={action}
                    selected={isSelected(section.group, action)}
                    onClick={() => onSelect(section.group, action)}
                    sx={{ pl: 3 }}
                  >
                    <ListItemText primary={action} />
                  </ListItemButton>
                ))}
              </List>
            </li>
          ))}
        </List>
        {sections.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1.5 }} id="empty-state-message">
            No action matches “{query.trim()}”. Encode Function Call can call any contract.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default TransactionTypePanel;
