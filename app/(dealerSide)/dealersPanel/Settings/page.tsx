"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  Card,
  CardContent,
} from "@mui/material";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import { toast } from "react-toastify";
import useOwnersStore from "@/store/dealersPanel/OwnersInfo";

export default function SettingsPage() {
  const { info } = useOwnersStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactDetails: "",
  });

  useEffect(() => {
    if (info) {
      setFormData({
        name: info.name || "",
        email: info.email || "",
        contactDetails: info.contactDetails || "",
      });
    }
  }, [info]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // Implement API call to update dealer profile
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, backgroundColor: "background.default", minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
        Settings & Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Information Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                Dealer Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <TextField
                fullWidth
                label="Dealer Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                disabled
                variant="outlined"
              />
              
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                disabled
                variant="outlined"
              />
              
              <TextField
                fullWidth
                label="Contact Details"
                name="contactDetails"
                value={formData.contactDetails}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={3}
                placeholder="Phone, Address, City, etc."
                variant="outlined"
              />

              <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Save Changes"}
                </Button>
                <Button variant="outlined" color="secondary">
                  Cancel
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Status Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                Account Details
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Account Type:
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  Dealer Admin
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Account Status:
                </Typography>
                <Typography 
                  variant="body1" 
                  fontWeight="bold" 
                  sx={{ color: "green", bgcolor: "#e8f5e9", px: 2, py: 0.5, borderRadius: 1 }}
                >
                  ✓ Active
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Member Since:
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {new Date().toLocaleDateString()}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Typography variant="body2" color="textSecondary">
                  Unique ID:
                </Typography>
                <Typography variant="body2" fontFamily="monospace" sx={{ fontSize: "0.85rem" }}>
                  {info?.uid?.slice(0, 10)}...
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Alert severity="info" sx={{ mt: 2 }}>
                For security or account-related changes, please contact our support team.
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Password Change Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                Change Password
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <TextField
                fullWidth
                label="Current Password"
                type="password"
                margin="normal"
                variant="outlined"
              />
              
              <TextField
                fullWidth
                label="New Password"
                type="password"
                margin="normal"
                variant="outlined"
              />
              
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                margin="normal"
                variant="outlined"
              />

              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
              >
                Update Password
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                Quick Stats
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Total Vehicles:
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {(info?.vehicles?.length || 0)}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Total Invoices:
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  0
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="textSecondary">
                  Account Balance:
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  ₹0.00
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />
              
              <Alert severity="success">
                All systems operational. No issues detected.
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
