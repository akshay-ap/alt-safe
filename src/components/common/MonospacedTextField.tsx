import { styled, TextField } from "@mui/material";

const MonospacedTextField = styled(TextField)({
  "& .MuiInputBase-root": {
    fontFamily: "'Roboto Mono', monospace",
  },
});

export default MonospacedTextField;
