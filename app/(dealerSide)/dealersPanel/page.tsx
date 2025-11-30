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
      <Typography
        variant="h4"
        fontWeight="bold"
        gutterBottom
        align="center"
        sx={{ marginBottom: 4 }}
      >
        Welcome to Dealer Panel
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{
              padding: 4,
              textAlign: "center",
              borderRadius: "16px",
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
              ":hover": {
                transform: "scale(1.05)",
                transition: "0.3s ease-in-out",
              },
              color: "text.primary",
              height: 160,
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              color="primary"
              gutterBottom
            >
              Dealer Name
            </Typography>
            <Typography variant="h5">{name || "N/A"}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{
              padding: 4,
              textAlign: "center",
              borderRadius: "16px",
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
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
              Email
            </Typography>
            <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
              {email || "N/A"}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{
              padding: 4,
              textAlign: "center",
              borderRadius: "16px",
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
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
