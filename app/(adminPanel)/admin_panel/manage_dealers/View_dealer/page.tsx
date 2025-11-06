"use client";
import BaseTable from "@/components/DealersPanel/HomeVehiclesTable/BaseTable";
import useOwnersStore from "@/store/dealersPanel/OwnersInfo";
import { Box, Typography, Paper } from "@mui/material";
import React from "react";

function ViewDealer() {
  const { info } = useOwnersStore();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: 3,
        backgroundColor: "background.default",
        borderRadius: 2,
        boxShadow: 3,
        margin: "auto",
        mt: 4,
      }}
    >
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Dealer Information
      </Typography>
      <Typography variant="body1">
        <strong>Name:</strong> {info.name || "N/A"}
      </Typography>
      <Typography variant="body1">
        <strong>Email:</strong> {info.email || "N/A"}
      </Typography>
      <Typography variant="body1">
        <strong>Contact Details:</strong> {info.contactDetails || "N/A"}
      </Typography>

      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Vehicles Overview
        </Typography>
        <BaseTable />
      </Box>
    </Box>
  );
}

export default ViewDealer;
