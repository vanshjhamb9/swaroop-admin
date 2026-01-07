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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
} from "@mui/material";
import {
  Download as DownloadIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
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
  imageCount?: number;
  createdAt?: any;
  updatedAt?: any;
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
  
  // Filter states
  const [filterModel, setFilterModel] = useState<string>("");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");
  const [exportLoading, setExportLoading] = useState(false);

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

  const handleExportExcel = async () => {
    try {
      setExportLoading(true);
      const params = new URLSearchParams();
      if (filterModel) params.append("model", filterModel);
      if (filterStartDate) params.append("startDate", filterStartDate);
      if (filterEndDate) params.append("endDate", filterEndDate);

      const response = await fetch(`/api/vehicles/export?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to export data");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const timestamp = new Date().toISOString().split("T")[0];
      a.download = `vehicles_export_${timestamp}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Excel file downloaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to export data");
    } finally {
      setExportLoading(false);
    }
  };

  // Get unique models for filter dropdown
  const uniqueModels = Array.from(new Set(vehicles.map(v => v.model))).filter(Boolean);

  // Apply filters
  const filteredVehicles = vehicles.filter((vehicle) => {
    if (filterModel && vehicle.model !== filterModel) return false;
    
    if (filterStartDate || filterEndDate) {
      const vehicleDate = vehicle.createdAt?.toDate 
        ? vehicle.createdAt.toDate() 
        : vehicle.createdAt 
        ? new Date(vehicle.createdAt) 
        : null;
      
      if (vehicleDate) {
        if (filterStartDate) {
          const start = new Date(filterStartDate);
          start.setHours(0, 0, 0, 0);
          if (vehicleDate < start) return false;
        }
        if (filterEndDate) {
          const end = new Date(filterEndDate);
          end.setHours(23, 59, 59, 999);
          if (vehicleDate > end) return false;
        }
      }
    }
    
    return true;
  });

  const clearFilters = () => {
    setFilterModel("");
    setFilterStartDate("");
    setFilterEndDate("");
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
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportExcel}
            disabled={exportLoading || vehicles.length === 0}
          >
            {exportLoading ? "Exporting..." : "Export Excel"}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenDialog()}
          >
            + Add Vehicle
          </Button>
        </Stack>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <Typography variant="subtitle2" sx={{ mr: 1 }}>
            <FilterIcon sx={{ verticalAlign: "middle", mr: 0.5 }} />
            Filters:
          </Typography>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Model</InputLabel>
            <Select
              value={filterModel}
              label="Model"
              onChange={(e) => setFilterModel(e.target.value)}
            >
              <MenuItem value="">All Models</MenuItem>
              {uniqueModels.map((model) => (
                <MenuItem key={model} value={model}>
                  {model}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Start Date"
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 150 }}
          />

          <TextField
            size="small"
            label="End Date"
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 150 }}
          />

          {(filterModel || filterStartDate || filterEndDate) && (
            <Button size="small" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}

          <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
            Showing {filteredVehicles.length} of {vehicles.length} vehicles
          </Typography>
        </Box>
      </Paper>

      {filteredVehicles.length === 0 ? (
        <Alert severity="info">
          {vehicles.length === 0 
            ? 'No vehicles found. Click "Add Vehicle" to create one.'
            : "No vehicles match the selected filters."}
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Model</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Registration</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">Images</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Created Date</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVehicles.map((vehicle) => {
                const createdDate = vehicle.createdAt?.toDate 
                  ? vehicle.createdAt.toDate() 
                  : vehicle.createdAt 
                  ? new Date(vehicle.createdAt) 
                  : null;
                
                return (
                  <TableRow key={vehicle.id}>
                    <TableCell>{vehicle.name}</TableCell>
                    <TableCell>{vehicle.model}</TableCell>
                    <TableCell>{vehicle.registration}</TableCell>
                    <TableCell align="center">
                      {vehicle.imageCount !== undefined ? vehicle.imageCount : (vehicle.images?.length || 0)}
                    </TableCell>
                    <TableCell>
                      {createdDate 
                        ? createdDate.toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenDialog(vehicle)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
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
