/**
 * Design tokens. Components read these through the MUI theme; import them directly
 * only where the theme has no slot (e.g. global CSS).
 */
export const color = {
  ink: "#10141A",
  surface: "#171C24",
  raised: "#1E2430",
  hairline: "#2A3240",
  hairlineStrong: "#3A4456",
  text: "#E6E9EE",
  textMuted: "#8B95A5",
  textFaint: "#5F6878",
  // Jade green taken from the lifebuoy mark; the mark's ring is one step darker (accentDeep).
  accent: "#2FB386",
  accentHover: "#45C497",
  accentDeep: "#24A57A",
  accentMuted: "rgba(47, 179, 134, 0.14)",
  // White bands of the lifebuoy mark.
  band: "#F2F5F3",
  // Lime, so success never reads as the green accent.
  success: "#A3D977",
  warning: "#F0A04B",
  error: "#F06A6A",
  info: "#7FA7E8",
} as const;

export const font = {
  sans: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  mono: "ui-monospace, 'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', monospace",
} as const;

export const radius = {
  control: 6,
  surface: 8,
} as const;
