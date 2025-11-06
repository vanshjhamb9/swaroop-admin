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
import { auth, db } from "@/firebase";
import { toast } from "react-toastify";
import { LoaderIcon } from "react-hot-toast";
import useOwnersStore from "@/store/dealersPanel/OwnersInfo";
import { doc, getDoc } from "firebase/firestore";

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
          const tokenResult = await user.getIdTokenResult();
          if (!tokenResult.claims.dealeradmin) throw "Unauthorized";
          const res = await getDoc(doc(db, "dealers", user.uid));
          setinfo({
            email: user.email!,
            name: res.data()!.name,
            uid: user.uid,
            contactDetails: res.data()!.contactDetails,
            vehicles: res.data()!.vehicles || [],
          });
          router.replace("/dealersPanel/Manage_Vehicles");
          setIsAdmin(!!tokenResult.claims.dealeradmin);
        } else {
          setIsAdmin(false);
          router.replace("/dealersPanel/Authenticate");
        }
      } catch (e) {
        setIsAdmin(false);
        toast.error("Unauthorized Email");
        router.replace("/dealersPanel/Authenticate");
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
              backgroundColor: theme.palette.background.default,
            },
          }}
        >
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem
          component={Link}
          href="/dealersPanel/Manage_Vehicles"
          sx={{
            "&:hover": {
              backgroundColor: theme.palette.background.default,
            },
          }}
        >
          <ListItemText primary="Manage Vehicles" />
        </ListItem>
        <ListItem
          component={Link}
          href="/dealersPanel/Settings"
          sx={{
            "&:hover": {
              backgroundColor: theme.palette.background.default,
            },
          }}
        >
          <ListItemText primary="Settings" />
        </ListItem>
        <ListItem
          component={Link}
          href="#"
          sx={{
            "&:hover": {
              backgroundColor: theme.palette.background.default,
            },
          }}
          onClick={async () => {
            await signOut(auth);
            router.replace("/");
          }}
        >
          <ListItemText primary="Logout" />
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
