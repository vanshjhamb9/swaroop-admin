"use client";
import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Grid, CircularProgress, Alert, Button } from "@mui/material";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import useOwnersStore from "@/store/dealersPanel/OwnersInfo";
import { toast } from "react-toastify";


// test

function AdminPage() {
  const { info, setinfo } = useOwnersStore();
  const [localName, setLocalName] = useState<string>("");
  const [localEmail, setLocalEmail] = useState<string>("");
  const [totalVehicles, setTotalVehicles] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const idToken = await user.getIdToken();
        setToken(idToken);
        await Promise.all([
          fetchDealerInfo(idToken),
          fetchVehicleCount(idToken)
        ]);
      } else {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const fetchDealerInfo = async (authToken: string) => {
    try {
      const response = await fetch("/api/dealer/info", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!response.ok) throw new Error("Failed to fetch dealer info");
      const data = await response.json();
      setLocalName(data.name || "Dealer");
      setLocalEmail(data.email || "");
      setinfo({
        email: data.email,
        name: data.name,
        uid: data.uid,
        contactDetails: data.contactDetails,
        vehicles: data.vehicles,
      });
    } catch (err: any) {
      console.error("Error fetching dealer info:", err);
      // Use fallback from store
      setLocalName(info?.name || "Dealer");
      setLocalEmail(info?.email || "");
    }
  };

  const fetchVehicleCount = async (authToken: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/vehicles/list", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!response.ok) throw new Error("Failed to fetch vehicles");
      const data = await response.json();
      setTotalVehicles(data.vehicles?.length || 0);
    } catch (err: any) {
      console.error("Error fetching vehicles:", err);
      const errorMsg = "Failed to load vehicle count";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 4 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => fetchVehicleCount(token)}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: 4,
        minHeight: "100vh",
        backgroundColor: "background.default",
        color: "text.primary",
      }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          sx={{ marginBottom: 1 }}
        >
          Welcome to Dealer Panel
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Here is an overview of your dealer account
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={2}
            sx={{
              padding: 3,
              textAlign: "center",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              transition: "all 0.3s ease",
              ":hover": {
                transform: "translateY(-4px)",
                boxShadow: "0px 12px 24px rgba(0, 0, 0, 0.15)",
              },
              height: 180,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
              sx={{ opacity: 0.9 }}
            >
              Dealer Name
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {localName || "N/A"}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={2}
            sx={{
              padding: 3,
              textAlign: "center",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "white",
              transition: "all 0.3s ease",
              ":hover": {
                transform: "translateY(-4px)",
                boxShadow: "0px 12px 24px rgba(0, 0, 0, 0.15)",
              },
              height: 180,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
              sx={{ opacity: 0.9 }}
            >
              Email Address
            </Typography>
            <Typography 
              variant="body2" 
              fontWeight="bold"
              sx={{ wordBreak: "break-all", fontSize: "0.95rem" }}
            >
              {localEmail || "N/A"}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={2}
            sx={{
              padding: 3,
              textAlign: "center",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              color: "white",
              transition: "all 0.3s ease",
              ":hover": {
                transform: "translateY(-4px)",
                boxShadow: "0px 12px 24px rgba(0, 0, 0, 0.15)",
              },
              height: 180,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
              sx={{ opacity: 0.9 }}
            >
              Total Vehicles
            </Typography>
            <Typography variant="h3" fontWeight="bold">
              {totalVehicles}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Quick Actions
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
              ":hover": {
                boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.1)",
                bgcolor: "action.hover",
              },
              borderRadius: "8px",
            }}
          >
            <Typography variant="h5" sx={{ mb: 1 }}>
              📋
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              Manage Vehicles
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
              ":hover": {
                boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.1)",
                bgcolor: "action.hover",
              },
              borderRadius: "8px",
            }}
          >
            <Typography variant="h5" sx={{ mb: 1 }}>
              📄
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              View Invoices
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
              ":hover": {
                boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.1)",
                bgcolor: "action.hover",
              },
              borderRadius: "8px",
            }}
          >
            <Typography variant="h5" sx={{ mb: 1 }}>
              ⚙️
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              Settings
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
              ":hover": {
                boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.1)",
                bgcolor: "action.hover",
              },
              borderRadius: "8px",
            }}
          >
            <Typography variant="h5" sx={{ mb: 1 }}>
              ❓
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              Help & Support
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>  
    
  );
}

export default AdminPage;
