import { Link } from "@mui/material";
import Grid from "@mui/material/Grid2";
import type React from "react";

const BottomBar: React.FC = () => {
  return (
    <Grid container direction="row" alignItems="center" justifyContent="right" sx={{ padding: 2 }} spacing={2}>
      <Grid>
        <Link target="_blank" href="https://github.com/akshay-ap/alt-safe/discussions/2">
          Help
        </Link>
      </Grid>
    </Grid>
  );
};

export default BottomBar;
