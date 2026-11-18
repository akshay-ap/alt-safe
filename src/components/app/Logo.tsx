import { Box, Typography } from "@mui/material";
import { color } from "../../theme/tokens";

const Mark: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <rect width="32" height="32" rx="7" fill={color.raised} />
    <circle cx="16" cy="16" r="9" fill="none" stroke={color.accentDeep} strokeWidth="2.5" />
    {/* Four light bands centred on the spokes, like a ring buoy (circumference / 8 each). */}
    <circle
      cx="16"
      cy="16"
      r="9"
      fill="none"
      stroke={color.band}
      strokeWidth="2.5"
      strokeDasharray="7.069 21.206"
      strokeDashoffset="3.534"
    />
    <circle cx="16" cy="16" r="2.5" fill={color.accentDeep} />
    <path d="M16 7v4M25 16h-4M16 25v-4M7 16h4" stroke={color.band} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const Logo: React.FC = () => (
  <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
    <Mark />
    <Typography
      component="span"
      sx={{ fontWeight: 600, fontSize: "1rem", letterSpacing: "-0.01em", display: { xs: "none", sm: "inline" } }}
    >
      ALT Safe
    </Typography>
  </Box>
);

export default Logo;
