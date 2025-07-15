import { Box, Card, CardContent, Typography, useTheme } from "@mui/material";
import type React from "react";

interface FeatureBoxProps {
  icon: JSX.Element;
  title: string;
  description: string;
}

const FeatureBox: React.FC<FeatureBoxProps> = ({ icon, title, description }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 12px 20px rgba(0, 0, 0, 0.3)",
        },
      }}
    >
      <CardContent sx={{ padding: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 2,
            "& svg": {
              filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2))",
              transition: "transform 0.3s ease",
            },
            "&:hover svg": {
              transform: "scale(1.1)",
            },
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="h5"
          fontWeight={600}
          sx={{
            marginBottom: 1.5,
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: -8,
              left: 0,
              width: "40px",
              height: "2px",
              background: theme.palette.primary.main,
              borderRadius: "1px",
            },
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            marginTop: 2,
            lineHeight: 1.6,
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default FeatureBox;
