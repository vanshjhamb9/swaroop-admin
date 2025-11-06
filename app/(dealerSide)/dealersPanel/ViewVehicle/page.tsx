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
import { getDownloadURL, listAll, ref } from "firebase/storage";
import { storage } from "@/firebase";
import useOwnersStore from "@/store/dealersPanel/OwnersInfo";
const CarDetailsPage = () => {
  const { vehicle: car, setVehicle } = useVehicleStore();
  const { info } = useOwnersStore();
  const [three60viewopen, setthree60viewopen] = useState(false);
  const [sortedImages, setSortedImages] = useState<string[]>([]);
  useEffect(() => {
    console.log("car", car);
    if (
      car?.images?.length === 0 &&
      !car.model &&
      !car.name &&
      !car.registration
    ) {
      const vehicle =
        window !== undefined ? localStorage.getItem("vehicle") : null;
      if (vehicle) {
        const parsedVehicle = JSON.parse(vehicle);
        console.log("vehicle exists", parsedVehicle);
        setVehicle(parsedVehicle);
      }
    }

    // Sort images based on their index in the filename
    // if (car?.images?.length) {
    //   const sorted = [...car.images].sort((a, b) => {
    //     const getIndex = (filename: string) => {
    //       const match = filename.match(/_(\d+)\.[a-zA-Z]+$/); // Match `_number.extension`
    //       return match ? parseInt(match[1], 10) : 0;
    //     };
    //     //@ts-ignore
    //     return getIndex(a) - getIndex(b);
    //   });
    //@ts-ignore
    // setSortedImages(sorted);
  }, [car]);
  useEffect(() => {
    const fetchAndSortImages = async () => {
      try {
        const storagePath = `dealersVehicles/${info.uid}/${car.registration}`; // Update path as needed
        const storageRef = ref(storage, storagePath);

        // Fetch all file references
        const fileList = await listAll(storageRef);

        // Log filenames for debugging
        console.log(
          "Filenames before sorting:",
          fileList.items.map((item) => item.name)
        );

        // Sort file references based on filenames
        const sortedFiles = fileList.items.sort((a, b) => {
          const extractIndex = (filename: string) => {
            const match = filename.match(/_(\d+)$/); // Match `_number` at the end
            return match ? parseInt(match[1], 10) : Infinity; // Use Infinity for filenames without numbers
          };
          return extractIndex(a.name) - extractIndex(b.name);
        });

        // Log filenames after sorting
        console.log(
          "Filenames after sorting:",
          sortedFiles.map((item) => item.name)
        );

        // Get download URLs for sorted files
        const sortedURLs = await Promise.all(
          sortedFiles.map((fileRef) => getDownloadURL(fileRef))
        );

        setSortedImages(sortedURLs);
        setVehicle({ ...car, images: sortedURLs });
      } catch (error) {
        console.error("Error fetching images from Firebase Storage:", error);
      }
    };

    fetchAndSortImages();
  }, [car.registration]);
  const handleCloseModal = () => {
    setthree60viewopen(false);
  };
  console.log("Sorted Images", sortedImages);
  return (
    <Box
      sx={{
        backgroundColor: "background.default",
        color: "text.primary",
      }}
    >
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
          {sortedImages?.map((image, index) => (
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
          color="primary"
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
