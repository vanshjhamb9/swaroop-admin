"use client";
import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Grid, CircularProgress, Alert, Button } from "@mui/material";
import useOwnersStore from "@/store/dealersPanel/OwnersInfo";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { toast } from "react-toastify";

function AdminPage() {
  const { info } = useOwnersStore();
  const { name, email, uid } = info;
  const [totalVehicles, setTotalVehicles] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicleCount = async (dealerId: string) => {
    if (!dealerId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const vehiclesSnap = await getDocs(collection(db, "dealers", dealerId, "vehicles"));
      setTotalVehicles(vehiclesSnap.size);
    } catch (err: any) {
      console.error("Error fetching vehicles:", err);
      const errorMsg = "Failed to load vehicle count";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (uid) {
      fetchVehicleCount(uid);
    } else {
      setLoading(false);
    }
  }, [uid]);

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
            <Button color="inherit" size="small" onClick={fetchVehicleCount}>
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
          Here's an overview of your dealer account
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
              {name || "N/A"}
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
              {email || "N/A"}
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
