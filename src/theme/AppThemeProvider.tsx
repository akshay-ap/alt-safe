import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import type { ReactNode } from "react";

const classicTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#0078d7",
      light: "#3395df",
      dark: "#005a9e",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#107c10",
      light: "#2d9d2d",
      dark: "#0c5c0c",
      contrastText: "#ffffff",
    },
    background: {
      default: "#202020",
      paper: "#2b2b2b",
    },
    text: {
      primary: "#e8e8e8",
      secondary: "#a0a0a0",
    },
    error: {
      main: "#d83b01",
    },
    warning: {
      main: "#f7630c",
    },
    info: {
      main: "#0078d7",
    },
    success: {
      main: "#107c10",
    },
    divider: "rgba(255, 255, 255, 0.08)",
  },
  typography: {
    fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
    h1: {
      fontWeight: 600,
      fontSize: "2.25rem",
      lineHeight: 1.2,
      letterSpacing: "-0.01em",
    },
    h2: {
      fontWeight: 600,
      fontSize: "1.875rem",
      lineHeight: 1.3,
      letterSpacing: "-0.005em",
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.5rem",
      lineHeight: 1.4,
      letterSpacing: "0em",
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.25rem",
      lineHeight: 1.4,
      letterSpacing: "0.005em",
    },
    h5: {
      fontWeight: 500,
      fontSize: "1.1rem",
      lineHeight: 1.5,
      letterSpacing: "0em",
    },
    h6: {
      fontWeight: 500,
      fontSize: "1rem",
      lineHeight: 1.6,
      letterSpacing: "0.0075em",
    },
    body1: {
      fontSize: "0.9375rem",
      lineHeight: 1.5,
      letterSpacing: "0.005em",
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.43,
      letterSpacing: "0.01em",
    },
    button: {
      fontWeight: 500,
      fontSize: "0.875rem",
      lineHeight: 1.5,
      letterSpacing: "0.01em",
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          padding: "6px 16px",
          boxShadow: "none",
          transition: "background-color 0.1s ease-out",
          textTransform: "none",
          "&:hover": {
            boxShadow: "none",
          },
          "&:active": {
            transform: "translateY(1px)",
          },
        },
        contained: {
          background: "#0078d7",
          "&:hover": {
            background: "#0086f0",
          },
        },
        containedSecondary: {
          background: "#107c10",
          "&:hover": {
            background: "#138a13",
          },
        },
        outlined: {
          borderColor: "rgba(255, 255, 255, 0.15)",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.05)",
          },
        },
        text: {
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.05)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)",
          background: "#2b2b2b",
          border: "1px solid rgba(255, 255, 255, 0.03)",
          transition: "none",
          "&:hover": {
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 4,
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            "& fieldset": {
              borderColor: "rgba(255, 255, 255, 0.15)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(255, 255, 255, 0.25)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#0078d7",
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "#2b2b2b",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
        },
        outlined: {
          border: "1px solid rgba(255, 255, 255, 0.08)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "#1f1f1f",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        },
        outlined: {
          border: "1px solid rgba(255, 255, 255, 0.15)",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255, 255, 255, 0.08)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        },
        head: {
          fontWeight: 600,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 400,
          fontSize: "0.875rem",
          "&.Mui-selected": {
            fontWeight: 600,
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          border: "1px solid rgba(255, 255, 255, 0.08)",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: "background-color 0.1s",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.08)",
          },
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: "1.1rem",
          fontWeight: 600,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.04)",
          },
        },
      },
    },
  },
});

const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider theme={classicTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default AppThemeProvider;
