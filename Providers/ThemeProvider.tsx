"use client";
import {
  darkTheme,
  grassyTheme,
  lightTheme,
  defaultTheme,
} from "@/extra/theme";
import useThemeStore from "@/store/Themestore";
import { Button, CssBaseline, type Theme } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme } = useThemeStore();
  const [queryClient] = useState(() => new QueryClient());
  const getTheme = () => {
    switch (theme) {
      case "dark":
        return darkTheme;
      case "grassy":
        return grassyTheme;
      case "light":
        return lightTheme;
      default:
        return defaultTheme;
    }
  };
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={getTheme()}>{children}</ThemeProvider>
    </QueryClientProvider>
  );
}
