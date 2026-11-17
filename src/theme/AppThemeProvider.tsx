import { alpha, CssBaseline, createTheme, ThemeProvider } from "@mui/material";
import type { ReactNode } from "react";
import { color, font, radius } from "./tokens";

const typography = {
  fontFamily: font.sans,
  fontSize: 14,
  h1: { fontSize: "2rem", fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.01em" },
  h2: { fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.25, letterSpacing: "-0.005em" },
  h3: { fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.3 },
  h4: { fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.35 },
  h5: { fontSize: "1.0625rem", fontWeight: 600, lineHeight: 1.4 },
  h6: { fontSize: "0.9375rem", fontWeight: 600, lineHeight: 1.4 },
  subtitle1: { fontSize: "0.9375rem", fontWeight: 500, lineHeight: 1.5 },
  subtitle2: { fontSize: "0.875rem", fontWeight: 600, lineHeight: 1.45 },
  body1: { fontSize: "0.9375rem", lineHeight: 1.55 },
  body2: { fontSize: "0.875rem", lineHeight: 1.5 },
  caption: { fontSize: "0.75rem", lineHeight: 1.45, color: color.textMuted },
  overline: { fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.02em", textTransform: "none" as const },
  button: { fontSize: "0.875rem", fontWeight: 600, textTransform: "none" as const, letterSpacing: 0 },
};

const focusRing = { outline: `2px solid ${color.accent}`, outlineOffset: 2 };

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: color.accent, light: color.accentHover, dark: color.accentDeep, contrastText: color.ink },
    secondary: { main: color.info, contrastText: color.ink },
    success: { main: color.success, contrastText: color.ink },
    warning: { main: color.warning, contrastText: color.ink },
    error: { main: color.error, contrastText: color.ink },
    info: { main: color.info, contrastText: color.ink },
    background: { default: color.ink, paper: color.surface },
    text: { primary: color.text, secondary: color.textMuted, disabled: color.textFaint },
    divider: color.hairline,
    action: { hover: alpha(color.text, 0.05), selected: color.accentMuted, disabledBackground: color.raised },
  },
  typography,
  shape: { borderRadius: radius.control },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: color.ink, fontFeatureSettings: "'ss02'" },
        "::selection": { backgroundColor: alpha(color.accent, 0.3) },
        "code, kbd, pre, samp": { fontFamily: font.mono },
      },
    },
    MuiButtonBase: { defaultProps: { disableRipple: true } },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: radius.control, paddingInline: 14, "&.Mui-focusVisible": focusRing },
        sizeLarge: { paddingBlock: 10, paddingInline: 20, fontSize: "0.9375rem" },
        outlined: { borderColor: color.hairlineStrong, color: color.text, "&:hover": { borderColor: color.textMuted } },
        // The accent is reserved for the one primary action; plain text buttons stay neutral.
        text: ({ ownerState }) => ({
          ...(ownerState.color === "primary" && { color: color.text }),
          "&:hover": { backgroundColor: alpha(color.text, 0.06) },
        }),
      },
    },
    MuiIconButton: { styleOverrides: { root: { borderRadius: radius.control, "&.Mui-focusVisible": focusRing } } },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: "none" },
        outlined: { borderColor: color.hairline },
        rounded: { borderRadius: radius.surface },
      },
    },
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: { root: { borderRadius: radius.surface, borderColor: color.hairline } },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: "transparent" },
      styleOverrides: { root: { backgroundColor: color.ink, borderBottom: `1px solid ${color.hairline}` } },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { backgroundColor: color.surface, border: `1px solid ${color.hairline}`, borderRadius: radius.surface },
      },
    },
    MuiDialogTitle: { styleOverrides: { root: { fontSize: "1.0625rem", fontWeight: 600, paddingBottom: 8 } } },
    MuiMenu: { styleOverrides: { paper: { backgroundColor: color.raised, border: `1px solid ${color.hairline}` } } },
    MuiPopover: { styleOverrides: { paper: { backgroundColor: color.raised, border: `1px solid ${color.hairline}` } } },
    MuiAutocomplete: {
      styleOverrides: { paper: { backgroundColor: color.raised, border: `1px solid ${color.hairline}` } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: radius.control,
          backgroundColor: color.ink,
          "& .MuiOutlinedInput-notchedOutline": { borderColor: color.hairlineStrong },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: color.textMuted },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: color.accent, borderWidth: 1 },
        },
      },
    },
    MuiInputLabel: { styleOverrides: { root: { "&.Mui-focused": { color: color.accent } } } },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: radius.control, fontWeight: 500 },
        sizeSmall: { height: 22, fontSize: "0.75rem" },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: radius.control, alignItems: "flex-start" },
        message: { paddingBlock: 9 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: color.raised, border: `1px solid ${color.hairline}`, fontSize: "0.75rem" },
      },
    },
    MuiTab: { styleOverrides: { root: { textTransform: "none", fontWeight: 500, minHeight: 44 } } },
    MuiTableCell: { styleOverrides: { root: { borderColor: color.hairline }, head: { color: color.textMuted } } },
    MuiDivider: { styleOverrides: { root: { borderColor: color.hairline } } },
    MuiLink: { defaultProps: { underline: "hover" }, styleOverrides: { root: { color: color.accent } } },
    MuiStepIcon: { styleOverrides: { text: { fill: color.ink, fontWeight: 600 } } },
  },
});

const AppThemeProvider = ({ children }: { children: ReactNode }) => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    {children}
  </ThemeProvider>
);

export default AppThemeProvider;
