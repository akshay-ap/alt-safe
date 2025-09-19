import { Box, Button, Card, CardActionArea, CardContent, Chip, Paper, Typography, useTheme } from "@mui/material";
import Grid from "@mui/material/Grid2";
import type React from "react";
import { useNavigate } from "react-router-dom";
import { formatEther } from "viem";
import { useBalance } from "wagmi";
import { useSafeWalletContext } from "../../context/WalletContext";
import AccountAddress from "../common/AccountAddress";

// Import icons
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AddIcon from "@mui/icons-material/Add";
import DrawIcon from "@mui/icons-material/Draw";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import HistoryIcon from "@mui/icons-material/History";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import SettingsIcon from "@mui/icons-material/Settings";

const SafeInfo: React.FC = () => {
  const { safeAccount, safeStorage } = useSafeWalletContext();
  const { data: balance } = useBalance({ address: safeAccount });
  const navigate = useNavigate();
  const theme = useTheme();

  const actions = [
    {
      title: "New Transaction",
      description: "Build and propose a new transaction",
      icon: <AddIcon />,
      path: "/create-transaction",
      primary: true,
      color: "primary",
    },
    {
      title: "Execute Transaction",
      description: "Aggregate signatures and execute transaction",
      icon: <GroupAddIcon />,
      path: "/aggregate-signatures",
      color: "info",
    },
    {
      title: "Transaction History",
      description: "View past transactions and their status",
      icon: <HistoryIcon />,
      path: "/history",
      color: "secondary",
    },
    {
      title: "Approve Transaction Hash",
      description: "Approve a transaction by its hash",
      icon: <HowToRegIcon />,
      path: "/approve-transaction-hash",
      color: "warning",
    },
    {
      title: "Approve Transaction",
      description: "Review and approve a pending transaction",
      icon: <HowToRegIcon />,
      path: "/approve-transaction",
      color: "success",
    },
    {
      title: "Sign message",
      description: "Sign Safe message",
      icon: <DrawIcon />,
      path: "/sign-message",
      color: "default",
    },
    {
      title: "Settings",
      description: "Manage Safe settings and owners",
      icon: <SettingsIcon />,
      path: "/settings",
      color: "default",
    },
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      {/* Overview Section */}
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          p: 3,
          mb: 4,
          background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h4" gutterBottom fontWeight={500}>
                Safe Account Overview
              </Typography>
              <AccountAddress address={safeAccount} showCopy={true} showExplorer={true} />
            </Box>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
              <Chip
                icon={<AccountBalanceWalletIcon />}
                label={`${balance ? formatEther(balance.value).substring(0, 8) : "0"} ${balance?.symbol || "ETH"}`}
                color="primary"
                variant="outlined"
              />
              <Chip
                label={`${safeStorage?.threshold || 0} out of ${safeStorage?.owners?.length || 0} owners`}
                color="secondary"
                variant="outlined"
              />
              <Chip label={`Nonce: ${safeStorage?.nonce || 0}`} variant="outlined" />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: "100%", bgcolor: theme.palette.background.default }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Quick Actions
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={() => navigate("/create-transaction")}
                  sx={{ mb: 1 }}
                >
                  New Transaction
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Actions Grid */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Available Actions
      </Typography>

      <Grid container spacing={3}>
        {actions.map((action) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={action.path}>
            <Card
              elevation={0}
              variant="outlined"
              sx={{
                height: "100%",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              <CardActionArea onClick={() => navigate(action.path)} sx={{ height: "100%", p: 1 }}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    {action.icon}
                    <Typography variant="h6" component="div" sx={{ ml: 1 }}>
                      {action.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SafeInfo;
