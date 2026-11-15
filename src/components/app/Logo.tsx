import { Box, Typography } from "@mui/material";
import { color } from "../../theme/tokens";

const Mark: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <rect width="32" height="32" rx="7" fill={color.raised} />
    <circle cx="16" cy="16" r="9" fill="none" stroke={color.brass} strokeWidth="2.5" />
    <circle cx="16" cy="16" r="2.5" fill={color.brass} />
    <path d="M16 7v4M25 16h-4M16 25v-4M7 16h4" stroke={color.brass} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const Logo: React.FC = () => (
  <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
    <Mark />
    <Typography component="span" sx={{ fontWeight: 600, fontSize: "1rem", letterSpacing: "-0.01em" }}>
      ALT Safe
    </Typography>
  </Box>
);

export default Logo;
