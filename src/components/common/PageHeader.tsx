import { Box, Stack, Typography } from "@mui/material";

interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}

/** The one h1 per page, with an optional description and page-level actions aligned right. */
const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions }) => (
  <Stack
    direction={{ xs: "column", sm: "row" }}
    spacing={2}
    sx={{ mb: 4, alignItems: { sm: "flex-end" }, justifyContent: "space-between" }}
  >
    <Box sx={{ maxWidth: 720 }}>
      <Typography variant="h2" component="h1">
        {title}
      </Typography>
      {description && (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75 }}>
          {description}
        </Typography>
      )}
    </Box>
    {actions && (
      <Stack direction="row" spacing={1} sx={{ flexShrink: 0, flexWrap: "wrap", rowGap: 1 }}>
        {actions}
      </Stack>
    )}
  </Stack>
);

export default PageHeader;
