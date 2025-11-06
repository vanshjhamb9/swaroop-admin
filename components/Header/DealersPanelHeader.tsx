"use client";
import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Switch,
  Box,
  FormControlLabel,
} from "@mui/material";
import useThemeStore from "@/store/Themestore";

export default function Header() {
  const { theme, setTheme } = useThemeStore();
  const handleThemeToggle = () => {
    const themes = ["light", "dark"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length; // Cycle through themes
    setTheme(themes[nextIndex]);
  };

  return (
    <AppBar position="static" color="primary" className="!hidden md:!block">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Admin Panel
        </Typography>

        {/* Theme Toggle */}
        {/* <Box>
          <FormControlLabel
            control={<Switch onChange={handleThemeToggle} />}
            label={`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
            sx={{
              "& .MuiSwitch-root": {
                color: theme === "grassy" ? "green" : "inherit",
              },
            }}
          />
        </Box> */}
      </Toolbar>
    </AppBar>
  );
}
