import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import PauseRounded from "@mui/icons-material/PauseRounded";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import PlayArrowRounded from "@mui/icons-material/PlayArrowRounded";
import { Box, IconButton, Typography } from "@mui/material";
import { keyframes } from "@mui/material/styles";
import { useState } from "react";
import { color, font } from "../../theme/tokens";

/**
 * Plain CSS keyframes on one shared 12s timeline: no animation library and crisp at any
 * size. With reduced motion every element is pinned to its final state, which reads as a
 * summary of the whole flow.
 */
const DURATION = "12s";

// Visible only between `from` and `to` percent of the loop; visible at 100% only when `to` is 100.
const windowed = (from: number, to: number) => keyframes`
  0%, ${Math.max(from - 0.1, 0)}% { opacity: ${from === 0 ? 1 : 0}; }
  ${from}%, ${Math.min(to, 99.9)}% { opacity: 1; }
  ${to === 100 ? "100% { opacity: 1; }" : `${Math.min(to + 0.1, 100)}%, 100% { opacity: 0; }`}
`;

// A message travelling between the nodes at 8% (owner A), 50% (channel) and 92% (owner B).
const txPacket = keyframes`
  0%, 18% { left: 8%; opacity: 0; }
  20% { left: 8%; opacity: 1; }
  30%, 36% { left: 50%; opacity: 1; }
  45% { left: 92%; opacity: 1; }
  47%, 100% { left: 92%; opacity: 0; }
`;
const sigPacket = keyframes`
  0%, 53% { left: 92%; opacity: 0; }
  55% { left: 92%; opacity: 1; }
  63%, 67% { left: 50%; opacity: 1; }
  75% { left: 8%; opacity: 1; }
  77%, 100% { left: 8%; opacity: 0; }
`;

const STEPS = [
  { from: 0, to: 20, text: "Owner A builds the transaction, signs it and copies it." },
  { from: 20, to: 47, text: "It travels over a channel the owners already use. ALT Safe never sees it." },
  { from: 47, to: 77, text: "Owner B pastes it, signs, and sends the signature back the same way." },
  { from: 77, to: 100, text: "Owner A adds the signature: 2 of 2, and executes on chain." },
];

const A_STATUS = [
  { from: 0, to: 10, text: "Draft" },
  { from: 10, to: 78, text: "1 of 2 signed" },
  { from: 78, to: 100, text: "2 of 2 · executed" },
];
const B_STATUS = [
  { from: 0, to: 50, text: "Waiting" },
  { from: 50, to: 100, text: "Signed" },
];

const REDUCED_MOTION = "@media (prefers-reduced-motion: reduce)";

// With reduced motion there is no timeline at all; `finalOpacity` is what stays on screen.
const animated = (name: ReturnType<typeof keyframes>, finalOpacity: number) => ({
  animation: `${name} ${DURATION} linear infinite`,
  [REDUCED_MOTION]: { animation: "none", opacity: finalOpacity },
});

const Stacked: React.FC<{ items: { from: number; to: number; text: string }[]; sx?: object }> = ({ items, sx }) => (
  <Box sx={{ display: "grid", ...sx }}>
    {items.map((item) => (
      <Box
        key={item.text}
        component="span"
        sx={{ gridArea: "1 / 1", ...animated(windowed(item.from, item.to), item.to === 100 ? 1 : 0) }}
      >
        {item.text}
      </Box>
    ))}
  </Box>
);

const Node: React.FC<{ icon: React.ReactNode; title: string; status: React.ReactNode }> = ({ icon, title, status }) => (
  <Box sx={{ textAlign: "center", width: 136, zIndex: 1 }}>
    <Box
      sx={{
        mx: "auto",
        mb: 1,
        width: 48,
        height: 48,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        bgcolor: color.raised,
        border: `1px solid ${color.hairlineStrong}`,
      }}
    >
      {icon}
    </Box>
    <Typography variant="subtitle2">{title}</Typography>
    <Typography variant="caption" component="div">
      {status}
    </Typography>
  </Box>
);

const Packet: React.FC<{ frames: ReturnType<typeof keyframes>; tint: string; label: string }> = ({
  frames,
  tint,
  label,
}) => (
  <Box
    aria-hidden
    sx={{
      position: "absolute",
      top: 0,
      zIndex: 2,
      transform: "translateX(-50%)",
      px: 0.75,
      py: 0.25,
      borderRadius: 1,
      bgcolor: tint,
      color: color.ink,
      fontFamily: font.mono,
      fontSize: "0.6875rem",
      ...animated(frames, 0),
    }}
  >
    {label}
  </Box>
);

const SignatureFlow: React.FC = () => {
  const [paused, setPaused] = useState(false);

  return (
    <Box
      role="img"
      aria-label="Owner A signs and shares a transaction over their own channel; owner B signs and sends the signature back; owner A executes with 2 of 2 signatures."
      sx={{
        position: "relative",
        border: `1px solid ${color.hairline}`,
        borderRadius: 2,
        bgcolor: color.surface,
        p: { xs: 2.5, md: 3 },
        "& *": { animationPlayState: paused ? "paused" : "running" },
      }}
    >
      <Typography variant="caption" component="p" sx={{ mb: 1 }}>
        Collecting signatures, without a server in between
      </Typography>
      <Box sx={{ position: "relative", display: "flex", justifyContent: "space-between", pt: 4 }}>
        <Box
          aria-hidden
          sx={{ position: "absolute", top: 56, left: 68, right: 68, borderTop: `1px dashed ${color.hairlineStrong}` }}
        />
        <Node icon={<PersonOutlinedIcon fontSize="small" />} title="Owner A" status={<Stacked items={A_STATUS} />} />
        <Node icon={<ForumOutlinedIcon fontSize="small" />} title="Your channel" status="Chat, email, anything" />
        <Node icon={<PersonOutlinedIcon fontSize="small" />} title="Owner B" status={<Stacked items={B_STATUS} />} />
        <Packet frames={txPacket} tint={color.accent} label="0x7b22…" />
        <Packet frames={sigPacket} tint={color.success} label="sig" />
      </Box>
      <Stacked items={STEPS} sx={{ mt: 3, minHeight: 44, color: color.text, fontSize: "0.9375rem" }} />
      <IconButton
        size="small"
        onClick={() => setPaused((value) => !value)}
        aria-label={paused ? "Play animation" : "Pause animation"}
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          "@media (prefers-reduced-motion: reduce)": { display: "none" },
        }}
      >
        {paused ? <PlayArrowRounded fontSize="small" /> : <PauseRounded fontSize="small" />}
      </IconButton>
    </Box>
  );
};

export default SignatureFlow;
