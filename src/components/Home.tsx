import Grid from "@mui/material/Grid2";
import ExistingSafeAccounts from "./ExistingSafeAccounts";

const Home: React.FC = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Grid container spacing={2} style={{ flex: 1 }} sx={{ minHeight: "100vh" }}>
        <Grid size={12}>
          <ExistingSafeAccounts />
        </Grid>
      </Grid>
    </div>
  );
};

export default Home;
