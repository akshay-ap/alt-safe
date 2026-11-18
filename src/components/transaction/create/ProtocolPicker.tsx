import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CodeIcon from "@mui/icons-material/Code";
import DataObjectIcon from "@mui/icons-material/DataObject";
import SearchIcon from "@mui/icons-material/Search";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { Box, Button, Card, CardActionArea, Chip, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import type React from "react";
import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { useSafeWalletContext } from "../../../context/WalletContext";
import { type ActionSection, buildActionCatalog, groupProtocols, protocolLabel } from "../../../utils/actionCatalog";

type Select = (group: string, action: string) => void;

const FALLBACK_ICONS: Record<string, React.ReactNode> = {
  Native: <SendOutlinedIcon fontSize="small" />,
  Settings: <SettingsOutlinedIcon fontSize="small" />,
  "Contract call": <CodeIcon fontSize="small" />,
  "Custom call": <DataObjectIcon fontSize="small" />,
};

export const useActionCatalog = (query = "") => {
  const { chainId } = useAccount();
  const { txBuilderSpec } = useSafeWalletContext();
  return useMemo(() => buildActionCatalog(txBuilderSpec, chainId, query), [txBuilderSpec, chainId, query]);
};

const ProtocolMark: React.FC<{ section: ActionSection }> = ({ section }) => (
  <Box
    aria-hidden
    sx={{
      width: 36,
      height: 36,
      borderRadius: 1.5,
      display: "grid",
      placeItems: "center",
      bgcolor: "action.selected",
      color: "primary.main",
      fontWeight: 600,
    }}
  >
    {section.logo ?? FALLBACK_ICONS[section.group] ?? section.group[0]}
  </Box>
);

const ProtocolCard: React.FC<{ section: ActionSection; onSelect: Select }> = ({ section, onSelect }) => (
  <Card>
    <CardActionArea onClick={() => onSelect(section.group, section.actions[0])} sx={{ p: 2, height: "100%" }}>
      <ProtocolMark section={section} />
      <Typography variant="subtitle2" sx={{ mt: 1.5 }}>
        {protocolLabel(section.group)}
      </Typography>
      <Typography variant="caption">
        {section.actions.length} action{section.actions.length === 1 ? "" : "s"}
      </Typography>
    </CardActionArea>
  </Card>
);

const SearchResults: React.FC<{ sections: ActionSection[]; query: string; onSelect: Select }> = ({
  sections,
  query,
  onSelect,
}) => {
  if (sections.length === 0) {
    return <Typography color="text.secondary">Nothing matches “{query.trim()}”.</Typography>;
  }
  return (
    <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
      {sections.flatMap((section) =>
        section.actions.map((action) => (
          <Chip
            key={`${section.group}-${action}`}
            label={`${action} · ${protocolLabel(section.group)}`}
            onClick={() => onSelect(section.group, action)}
          />
        )),
      )}
    </Stack>
  );
};

/** Start screen: every protocol as a card, grouped by its template tag, with search across all actions. */
export const ProtocolGrid: React.FC<{ onSelect: Select }> = ({ onSelect }) => {
  const [query, setQuery] = useState("");
  const matches = useActionCatalog(query);
  const groups = groupProtocols(useActionCatalog());

  return (
    <Stack spacing={2.5}>
      <TextField
        size="small"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search protocols and actions"
        aria-label="Search protocols and actions"
        sx={{ maxWidth: 420 }}
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
      {query.trim() ? (
        <SearchResults sections={matches} query={query} onSelect={onSelect} />
      ) : (
        groups.map((group) => (
          <Box key={group.heading} component="section" aria-label={group.heading}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              {group.heading}
            </Typography>
            <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
              {group.sections.map((section) => (
                <ProtocolCard key={section.group} section={section} onSelect={onSelect} />
              ))}
            </Box>
          </Box>
        ))
      )}
    </Stack>
  );
};

/** Above an action's form: the way back to all protocols, and the protocol's other actions one click away. */
export const ProtocolHeader: React.FC<{ group: string; action: string; onSelect: Select; onBack: () => void }> = ({
  group,
  action,
  onSelect,
  onBack,
}) => {
  const section = useActionCatalog().find((candidate) => candidate.group === group);

  return (
    <Stack spacing={1.5} sx={{ mb: 2 }}>
      <Stack direction="row" sx={{ alignItems: "center" }} component="nav" aria-label="Breadcrumb">
        <Button size="small" onClick={onBack} sx={{ ml: -1 }}>
          All protocols
        </Button>
        <ChevronRightIcon fontSize="small" sx={{ color: "text.secondary" }} />
        <Typography variant="subtitle2" sx={{ ml: 0.5 }} aria-current="page">
          {protocolLabel(group)}
        </Typography>
      </Stack>
      {section && section.actions.length > 1 && (
        <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }} role="tablist" aria-label={`${group} actions`}>
          {section.actions.map((name) => (
            <Chip
              key={name}
              role="tab"
              aria-selected={name === action}
              label={name}
              color={name === action ? "primary" : "default"}
              variant={name === action ? "filled" : "outlined"}
              onClick={() => onSelect(group, name)}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
};
