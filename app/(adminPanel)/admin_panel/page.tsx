"use client";
import React, { useEffect, useState } from "react";
import { 
  Box, 
  Typography, 
  Grid, 
  CircularProgress, 
  Alert,
  Card,
  CardContent,
  Stack,
  useTheme,
  Fade
} from "@mui/material";
import {
  People as PeopleIcon,
  DirectionsCar as CarIcon,
  AdminPanelSettings as AdminIcon,
  AccountCircle as UserIcon,
  TrendingUp as TrendingUpIcon
} from "@mui/icons-material";
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
      
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        setError('Not authenticated');
        return;
      }

      const token = await user.getIdToken();
      
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" bgcolor="#f8fafc">
        <CircularProgress size={40} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 4 }}>
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  const StatCard = ({ title, value, icon, color, subtext }: any) => (
    <Card 
      sx={{ 
        height: '100%', 
        borderRadius: 4,
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
        }
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="overline" color="text.secondary" fontWeight="600">
              {title}
            </Typography>
            <Typography variant="h3" fontWeight="700" sx={{ mt: 1, mb: 1, color: '#1e293b' }}>
              {value}
            </Typography>
            {subtext && (
              <Typography variant="body2" color="text.secondary">
                {subtext}
              </Typography>
            )}
          </Box>
          <Box 
            sx={{ 
              p: 2, 
              borderRadius: 3, 
              bgcolor: `${color}.50`, 
              color: `${color}.main` 
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        minHeight: "100vh",
        background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)'
      }}
    >
      <Fade in={true} timeout={800}>
        <Box>
          <Box mb={5}>
            <Typography variant="h4" fontWeight="800" color="#1e293b" gutterBottom>
              Dashboard Overview
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back, {name || email || 'Admin'}
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* User Profile Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  height: '100%', 
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)'
                }}
              >
                <CardContent>
                  <Stack height="100%" justifyContent="space-between">
                    <Box>
                      <Box sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2, width: 'fit-content', mb: 2 }}>
                        <UserIcon />
                      </Box>
                      <Typography variant="overline" sx={{ opacity: 0.8 }} fontWeight="600">
                        Current Session
                      </Typography>
                      <Typography variant="h6" fontWeight="700" noWrap title={email || ''}>
                        {email || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        Role: Administrator
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Stats Cards */}
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="System Admins"
                value={totalAdmins}
                icon={<AdminIcon fontSize="large" />}
                color="purple"
                subtext="Active administrators"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Dealers"
                value={registeredDealers}
                icon={<PeopleIcon fontSize="large" />}
                color="success"
                subtext="Registered partners"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Vehicles"
                value={totalVehicles}
                icon={<CarIcon fontSize="large" />}
                color="warning"
                subtext="Inventory count"
              />
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </Box>
  );
}

export default AdminPage;