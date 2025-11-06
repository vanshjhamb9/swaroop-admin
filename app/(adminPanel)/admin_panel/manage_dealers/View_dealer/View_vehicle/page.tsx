"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Modal,
  Divider,
  Dialog,
} from "@mui/material";
import useVehicleStore from "@/store/dealersPanel/Vehiclestore";
import Custom360Viewer from "@/components/Custom360View/custom360";

const CarDetailsPage = () => {
  const { vehicle: car, setVehicle } = useVehicleStore();
  const [three60viewopen, setthree60viewopen] = useState(false);

  useEffect(() => {
    console.log("car", car);
    if (
      car?.images?.length == 0 &&
      !car.model &&
      !car.name &&
      !car.registration
    ) {
      const vehicle =
        window !== undefined ? localStorage.getItem("vehicle") : null;
      if (vehicle) {
        const parsedVehicle = JSON.parse(vehicle);
        console.log("vehcile exists", parsedVehicle);
        setVehicle(parsedVehicle);
      }
    }
  }, []);
  const handleCloseModal = () => {
    setthree60viewopen(false);
  };
  return (
    <Box>
      <Dialog
        open={three60viewopen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            maxHeight: "80vh", // Limit the height of the dialog
            padding: 4,
          },
        }}
      >
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          360 spin
        </Typography>
        <Custom360Viewer />
      </Dialog>
      <Box
        sx={{
          maxWidth: "900px",
          mx: "auto",
          my: 4,
          p: 3,
          borderRadius: 2,
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          bgcolor: "background.paper",
        }}
      >
        {/* Car Header Section */}
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
          {car.name}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {/* Car Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">Registration:</Typography>
          <Typography variant="body1" color="text.secondary">
            {car.registration}
          </Typography>

          <Typography variant="h6" sx={{ mt: 2 }}>
            Model:
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {car.model}
          </Typography>
        </Box>

        {/* Display Images */}
        <Grid container spacing={2} className="my-3">
          {car?.images?.map((image, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ boxShadow: 3 }}>
                <CardMedia
                  component="img"
                  height="200"
                  // image={image}
                  src={image as string}
                  alt={`Car image ${index + 1}`}
                  sx={{ objectFit: "cover" }}
                />
              </Card>
            </Grid>
          ))}
        </Grid>
        <Button
          variant="contained"
          color="info"
          onClick={() => {
            setthree60viewopen(true);
          }}
          className="my-6"
        >
          Show 360 View
        </Button>
      </Box>
    </Box>
  );
};

export default CarDetailsPage;
