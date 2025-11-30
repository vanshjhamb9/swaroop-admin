"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import { toast } from "react-toastify";
import useOwnersStore from "@/store/dealersPanel/OwnersInfo";

interface Vehicle {
  id: string;
  name: string;
  model: string;
  registration: string;
  images?: string[];
}

export default function ManageVehiclesPage() {
  const { info } = useOwnersStore();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    model: "",
    registration: "",
  });
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const idToken = await user.getIdToken();
        setToken(idToken);
        await fetchVehicles(idToken);
      }
    });
    return unsubscribe;
  }, []);

  const fetchVehicles = async (authToken: string) => {
    try {
      setLoading(true);
      const response = await fetch("/api/vehicles/list", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!response.ok) throw new Error("Failed to fetch vehicles");
      const data = await response.json();
      setVehicles(data.vehicles || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingId(vehicle.id);
      setFormData({
        name: vehicle.name,
        model: vehicle.model,
        registration: vehicle.registration,
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", model: "", registration: "" });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setFormData({ name: "", model: "", registration: "" });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.model || !formData.registration) {
      toast.error("All fields are required");
      return;
    }

    try {
      const endpoint = editingId ? "/api/vehicles/update" : "/api/vehicles/create";
      const method = editingId ? "PUT" : "POST";
      const body = editingId
        ? { vehicleId: editingId, ...formData }
        : formData;

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Failed to save vehicle");
      
      toast.success(editingId ? "Vehicle updated successfully" : "Vehicle created successfully");
      handleCloseDialog();
      await fetchVehicles(token);
    } catch (error: any) {
      toast.error(error.message || "Failed to save vehicle");
    }
  };

  const handleDelete = async (vehicleId: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      const response = await fetch("/api/vehicles/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ vehicleId }),
      });

      if (!response.ok) throw new Error("Failed to delete vehicle");
      toast.success("Vehicle deleted successfully");
      await fetchVehicles(token);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete vehicle");
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, backgroundColor: "background.default", minHeight: "100vh" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Manage Vehicles
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          + Add Vehicle
        </Button>
      </Box>

      {vehicles.length === 0 ? (
        <Alert severity="info">No vehicles found. Click "Add Vehicle" to create one.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Model</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Registration</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>{vehicle.name}</TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>{vehicle.registration}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenDialog(vehicle)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDelete(vehicle.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingId ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
        <DialogContent sx={{ minWidth: 400, pt: 2 }}>
          <TextField
            fullWidth
            label="Vehicle Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            placeholder="e.g., Mercedes-Benz C-Class"
          />
          <TextField
            fullWidth
            label="Model"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            margin="normal"
            placeholder="e.g., C 220d"
          />
          <TextField
            fullWidth
            label="Registration Number"
            value={formData.registration}
            onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
            margin="normal"
            placeholder="e.g., MH-02-AB-1234"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {editingId ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
