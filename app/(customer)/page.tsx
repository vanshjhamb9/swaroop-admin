"use client";
import React from "react";
import { Box, Container, Paper, Typography, Button, Grid } from "@mui/material";
import { useRouter } from "next/navigation";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PersonIcon from "@mui/icons-material/Person";

function Page() {
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 3,
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={10}
          sx={{
            padding: 6,
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.95)",
          }}
        >
          <Box textAlign="center" mb={6}>
            <Typography
              variant="h2"
              fontWeight="bold"
              gutterBottom
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Car360
            </Typography>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Vehicle Inspection & Management Platform
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              Welcome to Car360 - Your comprehensive solution for vehicle
              management, 360° inspections, and dealer operations
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={3}
                sx={{
                  padding: 4,
                  textAlign: "center",
                  height: "100%",
                  transition: "transform 0.3s",
                  "&:hover": {
                    transform: "translateY(-10px)",
                  },
                }}
              >
                <AdminPanelSettingsIcon
                  sx={{ fontSize: 60, color: "#667eea", mb: 2 }}
                />
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Admin Portal
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Manage dealers, admins, analytics, and system settings
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={() => router.push("/admin_panel/Authenticate")}
                  sx={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                    },
                  }}
                >
                  Admin Login
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                elevation={3}
                sx={{
                  padding: 4,
                  textAlign: "center",
                  height: "100%",
                  transition: "transform 0.3s",
                  "&:hover": {
                    transform: "translateY(-10px)",
                  },
                }}
              >
                <DirectionsCarIcon
                  sx={{ fontSize: 60, color: "#667eea", mb: 2 }}
                />
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Dealer Portal
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Manage your vehicle inventory and 360° inspections
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={() => router.push("/dealersPanel/Authenticate")}
                  sx={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                    },
                  }}
                >
                  Dealer Login
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                elevation={3}
                sx={{
                  padding: 4,
                  textAlign: "center",
                  height: "100%",
                  transition: "transform 0.3s",
                  "&:hover": {
                    transform: "translateY(-10px)",
                  },
                }}
              >
                <PersonIcon sx={{ fontSize: 60, color: "#667eea", mb: 2 }} />
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Customer Portal
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  View vehicle inspections and manage your account
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  disabled
                  sx={{
                    borderColor: "#667eea",
                    color: "#667eea",
                  }}
                >
                  Coming Soon
                </Button>
              </Paper>
            </Grid>
          </Grid>

          <Box mt={6} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Need help? Contact support at support@car360.com
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mt={2}>
              © 2025 Car360. All rights reserved.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Page;
