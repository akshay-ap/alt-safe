import { Link } from "@mui/material";
import Grid from "@mui/material/Grid";
import type React from "react";

const BottomBar: React.FC = () => {
  return (
    <Grid
      container
      direction="row"
      spacing={2}
      sx={{
        alignItems: "center",
        justifyContent: "right",
        padding: 2,
      }}
    >
      <Grid>
        <Link target="_blank" href="https://github.com/akshay-ap/alt-safe/discussions/2">
          Help
        </Link>
      </Grid>
    </Grid>
  );
};

export default BottomBar;
