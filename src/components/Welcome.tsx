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
            padding: { xs: 4, md: 8 },
            marginBottom: 8,
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "6px",
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              boxShadow: "0 0 20px rgba(95, 221, 255, 0.5)",
            },
            "&::after": {
              content: '""',
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "200%",
              height: "200%",
              background: "radial-gradient(circle, rgba(95, 221, 255, 0.03) 0%, transparent 70%)",
              pointerEvents: "none",
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
              marginBottom: 3,
              fontSize: "3rem",
              lineHeight: 0.9,
              letterSpacing: "-0.02em",
              textShadow: "0 0 40px rgba(95, 221, 255, 0.3)",
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "blur(20px)",
                opacity: 0.6,
                zIndex: -1,
              },
            }}
          >
            &lt;ALT&gt; Safe
          </Typography>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              maxWidth: "900px",
              margin: "0 auto",
              marginBottom: 5,
              fontSize: "1.5rem",
              fontWeight: 300,
              lineHeight: 1.3,
              letterSpacing: "0.01em",
              color: theme.palette.text.primary,
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
              background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, rgba(255, 255, 255, 0.8) 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Interact with Safe Smart Account contracts with ease.
          </Typography>
          <Button
            onClick={() => navigate("/home")}
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{
              padding: "16px 40px",
              fontSize: "1.2rem",
              fontWeight: 600,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              color: "#000000",
              textTransform: "none",
              boxShadow: "0 8px 25px rgba(95, 221, 255, 0.4)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 12px 35px rgba(95, 221, 255, 0.6)",
                background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`,
              },
            }}
          >
            Get Started
          </Button>
        </Paper>

        {/* Features Section */}
        <Typography
          variant="h3"
          sx={{
            marginBottom: 5,
            marginTop: 4,
            fontSize: { xs: "2rem", md: "2.5rem" },
            fontWeight: 400,
            color: theme.palette.text.secondary,
            opacity: 0.9,
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: -15,
              left: "50%",
              transform: "translateX(-50%)",
              width: "80px",
              height: "3px",
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
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
              description="No trackers or data collection"
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
            href="https://github.com/akshay-ap/alt-safe"
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
