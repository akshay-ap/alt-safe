import CodeIcon from "@mui/icons-material/Code";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import UploadIcon from "@mui/icons-material/Upload";
import {
  Box,
  Chip,
  Collapse,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import React from "react";
import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { useSafeWalletContext } from "../../../context/WalletContext";
import { GroupTagType, LogoType } from "../../../context/types";

// Define GroupTagType as a value (array of strings) and add "All" as an option
const groupTagValues: string[] = ["All", ...Object.values(GroupTagType)];

interface TransactionGroup {
  name: string;
  icon: JSX.Element;
  types: string[];
  disabled: boolean;
  tags: string[];
}

interface TransactionTypePanelProps {
  onSelect: (group: string, type: string) => void;
}

const TransactionTypePanel: React.FC<TransactionTypePanelProps> = ({ onSelect }) => {
  const { chainId } = useAccount();
  const { txBuilderSpec } = useSafeWalletContext();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedAction, setSelectedAction] = useState<{ group: string; action: string } | null>(null);
  const theme = useTheme();

  // Memoize the transaction types processing
  const transactionGroups = useMemo(() => {
    let groups = txBuilderSpec.reduce<Record<string, TransactionGroup>>((acc, group) => {
      acc[group.groupName] = {
        name: group.groupName,
        icon:
          group.logo?.type === LogoType.URL ? (
            <img
              src={group.logo.value}
              alt={group.groupName}
              style={{ width: "24px", height: "24px", objectFit: "contain" }}
            />
          ) : (
            <Box sx={{ fontSize: 24, color: "primary.main" }}>
              {group.logo?.type === LogoType.CHARACTER ? group.logo.value[0] : <CodeIcon />}
            </Box>
          ),
        types: group.actions.map((action) => action.name),
        disabled: !(group.chainIds.includes(0) || group.chainIds.includes(chainId || 0)),
        tags: group.tags || ["Other"],
      };
      return acc;
    }, {});

    // Add additional transaction types (excluding Import - it will be a separate button)
    groups = {
      ...groups,
      EncodeFunctionCall: {
        name: "Encode Function Call",
        icon: <CodeIcon sx={{ fontSize: 24, color: "primary.main" }} />,
        types: ["encodeFunctionCall"],
        disabled: false,
        tags: ["Other"],
      },
    };

    return groups;
  }, [txBuilderSpec, chainId]);

  // Filter groups based on search and tag
  const filteredGroups = useMemo(() => {
    return Object.values(transactionGroups).filter((group) => {
      const matchesSearch =
        !searchQuery ||
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.types.some((type) => type.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesTag = selectedTag === "All" || group.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [transactionGroups, searchQuery, selectedTag]);

  const handleGroupToggle = (groupName: string) => {
    if (transactionGroups[groupName]?.disabled) return;

    setExpandedGroups((prev) =>
      prev.includes(groupName) ? prev.filter((name) => name !== groupName) : [...prev, groupName],
    );
  };

  const handleActionSelect = (groupName: string, actionName: string) => {
    setSelectedAction({ group: groupName, action: actionName });
    onSelect(groupName, actionName);
  };

  const handleImportSelect = () => {
    setSelectedAction({ group: "Import", action: "Import" });
    onSelect("Import", "Import");
  };

  const handleFilterMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null);
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag);
    handleFilterMenuClose();
  };

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 800, mx: "auto" }}
      id="transaction-type-panel"
    >
      {/* Header */}
      <Box id="transaction-type-header">
        <Typography variant="h5" gutterBottom id="transaction-type-title">
          Transaction Types
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} id="transaction-type-description">
          Select a transaction category and expand to see available actions
        </Typography>
      </Box>

      {/* Search and Filter */}
      <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }} id="transaction-type-toolbar">
        <TextField
          id="transaction-search-input"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search transaction types..."
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
        <Tooltip title="Import Transaction">
          <IconButton
            id="import-transaction-button"
            onClick={handleImportSelect}
            sx={{
              bgcolor: selectedAction?.group === "Import" ? alpha(theme.palette.success.main, 0.1) : "transparent",
              color: selectedAction?.group === "Import" ? "success.main" : "inherit",
              "&:hover": {
                bgcolor: alpha(theme.palette.success.main, 0.1),
              },
            }}
          >
            <UploadIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Filter by Category">
          <IconButton
            id="filter-menu-button"
            onClick={handleFilterMenuOpen}
            sx={{
              bgcolor: selectedTag !== "All" ? alpha(theme.palette.primary.main, 0.1) : "transparent",
              color: selectedTag !== "All" ? "primary.main" : "inherit",
            }}
          >
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Filter Menu */}
      <Menu
        id="filter-category-menu"
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={handleFilterMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
          },
        }}
      >
        {groupTagValues.map((tag) => (
          <MenuItem
            key={tag}
            id={`filter-option-${tag.toLowerCase().replace(/\s+/g, "-")}`}
            onClick={() => handleTagSelect(tag)}
            selected={selectedTag === tag}
            sx={{
              "&.Mui-selected": {
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                },
              },
            }}
          >
            <Typography variant="body2">{tag}</Typography>
          </MenuItem>
        ))}
      </Menu>

      {/* Filter indicator */}
      {selectedTag !== "All" && (
        <Box sx={{ mb: 2 }} id="active-filter-indicator">
          <Chip
            id="active-filter-chip"
            label={`Filter: ${selectedTag}`}
            onDelete={() => setSelectedTag("All")}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
      )}

      {/* Main Navigation List */}
      <Paper
        id="transaction-types-panel"
        elevation={1}
        sx={{
          borderRadius: 1,
          overflow: "hidden",
          minHeight: 400,
        }}
      >
        <List id="transaction-types-list" sx={{ width: "100%", bgcolor: "background.paper" }} component="nav">
          {filteredGroups.map((group, index) => (
            <React.Fragment key={group.name}>
              {/* Group Header */}
              <ListItemButton
                id={`group-header-${group.name.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => handleGroupToggle(group.name)}
                disabled={group.disabled}
                sx={{
                  py: 1.5,
                  "&:hover": {
                    bgcolor: group.disabled ? "transparent" : alpha(theme.palette.primary.main, 0.08),
                  },
                  "&.Mui-disabled": {
                    opacity: 0.6,
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{group.icon}</ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body1" fontWeight={500}>
                        {group.name}
                      </Typography>
                      {group.disabled && <Chip label="Unavailable" size="small" color="error" variant="outlined" />}
                    </Box>
                  }
                />
                {!group.disabled && (
                  <Box sx={{ ml: 1 }}>{expandedGroups.includes(group.name) ? <ExpandLess /> : <ExpandMore />}</Box>
                )}
              </ListItemButton>

              {/* Nested Actions */}
              <Collapse
                id={`group-content-${group.name.toLowerCase().replace(/\s+/g, "-")}`}
                in={expandedGroups.includes(group.name)}
                timeout="auto"
                unmountOnExit
              >
                <List component="div" disablePadding>
                  {group.types.map((action) => {
                    const isSelected = selectedAction?.group === group.name && selectedAction?.action === action;
                    return (
                      <ListItemButton
                        key={action}
                        id={`action-item-${action.toLowerCase().replace(/\s+/g, "-")}`}
                        sx={{
                          pl: 4,
                          bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.12) : "transparent",
                          "&:hover": {
                            bgcolor: isSelected
                              ? alpha(theme.palette.primary.main, 0.2)
                              : alpha(theme.palette.primary.main, 0.08),
                          },
                          "&.Mui-selected": {
                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                          },
                        }}
                        selected={isSelected}
                        onClick={() => handleActionSelect(group.name, action)}
                      >
                        <ListItemText
                          primary={action}
                          primaryTypographyProps={{
                            variant: "body2",
                            fontWeight: isSelected ? 500 : 400,
                            color: isSelected ? "primary.main" : "inherit",
                          }}
                        />
                      </ListItemButton>
                    );
                  })}
                </List>
              </Collapse>

              {index < filteredGroups.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>

        {/* Empty state */}
        {filteredGroups.length === 0 && (
          <Box id="empty-state-message" sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No transaction types found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search or filter criteria
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default TransactionTypePanel;
