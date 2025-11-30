"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  Typography,
  IconButton,
  AppBar,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Header from "@/components/Header/DealersPanelHeader";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/firebase";
import { toast } from "react-toastify";
import { LoaderIcon } from "react-hot-toast";
import useOwnersStore from "@/store/dealersPanel/OwnersInfo";

const drawerWidth = 240;

export default function DealerAdminPanel({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const theme = useTheme();
  const { setinfo } = useOwnersStore();

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      try {
        setLoading(true);
        if (user) {
          let retries = 0;
          const maxRetries = 5;
          let hasDealeradminClaim = false;
          let tokenResult = null;

          // Retry logic to wait for custom claims to be available
          while (retries < maxRetries && !hasDealeradminClaim) {
            tokenResult = await user.getIdTokenResult(true); // Force refresh token
            if (tokenResult.claims.dealeradmin) {
              hasDealeradminClaim = true;
              break;
            }
            retries++;
            if (retries < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before retry
            }
          }

          if (!hasDealeradminClaim) {
            throw new Error("Dealer admin claim not found. Please try logging in again.");
          }

          // Fetch dealer profile from API
          const idToken = await user.getIdToken();
          const response = await fetch('/api/dealer/profile', {
            headers: { Authorization: `Bearer ${idToken}` }
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to fetch dealer profile");
          }

          const dealerData = await response.json();
          
          setinfo({
            email: dealerData.email,
            name: dealerData.name,
            uid: dealerData.uid,
            contactDetails: dealerData.contactDetails,
            vehicles: dealerData.vehicles || [],
          });
          
          setIsAdmin(true);
          // Navigate to dashboard after successful auth
          router.replace("/dealersPanel");
        } else {
          setIsAdmin(false);
          router.replace("/dealersPanel/Authenticate");
        }
      } catch (e: any) {
        console.error("Auth error:", e);
        setIsAdmin(false);
        const errorMsg = e?.message || "Unauthorized access. Please try logging in again.";
        toast.error(errorMsg);
        // Use setTimeout to ensure UI is updated before navigation
        setTimeout(() => {
          router.replace("/dealersPanel/Authenticate");
        }, 500);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <>
      <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Car Admin Panel
        </Typography>
      </Toolbar>
      <List>
        <ListItem
          component={Link}
          href="/dealersPanel"
          sx={{
            "&:hover": {
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            },
          }}
        >
          <ListItemText primary="📊 Dashboard" primaryTypographyProps={{ fontWeight: 500 }} />
        </ListItem>
        <ListItem
          component={Link}
          href="/dealersPanel/Manage_Vehicles"
          sx={{
            "&:hover": {
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            },
          }}
        >
          <ListItemText primary="🚗 Manage Vehicles" primaryTypographyProps={{ fontWeight: 500 }} />
        </ListItem>
        <ListItem
          component={Link}
          href="/dealersPanel/Invoices"
          sx={{
            "&:hover": {
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            },
          }}
        >
          <ListItemText primary="📄 Invoices" primaryTypographyProps={{ fontWeight: 500 }} />
        </ListItem>
        <ListItem
          component={Link}
          href="/dealersPanel/Settings"
          sx={{
            "&:hover": {
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            },
          }}
        >
          <ListItemText primary="⚙️ Settings" primaryTypographyProps={{ fontWeight: 500 }} />
        </ListItem>
        <ListItem
          component={Link}
          href="#"
          sx={{
            "&:hover": {
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            },
          }}
          onClick={async () => {
            await signOut(auth);
            router.replace("/");
          }}
        >
          <ListItemText primary="🚪 Logout" primaryTypographyProps={{ fontWeight: 500, color: 'error' }} />
        </ListItem>
      </List>
    </>
  );

  return loading ? (
    <div className="flex items-center justify-center h-screen">
      <LoaderIcon color="blue" className="!h-40 !w-40 !border-blue-500" />
    </div>
  ) : isAdmin ? (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* AppBar for mobile screens */}
      <AppBar position="fixed" sx={{ display: { md: "none" } }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Car Admin Panel
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Permanent Drawer for larger screens */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.primary.main,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Temporary Drawer for mobile screens */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.primary.main,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: "#f3f4f6",
          mt: { xs: 8, md: 0 },
        }}
      >
        <Header />
        {children}
      </Box>
    </Box>
  ) : (
    <Box sx={{ minHeight: "100vh" }}>{children}</Box>
  );
}
