import { Link } from "@mui/material";
import Grid from "@mui/material/Grid2";
import type React from "react";
import { useNavigate } from "react-router-dom";

const BottomBar: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Grid container direction="row" alignItems="center" justifyContent="right" sx={{ padding: 2 }} spacing={2}>
      <Grid>
        <Link target="_blank" href="https://github.com/akshay-ap/alt-wallet/discussions/1">
          Help
        </Link>
      </Grid>
      <Grid>
        <Link
          component="button"
          onClick={() => {
            navigate("/privacy-policy");
          }}
        >
          Privacy Policy
        </Link>
      </Grid>
      <Grid>
        <Link
          component="button"
          onClick={() => {
            navigate("/about");
          }}
        >
          About
        </Link>
      </Grid>
    </Grid>
  );
};

export default BottomBar;
