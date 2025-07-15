import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CodeIcon from "@mui/icons-material/Code";
import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";
import {
  Card,
  CardActionArea,
  CardContent,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2"; // Import Grid2
import InputAdornment from "@mui/material/InputAdornment";
import type React from "react";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useSafeWalletContext } from "../../../context/WalletContext";
import { LogoType } from "../../../context/types";
import { GroupTagType } from "../../../context/types";

// Define GroupTagType as a value (array of strings) and add "All" as an option
const groupTagValues: string[] = ["All", ...Object.values(GroupTagType)];

interface TransactionTypePanelProps {
  onSelect: (group: string, type: string) => void;
}

const TransactionTypePanel: React.FC<TransactionTypePanelProps> = ({ onSelect }) => {
  const { chainId } = useAccount();
  const { txBuilderSpec } = useSafeWalletContext();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTag, setSelectedTag] = useState<string>("All"); // Default to "All"

  // Import transaction types from spec
  let combinedTransactionTypes = txBuilderSpec.reduce<
    Record<string, { icon: JSX.Element; types: string[]; disabled: boolean; tags: string[] }>
  >((acc, group) => {
    acc[group.groupName] = {
      icon:
        group.logo?.type === LogoType.URL ? (
          <img
            src={group.logo.value}
            alt={group.groupName}
            style={{ width: "25px", height: "25px", objectFit: "contain" }}
          />
        ) : (
          <Typography fontWeight={800}>
            {group.logo?.type === LogoType.CHARACTER ? group.logo.value[0] : <CodeIcon />}
          </Typography>
        ),
      types: group.actions.map((action) => action.name),
      disabled: !(group.chainIds.includes(0) || group.chainIds.includes(chainId || 0)), // Enable if chainIds includes 0 or the current chainId
      tags: group.tags || ["Other"], // Add dummy tags if not provided
    };
    return acc;
  }, {});

  combinedTransactionTypes = {
    ...combinedTransactionTypes,
    // Add additional transaction types
    Import: {
      icon: <DownloadIcon />,
      types: ["Import"],
      disabled: false,
      tags: ["Other"],
    },
    EncodeFunctionCall: {
      icon: <CodeIcon />,
      types: ["encodeFunctionCall"],
      disabled: false,
      tags: ["Other"],
    },
  };

  const handleGroupClick = (group: string) => {
    setSelectedGroup(group);
  };

  const handleActionClick = (group: string, action: string) => {
    onSelect(group, action);
  };

  const handleBackClick = () => {
    setSelectedGroup(null);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleTagSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTag(event.target.value);
    setAnchorEl(null);
  };

  const filteredGroups = Object.entries({ ...combinedTransactionTypes }).filter(
    ([group, { tags }]) =>
      (!searchQuery || group.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedTag === "All" || tags.includes(selectedTag)),
  );

  return (
    <Grid justifyContent={"flex-start"} alignItems={"flex-start"} container size={12}>
      <Grid>
        <Typography variant="subtitle2" color="text.secondary">
          Select a transaction type and fill in the required information.
        </Typography>
      </Grid>
      {/* Back button for navigating back to groups */}
      {selectedGroup && (
        <Grid size={12}>
          <IconButton onClick={handleBackClick}>
            <ArrowBackIcon />
          </IconButton>
        </Grid>
      )}

      {/* Search bar and sort button */}
      {!selectedGroup && (
        <Grid justifyContent={"flex-start"} alignItems={"flex-start"} size={12} container spacing={2}>
          <Grid justifyContent={"flex-start"} alignItems={"flex-start"} size={12}>
            <TextField
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search..."
              variant="outlined"
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
          </Grid>
          <Grid size={2}>
            <IconButton onClick={handleSortClick}>
              <SortIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <RadioGroup value={selectedTag} onChange={handleTagSelect}>
                {groupTagValues.map((tag) => (
                  <MenuItem key={tag}>
                    <FormControlLabel value={tag} control={<Radio />} label={tag} sx={{ width: "100%" }} />
                  </MenuItem>
                ))}
              </RadioGroup>
            </Menu>
          </Grid>
        </Grid>
      )}

      {/* Show group cards */}
      {!selectedGroup &&
        filteredGroups.map(([group, { icon, disabled }]) => (
          <Grid size={{ xs: 12, sm: 6, md: 6 }} p={0} m={0} key={group}>
            <Card
              sx={{
                pointerEvents: disabled ? "none" : "auto",
                margin: 1,
                padding: 0,
                border: "1px solid",
              }}
            >
              <CardActionArea onClick={() => !disabled && handleGroupClick(group)}>
                <CardContent sx={{ textAlign: "center" }}>
                  {icon}
                  <Typography variant="h6" sx={{ marginTop: 1 }}>
                    {group}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}

      {/* Show action cards for the selected group */}
      {selectedGroup &&
        combinedTransactionTypes[selectedGroup]?.types.map((action) => (
          <Grid justifyContent={"flex-start"} alignItems={"flex-start"} size={{ xs: 12, sm: 6, md: 6 }} key={action}>
            <Card sx={{ margin: 1, border: "1px solid" }}>
              <CardActionArea onClick={() => handleActionClick(selectedGroup, action)}>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography>{action}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
    </Grid>
  );
};

export default TransactionTypePanel;
