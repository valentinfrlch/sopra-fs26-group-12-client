"use client";
import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

type Props = {
  children: React.ReactNode;
};

export default function MuiProvider({ children }: Props) {
  const muiTheme = createTheme({
    palette: {
      mode: "light",
      primary: { main: "#485F23" },
      background: { default: "#FFFDF9", paper: "#FFFFFF" },
    },
    shape: { borderRadius: 12 },
    typography: { button: { textTransform: "none" } },
    components: {
      MuiButton: {
        styleOverrides: { root: { borderRadius: 12 } },
      },
    },
  });

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
