import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import type { ReactNode } from "react";

const gradientTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#5FDDFF", // Start of gradient
      light: "#7FE5FF",
      dark: "#3FC7E8",
      contrastText: "#000000", // Dark text for better contrast on bright colors
    },
    secondary: {
      main: "#12FF80", // End of gradient
      light: "#42FF9A",
      dark: "#0EE070",
      contrastText: "#000000",
    },
    background: {
      default: "#0A0A0F", // Very dark background for contrast
      paper: "#151520", // Slightly lighter dark background
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#B8B8C8",
    },
    error: {
      main: "#FF4757",
      light: "#FF6B7A",
      dark: "#E8313F",
    },
    warning: {
      main: "#FFA726",
      light: "#FFB84D",
      dark: "#F57C00",
    },
    info: {
      main: "#5FDDFF",
      light: "#7FE5FF",
      dark: "#3FC7E8",
    },
    success: {
      main: "#12FF80",
      light: "#42FF9A",
      dark: "#0EE070",
    },
    divider: "rgba(255, 255, 255, 0.1)",
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
          background: "linear-gradient(135deg, #5FDDFF 0%, #12FF80 100%)",
          color: "#000000",
          fontWeight: 600,
          "&:hover": {
            background: "linear-gradient(135deg, #7FE5FF 0%, #42FF9A 100%)",
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(95, 221, 255, 0.3)",
          },
        },
        containedSecondary: {
          background: "linear-gradient(135deg, #12FF80 0%, #5FDDFF 100%)",
          color: "#000000",
          "&:hover": {
            background: "linear-gradient(135deg, #42FF9A 0%, #7FE5FF 100%)",
          },
        },
        outlined: {
          borderColor: "rgba(95, 221, 255, 0.5)",
          color: "#5FDDFF",
          "&:hover": {
            backgroundColor: "rgba(95, 221, 255, 0.1)",
            borderColor: "#5FDDFF",
          },
        },
        text: {
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: "rgba(95, 221, 255, 0.1)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          background: "linear-gradient(145deg, #1A1A25 0%, #151520 100%)",
          border: "1px solid rgba(95, 221, 255, 0.1)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 8px 30px rgba(95, 221, 255, 0.2)",
            border: "1px solid rgba(95, 221, 255, 0.2)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            backgroundColor: "rgba(21, 21, 32, 0.8)",
            "& fieldset": {
              borderColor: "rgba(95, 221, 255, 0.3)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(95, 221, 255, 0.5)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#5FDDFF",
              borderWidth: "2px",
              boxShadow: "0 0 10px rgba(95, 221, 255, 0.3)",
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "#151520",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          border: "1px solid rgba(95, 221, 255, 0.1)",
        },
        outlined: {
          border: "1px solid rgba(95, 221, 255, 0.2)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "linear-gradient(135deg, rgba(21, 21, 32, 0.95) 0%, rgba(10, 10, 15, 0.95) 100%)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
          borderBottom: "1px solid rgba(95, 221, 255, 0.1)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          backgroundColor: "rgba(95, 221, 255, 0.1)",
          border: "1px solid rgba(95, 221, 255, 0.3)",
          color: "#5FDDFF",
        },
        outlined: {
          border: "1px solid rgba(95, 221, 255, 0.4)",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(95, 221, 255, 0.2)",
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
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: "rgba(95, 221, 255, 0.1)",
            transform: "scale(1.05)",
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
            backgroundColor: "rgba(95, 221, 255, 0.08)",
          },
        },
      },
    },
  },
});

const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider theme={gradientTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default AppThemeProvider;
