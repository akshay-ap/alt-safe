import { Box, Button, Container, Grid, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import Logo from "./app/Logo";
import SignatureFlow from "./welcome/SignatureFlow";

const SOURCE_URL = "https://github.com/akshay-ap/alt-safe";

const FEATURES = [
  {
    title: "Batch transactions",
    text: "Combine transfers and contract calls into one Safe transaction, from templates or any ABI.",
  },
  {
    title: "Sign over your own channel",
    text: "Share transactions and signatures by chat or email. Each owner signs in their own wallet.",
  },
  {
    title: "Safe v1.3.0 to v1.5.0",
    text: "Create Safes on any of the three versions, or point at your own deployment.",
  },
  { title: "No backend", text: "Reads and writes go straight to the RPC you choose. Nothing is stored on a server." },
  {
    title: "No tracking",
    text: "No analytics and no accounts. Safes, drafts and the address book stay in this browser.",
  },
  { title: "Address book", text: "Name the addresses you use often, and import them from a Safe{Wallet} CSV export." },
];

const Welcome: React.FC = () => (
  <Container
    maxWidth="lg"
    sx={{ py: { xs: 4, md: 5 }, minHeight: "100vh", display: "flex", flexDirection: "column", gap: { xs: 6, md: 7 } }}
  >
    <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
      <Logo />
      <Link href={SOURCE_URL} target="_blank" rel="noopener noreferrer" sx={{ color: "text.secondary" }}>
        Source code
      </Link>
    </Stack>

    <Grid container spacing={{ xs: 5, md: 8 }} sx={{ alignItems: "center" }}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Typography variant="h1" sx={{ fontSize: { xs: "2.25rem", md: "2.75rem" }, lineHeight: 1.12, mb: 2 }}>
          Use Safe wallets without any backend
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.0625rem", mb: 4, maxWidth: 500 }}>
          ALT Safe helps build, sign and execute Safe multisig transactions. Open source, no backend.
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <Button component={RouterLink} to="/home" variant="contained" size="large">
            Open ALT Safe
          </Button>
          <Button href={SOURCE_URL} target="_blank" rel="noopener noreferrer" variant="outlined" size="large">
            View on GitHub
          </Button>
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <SignatureFlow />
      </Grid>
    </Grid>

    <Box component="section" aria-labelledby="features-title">
      <Typography id="features-title" variant="h2" sx={{ mb: 3 }}>
        Features
      </Typography>
      <Grid container columnSpacing={4} rowSpacing={3}>
        {FEATURES.map((feature) => (
          <Grid key={feature.title} size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="h6" component="h3" gutterBottom>
              {feature.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {feature.text}
            </Typography>
          </Grid>
        ))}
      </Grid>
    </Box>
  </Container>
);

export default Welcome;
