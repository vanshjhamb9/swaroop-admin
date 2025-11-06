import React from "react";
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
} from "@mui/material";
import NavigateButton from "@/components/Buttons/functionButton";
import BaseTable from "@/components/DealersPanel/HomeVehiclesTable/BaseTable";

export default function VehicleListPage() {
  // Sample data for the table

  return (
    <Box
      sx={{
        p: 4,
        backgroundColor: "background.default",
        color: "text.primary",
        minHeight: "100vh",
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          backgroundColor: "background.default",
          color: "text.primary",
        }}
      >
        <Typography variant="h4" component="h1">
          Vehicles
        </Typography>
        <NavigateButton
          buttonText="Add Vehicle"
          navigateTo="add_vehicle"
          variant="contained"
        />
      </Box>

      {/* Table Section */}
      <BaseTable />
    </Box>
  );
}
