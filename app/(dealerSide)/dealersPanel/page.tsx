"use client";
import React from "react";
import { Box, Typography, Paper, Grid } from "@mui/material";
import useOwnersStore from "@/store/dealersPanel/OwnersInfo";

function AdminPage() {
  const {
    info: { vehicles, name, email },
  } = useOwnersStore();

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
        Welcome to Admin Panel
      </Typography>
      <Grid container spacing={4}>
        {/* Total Cars */}
        {/* <Grid item xs={12} sm={6} md={4}>
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
              Total Cars
            </Typography>
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{ color: "#1976d2" }}
            >
              {vehicles?.length > 0 ? vehicles.length : "0"}
            </Typography>
          </Paper>
        </Grid> */}

        {/* Name */}
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
              Name
            </Typography>
            <Typography variant="h5">{name || "N/A"}</Typography>
          </Paper>
        </Grid>

        {/* Email */}
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
            <Typography variant="h5">{email || "N/A"}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AdminPage;
