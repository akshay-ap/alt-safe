import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Chip,
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
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAccount } from "wagmi";
import { useSafeWalletContext } from "../../../context/WalletContext";
import { type ActionSection, buildActionCatalog } from "../../../utils/actionCatalog";

interface TransactionTypePanelProps {
  onSelect: (group: string, type: string) => void;
}

// The selected action is part of the URL (/create-transaction/:group/:type), so deep links highlight too.
const useSelectedAction = () => {
  const [, , group, action] = useLocation().pathname.split("/").map(decodeURIComponent);
  return { group, action };
};

const ActionRows: React.FC<{
  section: ActionSection;
  isSelected: (group: string, action: string) => boolean;
  onSelect: (group: string, action: string) => void;
}> = ({ section, isSelected, onSelect }) => (
  <>
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
  </>
);

/** Default view: one row per template; a single-action template is picked directly. */
const GroupRows: React.FC<{
  sections: ActionSection[];
  selectedGroup?: string;
  onOpen: (group: string) => void;
  onSelect: (group: string, action: string) => void;
}> = ({ sections, selectedGroup, onOpen, onSelect }) => (
  <>
    {sections.map((section) => {
      const [only] = section.actions;
      const isSingle = section.actions.length === 1;
      return (
        <ListItemButton
          key={section.group}
          selected={section.group === selectedGroup}
          onClick={() => (isSingle ? onSelect(section.group, only) : onOpen(section.group))}
        >
          <ListItemText primary={section.group} secondary={isSingle ? only : undefined} />
          {!isSingle && (
            <>
              <Chip size="small" label={section.actions.length} sx={{ mr: 0.5 }} />
              <ChevronRightIcon fontSize="small" sx={{ color: "text.secondary" }} />
            </>
          )}
        </ListItemButton>
      );
    })}
  </>
);

const TransactionTypePanel: React.FC<TransactionTypePanelProps> = ({ onSelect }) => {
  const { chainId } = useAccount();
  const { txBuilderSpec } = useSafeWalletContext();
  const [query, setQuery] = useState("");
  const [openGroup, setOpenGroup] = useState<string>();
  const selected = useSelectedAction();
  const sections = useMemo(() => buildActionCatalog(txBuilderSpec, chainId, query), [txBuilderSpec, chainId, query]);
  const allSections = useMemo(() => buildActionCatalog(txBuilderSpec, chainId, ""), [txBuilderSpec, chainId]);
  const isSelected = (group: string, action: string) => selected.group === group && selected.action === action;
  const open = allSections.find((section) => section.group === openGroup);

  // Show the selected action in context, e.g. after a quick-start tile or a deep link.
  useEffect(() => {
    const section = allSections.find((candidate) => candidate.group === selected.group);
    setOpenGroup(section && section.actions.length > 1 ? section.group : undefined);
  }, [selected.group, allSections]);

  const renderList = () => {
    if (query.trim()) {
      return sections.map((section) => (
        <li key={section.group}>
          <List dense disablePadding>
            <ListSubheader disableSticky sx={{ lineHeight: "32px", bgcolor: "transparent" }}>
              {section.group}
            </ListSubheader>
            <ActionRows section={section} isSelected={isSelected} onSelect={onSelect} />
          </List>
        </li>
      ));
    }
    if (open) {
      return (
        <>
          <ListItemButton onClick={() => setOpenGroup(undefined)} aria-label="Back to all templates">
            <ArrowBackIcon fontSize="small" sx={{ mr: 1 }} />
            <ListItemText primary={open.group} slotProps={{ primary: { sx: { fontWeight: 600 } } }} />
          </ListItemButton>
          <ActionRows section={open} isSelected={isSelected} onSelect={onSelect} />
        </>
      );
    }
    return (
      <GroupRows sections={allSections} selectedGroup={selected.group} onOpen={setOpenGroup} onSelect={onSelect} />
    );
  };

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
          {renderList()}
        </List>
        {query.trim() && sections.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1.5 }} id="empty-state-message">
            Nothing matches “{query.trim()}”.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default TransactionTypePanel;
