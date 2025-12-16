"use client";
import { useEffect, useState } from "react";
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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu"; // Material-UI hamburger icon
import Header from "@/components/Header/DealersPanelHeader";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/firebase";
import { toast } from "react-toastify";
import { LoaderIcon } from "react-hot-toast";
import { signOut } from "firebase/auth";
import useAdminOwnerStore from "@/store/adminPanel/AdminOwnersInfo";

const drawerWidth = 240;

export default function DealerAdminPanel({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState(false); // State for mobile drawer
  const router = useRouter();
  const pathname = usePathname();
  const { setinfo } = useAdminOwnerStore();

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      try {
        setLoading(true);
        if (user) {
          const tokenResult = await user.getIdTokenResult();
          if (!tokenResult.claims.admin) throw "Unauthorized";
          setIsAdmin(!!tokenResult.claims.admin);
          setinfo({ email: user.email!, name: "", uid: user.uid });
        } else {
          setIsAdmin(false);
          if (pathname !== "/admin_panel/Authenticate") {
            router.replace("/admin_panel/Authenticate");
            toast.error("Unauthorized");
          }
        }
      } catch (e) {
        setIsAdmin(false);
        if (pathname !== "/admin_panel/Authenticate") {
          toast.error("Unauthorized Email");
          router.replace("/admin_panel/Authenticate");
        }
      } finally {
        setLoading(false);
      }
    });
  }, [pathname]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <>
      {
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Super Admin Panel
          </Typography>
        </Toolbar>
      }
      <List>
        <ListItem
          component={Link}
          href="/admin_panel"
          sx={{
            "&:hover": {
              backgroundColor: "#374151",
            },
          }}
        >
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem
          component={Link}
          href="/analytics"
          sx={{
            "&:hover": {
              backgroundColor: "#374151",
            },
          }}
        >
          <ListItemText primary="Analytics" />
        </ListItem>
        <ListItem
          component={Link}
          href="/admin_panel/invoices"
          sx={{
            "&:hover": {
              backgroundColor: "#374151",
            },
          }}
        >
          <ListItemText primary="Invoices" />
        </ListItem>
        <ListItem
          component={Link}
          href="/admin_panel/manage_dealers"
          sx={{
            "&:hover": {
              backgroundColor: "#374151",
            },
          }}
        >
          <ListItemText primary="Manage Dealers" />
        </ListItem>
        <ListItem
          component={Link}
          href="/admin_panel/create_dealers_account"
          sx={{
            "&:hover": {
              backgroundColor: "#374151",
            },
          }}
        >
          <ListItemText primary="Create Dealer Account" />
        </ListItem>
        <ListItem
          component={Link}
          href="/admin_panel/create_admin"
          sx={{
            "&:hover": {
              backgroundColor: "#374151",
            },
          }}
        >
          <ListItemText primary="Create Admin" />
        </ListItem>
        <ListItem
          component={Link}
          href="/admin_panel/seed-database"
          sx={{
            "&:hover": {
              backgroundColor: "#374151",
            },
          }}
        >
          <ListItemText primary="Seed Database" />
        </ListItem>
        <ListItem
          component={Link}
          href="#"
          sx={{
            "&:hover": {
              backgroundColor: "#374151",
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
  console.log("Mobikle Open ", mobileOpen);
  return loading ? (
    <div className="flex items-center justify-center h-screen">
      <LoaderIcon color="blue" className="!h-40 !w-40 !border-blue-500" />
    </div>
  ) : isAdmin ? (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* AppBar for small screens */}
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
            Super Admin Panel
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Permanent drawer for larger screens */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#1f2937",
            color: "white",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Temporary drawer for small screens */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }} // Improves performance on mobile
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#1f2937",
            color: "white",
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
          backgroundColor: "#f3f4f6", // Tailwind's gray-100
          mt: { xs: 8, md: 0 }, // Adjust for AppBar height on mobile
        }}
      >
        {<Header />}
        {children}
      </Box>
    </Box>
  ) : (
    <Box>{children}</Box>
  );
}
