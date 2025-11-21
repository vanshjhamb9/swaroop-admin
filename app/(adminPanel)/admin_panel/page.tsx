"use client";
import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Grid, CircularProgress, Alert } from "@mui/material";
import useAdminOwnerStore from "@/store/adminPanel/AdminOwnersInfo";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";

function AdminPage() {
  const {
    info: { name, email },
  } = useAdminOwnerStore();
  const [registeredDealers, setregisteredDealers] = useState<number>(0);
  const [totalAdmins, setTotalAdmins] = useState<number>(0);
  const [totalVehicles, setTotalVehicles] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchdealers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get auth token
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        setError('Not authenticated');
        return;
      }

      const token = await user.getIdToken();
      
      // Call API endpoint instead of using client SDK
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();
      
      if (result.success) {
        setTotalAdmins(result.data.totalAdmins);
        setregisteredDealers(result.data.totalDealers);
        setTotalVehicles(result.data.totalVehicles);
      } else {
        throw new Error(result.error || 'Failed to fetch data');
      }
    } catch (e: any) {
      console.error("Error fetching data:", e);
      setError(e.message || "Failed to fetch dashboard data");
      toast.error("Couldn't fetch information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchdealers();
  }, []);

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
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: 4,
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <Typography
        variant="h4"
        fontWeight="bold"
        gutterBottom
        align="center"
        sx={{ color: "#333", marginBottom: 4 }}
      >
        Welcome to Admin Panel
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              padding: 4,
              textAlign: "center",
              borderRadius: "16px",
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
              background: "linear-gradient(145deg, #e0e0e0, #ffffff)",
              ":hover": {
                transform: "scale(1.05)",
                transition: "0.3s ease-in-out",
              },
              height: 160,
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              color="primary"
              gutterBottom
            >
              Logged In as
            </Typography>
            <Typography variant="h6" sx={{ color: "#333" }}>
              {email || "N/A"}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              padding: 4,
              textAlign: "center",
              borderRadius: "16px",
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
              background: "linear-gradient(145deg, #e0e0e0, #ffffff)",
              ":hover": {
                transform: "scale(1.05)",
                transition: "0.3s ease-in-out",
              },
              height: 160,
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              color="primary"
              gutterBottom
            >
              Total Admins
            </Typography>
            <Typography variant="h3" fontWeight="bold" sx={{ color: "#1976d2" }}>
              {totalAdmins}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              padding: 4,
              textAlign: "center",
              borderRadius: "16px",
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
              background: "linear-gradient(145deg, #e0e0e0, #ffffff)",
              ":hover": {
                transform: "scale(1.05)",
                transition: "0.3s ease-in-out",
              },
              height: 160,
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              color="primary"
              gutterBottom
            >
              Total Car Dealers
            </Typography>
            <Typography variant="h3" fontWeight="bold" sx={{ color: "#1976d2" }}>
              {registeredDealers}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              padding: 4,
              textAlign: "center",
              borderRadius: "16px",
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
              background: "linear-gradient(145deg, #e0e0e0, #ffffff)",
              ":hover": {
                transform: "scale(1.05)",
                transition: "0.3s ease-in-out",
              },
              height: 160,
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              color="primary"
              gutterBottom
            >
              Total Vehicles
            </Typography>
            <Typography variant="h3" fontWeight="bold" sx={{ color: "#1976d2" }}>
              {totalVehicles}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AdminPage;