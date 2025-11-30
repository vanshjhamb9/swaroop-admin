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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setLoading(true);
        
        if (!user) {
          setIsAdmin(false);
          router.replace("/dealersPanel/Authenticate");
          return;
        }

        // Verify dealeradmin claim with retries
        let hasDealeradminClaim = false;
        for (let i = 0; i < 5; i++) {
          const tokenResult = await user.getIdTokenResult(true);
          if (tokenResult.claims.dealeradmin) {
            hasDealeradminClaim = true;
            break;
          }
          if (i < 4) await new Promise(r => setTimeout(r, 500));
        }

        if (!hasDealeradminClaim) {
          throw new Error("Not authorized as dealer admin");
        }

        // Set user info
        setinfo({
          email: user.email || "",
          name: "",
          uid: user.uid,
          contactDetails: "",
          vehicles: [],
        });
        
        setIsAdmin(true);
        router.replace("/dealersPanel");
      } catch (error: any) {
        console.error("Auth error:", error?.message);
        setIsAdmin(false);
        toast.error(error?.message || "Authentication failed");
        router.replace("/dealersPanel/Authenticate");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, setinfo]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <>
      <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Dealer Panel
        </Typography>
      </Toolbar>
      <List>
        <ListItem component={Link} href="/dealersPanel">
          <ListItemText primary="📊 Dashboard" />
        </ListItem>
        <ListItem component={Link} href="/dealersPanel/Manage_Vehicles">
          <ListItemText primary="🚗 Manage Vehicles" />
        </ListItem>
        <ListItem component={Link} href="/dealersPanel/Invoices">
          <ListItemText primary="📄 Invoices" />
        </ListItem>
        <ListItem component={Link} href="/dealersPanel/Settings">
          <ListItemText primary="⚙️ Settings" />
        </ListItem>
        <ListItem
          onClick={async () => {
            await signOut(auth);
            router.replace("/");
          }}
        >
          <ListItemText primary="🚪 Logout" />
        </ListItem>
      </List>
    </>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoaderIcon color="blue" className="!h-40 !w-40 !border-blue-500" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Box sx={{ minHeight: "100vh" }}>{children}</Box>;
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar position="fixed" sx={{ display: { md: "none" } }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6">Dealer Panel</Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerWidth,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: theme.palette.background.paper,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: "#f3f4f6",
          mt: { xs: 8, md: 0 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
