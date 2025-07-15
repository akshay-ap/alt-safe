import { Box, Button, Chip, Container, Divider, Link, Paper, Typography, useTheme } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useNavigate } from "react-router-dom";
import FeatureBox from "./common/Features";
import "../index.css";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import FeaturedPlayListIcon from "@mui/icons-material/FeaturedPlayList";
import IntegrationInstructionsIcon from "@mui/icons-material/IntegrationInstructions";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import ShieldIcon from "@mui/icons-material/Shield";
import { supportedChains } from "../wagmi";

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
          padding: { xs: 2, md: 4 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            padding: { xs: 3, md: 6 },
            marginBottom: 6,
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "5px",
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            },
          }}
        >
          <Typography
            variant="h1"
            fontWeight="bold"
            color="primary"
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: 2,
            }}
          >
            &lt;ALT&gt; Safe
          </Typography>
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              maxWidth: "800px",
              margin: "0 auto",
              marginBottom: 4,
              color: theme.palette.text.secondary,
            }}
          >
            A modern, user-friendly interface to interact with Safe Smart Account contracts
          </Typography>
          <Button
            onClick={() => navigate("/home")}
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{
              padding: "12px 30px",
              fontSize: "1.1rem",
            }}
          >
            Get Started
          </Button>
        </Paper>

        {/* Features Section */}
        <Typography
          variant="h3"
          sx={{
            marginBottom: 4,
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: -10,
              left: "50%",
              transform: "translateX(-50%)",
              width: "60px",
              height: "3px",
              background: theme.palette.primary.main,
              borderRadius: "2px",
            },
          }}
        >
          Key Features
        </Typography>

        <Grid container spacing={4} sx={{ marginBottom: 6 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FeatureBox
              icon={<IntegrationInstructionsIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />}
              title="Templates"
              description="Easily extend functionality using JSON templates for common operations"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FeatureBox
              icon={<ShieldIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />}
              title="Privacy"
              description="Enhanced security with no trackers or data collection"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FeatureBox
              icon={<FeaturedPlayListIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />}
              title="All-inclusive"
              description="Execute multi-signature and batched transactions seamlessly"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FeatureBox
              icon={<RemoveCircleIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />}
              title="No Backend"
              description="Lightweight and easy to deploy with no backend requirements"
            />
          </Grid>
        </Grid>

        {/* Supported Chains Section */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            padding: 4,
            marginBottom: 4,
            background: "linear-gradient(135deg, rgba(38, 38, 64, 0.7) 0%, rgba(26, 26, 46, 0.7) 100%)",
            backdropFilter: "blur(10px)",
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="h4" sx={{ marginBottom: 3 }}>
            Supported Chains
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 1 }}>
            {supportedChains.map((chain) => (
              <Chip
                key={chain.id}
                label={chain.name}
                sx={{
                  margin: 0.5,
                  background: `linear-gradient(45deg, ${theme.palette.background.paper} 30%, ${theme.palette.background.default} 90%)`,
                  border: `1px solid ${theme.palette.divider}`,
                  fontWeight: 500,
                }}
              />
            ))}
          </Box>
        </Paper>

        {/* Footer */}
        <Divider sx={{ width: "100%", marginY: 4 }} />
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            component={Link}
            href="https://github.com/akshay-ap/alt-wallet"
            target="_blank"
            sx={{ borderRadius: 4 }}
          >
            View Source Code
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Welcome;
