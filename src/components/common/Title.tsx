import { Typography } from "@mui/material";
import type React from "react";

interface TitleProps {
  text: string;
}

const Title: React.FC<TitleProps> = ({ text }) => {
  return (
    <Typography variant="h4" component="h1" gutterBottom>
      {text}
    </Typography>
  );
};

export default Title;
