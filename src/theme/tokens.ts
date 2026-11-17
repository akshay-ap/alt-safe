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
  brass: "#D6B370",
  brassHover: "#E2C48A",
  brassMuted: "rgba(214, 179, 112, 0.14)",
  success: "#5CC8A1",
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
