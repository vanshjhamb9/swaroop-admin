'use client';
import { createTheme } from "@mui/material/styles";

export const defaultTheme = createTheme({
    palette: {
        mode: "light", // Ensures a light theme
        primary: {
            main: "#f56300", // CTA color
            contrastText: "#ffffff", // Text on primary buttons
        },
        secondary: {
            main: "#0066cc", // Blue (Logo and Name)
            contrastText: "#ffffff", // Text on secondary buttons
        },
        background: {
            default: "#e6e6e6", // Platinum
            paper: "#f5f5f7",   // White for surfaces
        },
        text: {
            primary: "#424245", // Grey
            secondary: "#333333", // Darker grey for less emphasis
        },
    },
    typography: {
        fontFamily: "Roboto, Arial, sans-serif", // Customize if needed
        button: {
            textTransform: "none", // Disable uppercase buttons by default
        },
    },
});

export const lightTheme = createTheme({
    palette: {
      mode: "light",
      primary: {
        main: "#1976d2", // Light blue
        contrastText: "#fff",
      },
      secondary: {
        main: "#f50057", // Pink
        contrastText: "#fff",
      },
      text: {
        primary: "#000",
        secondary: "#555",
      },
      button: {
        main: "#4caf50", // Green
        contrastText: "#fff",
      },
      background: {
        default: "#f3f4f6", // Light gray
        paper: "#fff",
      },
    },
  });

export const darkTheme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#90caf9", // Light blue
            contrastText: "#000",
        },
        secondary: {
            main: "#f48fb1", // Light pink
            contrastText: "#000",
        },
        text: {
            primary: "#fff",
            secondary: "#ccc",
        },
        button: {
            main: "#ff9800", // Orange
            contrastText: "#000",
        },
        background: {
            default: "#121212", // Dark gray
            paper: "#1e1e1e",
        },
    },
});

// Grassy Theme
export const grassyTheme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#388e3c", // Green
            contrastText: "#fff",
        },
        secondary: {
            main: "#fdd835", // Yellow
            contrastText: "#000",
        },
        text: {
            primary: "#2e7d32",
            secondary: "#8bc34a",
        },
        button: {
            main: "#81c784", // Light green
            contrastText: "#000",
        },
        background: {
            default: "#e8f5e9", // Light green background
            paper: "#ffffff",
        },
    },
});