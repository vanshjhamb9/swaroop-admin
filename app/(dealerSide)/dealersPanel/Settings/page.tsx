"use client";

import React from "react";
import {
  Box,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import useThemeStore from "@/store/Themestore";

export default function ThemeChanger() {
  const { theme, setTheme } = useThemeStore();

  const handleThemeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setTheme(event.target.value as "light" | "dark" | "grassy");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        gap: 2,
        backgroundColor: "background.default",
        color: "text.primary",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Change Theme
      </Typography>

      <FormControl variant="outlined" sx={{ minWidth: 200 }}>
        <InputLabel id="theme-select-label">Theme</InputLabel>
        <Select
          labelId="theme-select-label"
          value={theme}
          //@ts-ignore
          onChange={handleThemeChange}
          label="Theme"
        >
          <MenuItem value="default">Default</MenuItem>
          <MenuItem value="light">Light</MenuItem>
          <MenuItem value="dark">Dark</MenuItem>
          <MenuItem value="grassy">Grassy</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
