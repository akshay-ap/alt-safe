import { Box, Divider, Paper, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import type React from "react";
import type { SafeStorage as SafeStorageType } from "../../utils/storageReader";
import AccountAddress from "./AccountAddress";

interface StorageFieldProps {
  label: string;
  value: React.ReactNode;
  isLast?: boolean;
}

const StorageField: React.FC<StorageFieldProps> = ({ label, value, isLast = false }) => {
  return (
    <Box sx={{ mb: isLast ? 0 : 2 }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      <Box sx={{ pl: 0.5 }}>{value}</Box>
    </Box>
  );
};

interface ItemListProps {
  title: string;
  items: `0x${string}`[];
  emptyMessage?: string;
  renderItem?: (item: `0x${string}`, index: number) => React.ReactNode;
}

const ItemList: React.FC<ItemListProps> = ({ title, items = [], emptyMessage = "No items found", renderItem }) => {
  const defaultRenderItem = (item: `0x${string}`, index: number) => (
    <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
        #{index + 1}
      </Typography>
      <AccountAddress address={item} />
    </Box>
  );

  const renderer = renderItem || defaultRenderItem;

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 1,
        height: "100%",
      }}
    >
      <Typography variant="subtitle1" fontWeight={500} gutterBottom>
        {title} {items.length > 0 && `(${items.length})`}
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {items.length > 0 ? (
        <Box>
          {items.map((item, index) => (
            <Box key={item} sx={{ mb: index < items.length - 1 ? 2 : 0 }}>
              {renderer(item, index)}
              {index < items.length - 1 && <Divider sx={{ mt: 1.5, mb: 1.5 }} />}
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
      )}
    </Paper>
  );
};

// Fixed nullable types and optional chaining
const ViewSafeStorage: React.FC<{
  safeStorage: SafeStorageType | undefined;
}> = ({ safeStorage }) => {
  if (!safeStorage) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="text.secondary">No Safe storage data available</Typography>
      </Box>
    );
  }

  // Make sure modules is an array, even if undefined
  const modules = safeStorage.modules || [];
  const owners = safeStorage.owners || [];

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Basic Info Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 1,
              height: "100%",
            }}
          >
            <StorageField label="Safe Singleton" value={<AccountAddress address={safeStorage.singleton} />} />

            <StorageField label="Fallbackhandler" value={<AccountAddress address={safeStorage.fallbackHandler} />} />

            <StorageField
              label="Threshold"
              value={
                <Typography sx={{ fontFamily: "monospace" }}>{safeStorage.threshold?.toString() || "0"}</Typography>
              }
            />

            <StorageField
              label="Safe Nonce"
              value={<Typography sx={{ fontFamily: "monospace" }}>{safeStorage.nonce?.toString() || "0"}</Typography>}
            />

            <StorageField label="Guard" value={<AccountAddress address={safeStorage.guard} />} />

            <StorageField
              label="Owner Count"
              value={
                <Typography sx={{ fontFamily: "monospace" }}>{safeStorage.ownerCount?.toString() || "0"}</Typography>
              }
              isLast
            />
          </Paper>
        </Grid>

        {/* Owners Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ItemList title="Owners" items={owners} emptyMessage="No owners found" />
        </Grid>

        {/* Modules Section */}
        <Grid size={{ xs: 12 }}>
          <ItemList
            title="Modules"
            items={modules}
            emptyMessage="No modules enabled"
            renderItem={(module, index) => (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                  Module #{index + 1}:
                </Typography>
                <AccountAddress address={module} />
              </Box>
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ViewSafeStorage;
