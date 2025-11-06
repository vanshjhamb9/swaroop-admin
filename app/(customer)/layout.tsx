"use client";
import React, { useState } from "react";
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import InfoIcon from "@mui/icons-material/Info";

const drawerWidth = 280; // Sidebar width

const CustomerViewLayout = ({ children }: any) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleDrawer = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        bgcolor: "#1f2937", // Professional dark gray background
        color: "#f3f4f6", // Light text color
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
      }}
    >
      {/* Logo or Brand Name */}
      <Box sx={{ padding: 2, textAlign: "center" }}>
        <Typography variant="h5" fontWeight="bold" color="#ffffff">
          Car 360
        </Typography>
      </Box>

      <Divider sx={{ borderColor: "#374151" }} />

      {/* Menu Items */}
      <List>
        <ListItem component="button">
          <ListItemIcon sx={{ color: "#9ca3af" }}>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText
            primary="Home"
            primaryTypographyProps={{
              fontSize: "16px",
              color: "#f9fafb",
              fontWeight: 500,
            }}
          />
        </ListItem>
        <ListItem component="button">
          <ListItemIcon sx={{ color: "#9ca3af" }}>
            <DirectionsCarIcon />
          </ListItemIcon>
          <ListItemText
            primary="Vehicles"
            primaryTypographyProps={{
              fontSize: "16px",
              color: "#f9fafb",
              fontWeight: 500,
            }}
          />
        </ListItem>
        <ListItem component="button">
          <ListItemIcon sx={{ color: "#9ca3af" }}>
            <InfoIcon />
          </ListItemIcon>
          <ListItemText
            primary="About"
            primaryTypographyProps={{
              fontSize: "16px",
              color: "#f9fafb",
              fontWeight: 500,
            }}
          />
        </ListItem>
      </List>

      <Divider sx={{ borderColor: "#374151" }} />

      {/* Footer */}
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* AppBar for Mobile */}
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            zIndex: theme.zIndex.drawer + 1,
            bgcolor: "#1f2937",
            color: "#f9fafb",
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap>
              Dealer Panel
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar (Responsive Drawer) */}
      {/* <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={toggleDrawer}
        ModalProps={{
          keepMounted: true, // Better performance on mobile
        }}
        sx={{
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: "#1f2937",
          },
        }}
      >
        {drawerContent}
      </Drawer> */}

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: { sm: `${drawerWidth}px` }, // Apply margin-left when sidebar is persistent
        }}
      >
        {isMobile && <Toolbar />} {/* Push content below AppBar on mobile */}
        {children}
      </Box>
      <Box
        sx={{
          padding: 2,
          textAlign: "center",
          position: "fixed",
          bottom: 0,
          width: "100%",
          bgcolor: "#1f2937",
          color: "#9ca3af",
        }}
      >
        <Typography variant="body2">
          Car360 © {new Date().getFullYear()}
        </Typography>
      </Box>
    </Box>
  );
};

export default CustomerViewLayout;
