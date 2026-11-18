import { Box, Button, Container, Divider, Grid, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { color, font } from "../theme/tokens";
import { chunkHex } from "../utils/address";
import { supportedChains } from "../wagmi";
import Logo from "./app/Logo";

const SOURCE_URL = "https://github.com/akshay-ap/alt-safe";
const SAMPLE_HASH = "0x6baa30ecc6d4c75212e844455e74c2c16beb8834b7bb905e5f437fac22040578";

const STEPS = [
  { title: "Build", text: "Combine transfers and contract calls into one batch, from templates or any ABI." },
  { title: "Sign", text: "Each owner signs the same Safe transaction hash with their own wallet." },
  {
    title: "Execute",
    text: "With enough signatures it goes on chain in one transaction. All actions succeed or none do.",
  },
];

const FACTS = [
  { title: "No backend", text: "Reads and writes go straight to the RPC you choose. Nothing is stored on a server." },
  { title: "No tracking", text: "No analytics and no accounts. Your Safes and drafts stay in this browser." },
  { title: "Your contracts", text: "Deploy Safe v1.3.0, v1.4.1 or v1.5.0, or point at your own deployment." },
];

const HashSpecimen: React.FC = () => (
  <Box
    aria-label="A Safe transaction hash shown in groups of four characters"
    sx={{ border: `1px solid ${color.hairline}`, borderRadius: 2, p: { xs: 2.5, md: 3.5 }, bgcolor: color.surface }}
  >
    <Typography variant="caption" component="p" sx={{ mb: 2 }}>
      Safe transaction hash, as you sign it
    </Typography>
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(4, auto)",
        justifyContent: "start",
        columnGap: 2,
        rowGap: 1,
        fontFamily: font.mono,
        fontSize: { xs: "1.0625rem", md: "1.375rem" },
      }}
    >
      {chunkHex(SAMPLE_HASH).map((group, index) => (
        <Box key={`${index}-${group}`} component="span" sx={{ color: index === 0 ? color.accent : color.text }}>
          {group}
        </Box>
      ))}
    </Box>
    <Typography variant="body2" color="text.secondary" sx={{ mt: 2.5, maxWidth: 420 }}>
      Every address and hash is printed in groups of four, so you can check it against your wallet chunk by chunk.
    </Typography>
  </Box>
);

const Welcome: React.FC = () => (
  <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
    <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: { xs: 6, md: 10 } }}>
      <Logo />
      <Link href={SOURCE_URL} target="_blank" rel="noopener noreferrer" sx={{ color: "text.secondary" }}>
        Source code
      </Link>
    </Stack>

    <Grid container spacing={{ xs: 5, md: 8 }} sx={{ alignItems: "center", mb: { xs: 8, md: 12 } }}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Typography variant="h1" sx={{ fontSize: { xs: "2.25rem", md: "3rem" }, lineHeight: 1.1, mb: 2.5 }}>
          Run your Safe without anyone in the middle.
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.0625rem", mb: 4, maxWidth: 520 }}>
          ALT Safe builds, signs and executes Safe multisig transactions directly against the chain. Open source, no
          backend, no account.
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
        <HashSpecimen />
      </Grid>
    </Grid>

    <Typography variant="h2" sx={{ mb: 3 }}>
      How a transaction moves
    </Typography>
    <Grid container spacing={3} component="ol" sx={{ listStyle: "none", p: 0, m: 0, mb: { xs: 8, md: 10 } }}>
      {STEPS.map((step, index) => (
        <Grid key={step.title} size={{ xs: 12, md: 4 }} component="li">
          <Typography sx={{ fontFamily: font.mono, color: color.accent, mb: 1 }}>{index + 1}</Typography>
          <Typography variant="h5" component="h3" gutterBottom>
            {step.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {step.text}
          </Typography>
        </Grid>
      ))}
    </Grid>

    <Divider sx={{ mb: { xs: 6, md: 8 } }} />

    <Grid container spacing={3} sx={{ mb: { xs: 6, md: 8 } }}>
      {FACTS.map((fact) => (
        <Grid key={fact.title} size={{ xs: 12, md: 4 }}>
          <Typography variant="h6" component="h3" gutterBottom>
            {fact.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {fact.text}
          </Typography>
        </Grid>
      ))}
    </Grid>

    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 820 }}>
      Works on {supportedChains.map((chain) => chain.name).join(", ")}.
    </Typography>
  </Container>
);

export default Welcome;
