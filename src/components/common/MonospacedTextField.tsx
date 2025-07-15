import { TextField, styled } from "@mui/material";

const MonospacedTextField = styled(TextField)({
  "& .MuiInputBase-root": {
    fontFamily: "'Roboto Mono', monospace",
  },
});

export default MonospacedTextField;
