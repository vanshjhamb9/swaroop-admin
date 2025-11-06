"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
// import View360 from "@/components/360View/View360";
import "@/app/globals.css";
import { toast } from "react-toastify";
import useVehicleStore from "@/store/dealersPanel/Vehiclestore";
import useOwnersStore from "@/store/dealersPanel/OwnersInfo";
import Custom360Viewer from "@/components/Custom360View/custom360";
export default function AddVehiclePage() {
  const { vehicle } = useVehicleStore();
  const [images, setImages] = useState<File[]>([]);
  const [processedImages, setProcessedImages] = useState<any[]>(
    vehicle.editing
      ? vehicle.images
      : [
          // "/static/bgremove.png",
          // "/static/bgremove2.png",
        ]
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSatisfied, setIsSatisfied] = useState(false);
  const [vehicleDetails, setVehicleDetails] = useState({
    name: vehicle.editing ? vehicle.name : "",
    model: vehicle.editing ? vehicle.model : "",
    registrationNumber: vehicle.editing ? vehicle.registration : "",
  });
  const { addVehicleToDb } = useVehicleStore();
  const [watermarkedImage, setWatermarkedImage] = useState<string | null>(null);
  const [dents, setDents] = useState<dentDescription[]>([]);
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const uploadedFiles = Array.from(event.target.files);
      setImages((prev) => [...prev, ...uploadedFiles]);
    }
  };

  const url = "https://sdk.photoroom.com/v1/segment";
  const apiKey = "sandbox_7a6b57ffaa1960dd367c36ef89603d73bdce576a";

  async function removeBackground(imageFile: File): Promise<Blob> {
    const formData = new FormData();
    formData.append("image_file", imageFile);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      console.error(response.json());
      throw new Error("Network response was not ok");
    }

    const imageBlob: Blob = await response.blob();

    return imageBlob;
  }
  // Simulates API call for background removal
  console.log("unprocessed Images", images);
  console.log("processed Images", processedImages);

  const handleRemoveBackground = async () => {
    setIsProcessing(true);

    try {
      const processed = await Promise.all(
        images.map(async (file) => {
          try {
            if (file.name.startsWith("https://firebasestorage.googleapis.com"))
              return null;
            const processedBlob = await removeBackground(file);
            return URL.createObjectURL(processedBlob);
          } catch (error) {
            console.error("Error processing file:", file.name, error);
            return null; // Gracefully handle errors
          }
        })
      );
      setProcessedImages(
        processed.filter((url): url is string => url !== null)
      );
      toast.success("Background Removed From Image");
    } catch (e) {
      toast.error("Error processing images");
    } finally {
      setIsProcessing(false);
    }
  };

  // console.log("processed", typeof processedImages[0]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVehicleDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleDownloadImages = () => {
    processedImages.forEach((image, index) => {
      const link = document.createElement("a");
      link.href = image;
      link.download = `processed-image-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };
  const history = useRef<string[]>([]);
  const processedImagesHistory = useRef<string[]>([]);
  const [isuploading, setisuploading] = useState<boolean>(false);
  const bulkhistory = useRef<File[]>([]);

  const undoLastChange = () => {
    if (history.current.length > 0) {
      const lastState = history.current.pop(); // Retrieve the last saved state
      setWatermarkedImage(lastState || null);
    } else {
      alert("No previous state to undo!");
    }
  };
  const handleSubmitToCloud = async () => {
    const id = toast.loading("Submitting");
    setisuploading(true);
    try {
      await addVehicleToDb({
        images: processedImages,
        model: vehicleDetails.model,
        name: vehicleDetails.name,
        registration: vehicleDetails.registrationNumber,
        editing: vehicle.editing,
        id: vehicle.id,
      });
      toast.update(id, {
        closeButton: true,
        autoClose: 5000,
        type: "success",
        isLoading: false,
        render: "Success",
      });
    } catch (e) {
      console.log("e", e);
      toast.update(id, {
        closeButton: true,
        autoClose: 5000,
        type: "error",
        isLoading: false,
        render: "An Error Occurred",
      });
    } finally {
      setisuploading(false);
    }
  };
  const [open, setOpen] = useState(false);
  const [dentModal, setdentModal] = useState(false);

  const [satisfiedopen, setsatisfiedOpen] = useState(false);
  const [three60viewopen, setthree60viewopen] = useState(false);
  const [changeSingleImageBg, setchangeSingleImageBg] =
    useState<boolean>(false);
  const [changeBulkImagesBg, setchangeBulkImagesBg] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const backgroundImages = ["/static/blinqbg.png", "/static/serve.jpeg"];
  const handleImageClick = (image: File | string) => {
    if (image instanceof File) {
      // If it's a File, create a URL for the image
      setWatermarkedImage("");
      setSelectedBackground("");

      const imageUrl = URL.createObjectURL(image);
      setSelectedImage(imageUrl);

      // addWatermark(imageUrl);
    } else {
      // If it's a URL, just use it
      setSelectedImage(image);
      // addWatermark(image);
    }
    setOpen(true);
  };
  console.log("processed Images", processedImages);
  console.log("processed Images History", processedImagesHistory.current);
  const handleCloseModal = () => {
    setOpen(false);
    setsatisfiedOpen(false);
    setSelectedImage(null);
    setthree60viewopen(false);
  };
  const [selectedBackground, setSelectedBackground] = useState<any>();
  // const addWatermark = (imageUrl: string) => {
  //   const canvas = document.createElement("canvas");
  //   const ctx = canvas.getContext("2d");

  //   const img = new Image();
  //   img.src = imageUrl;
  //   // img.crossOrigin = "anonymous";
  //   img.onload = () => {
  //     canvas.width = img.width;
  //     canvas.height = img.height;

  //     // Draw the image on the canvas
  //     ctx?.drawImage(img, 0, 0);

  //     // Define an array of watermark texts with different fonts, styles, rotation, and positions
  //     const watermarks = [
  //       {
  //         text: "Sample Watermark 1",
  //         font: "48px Arial",
  //         color: "rgba(0, 0, 0, 1)",
  //         position: [img.width / 4, img.height / 4],
  //         rotation: Math.PI / 4,
  //       }, // 45 degrees
  //       {
  //         text: "Sample Watermark 2",
  //         font: "36px 'Times New Roman'",
  //         color: "rgba(0, 0, 255, 1)",
  //         position: [img.width - 30, img.height / 4],
  //         rotation: -Math.PI / 6,
  //       },
  //       {
  //         text: "Sample Watermark 5",
  //         font: "32px 'Verdana'",
  //         color: "rgba(255, 165, 0, 1)",
  //         position: [img.width / 2, img.height / 2],
  //         rotation: -Math.PI / 4,
  //       }, // -45 degrees
  //       {
  //         text: "Sample Watermark 6",
  //         font: "28px 'Comic Sans MS'",
  //         color: "rgba(0, 255, 255, 1)",
  //         position: [(img.width * 3) / 4, (img.height * 3) / 4],
  //         rotation: Math.PI / 6,
  //       }, // 30 degrees
  //     ];

  //     // Loop through each watermark and draw them on the canvas with rotation
  //     watermarks.forEach((watermark) => {
  //       const x = watermark.position[0];
  //       const y = watermark.position[1];

  //       // Save the current context state to restore it later
  //       ctx!.save();

  //       // Set up the context to rotate around the watermark's position
  //       ctx!.translate(x, y);
  //       ctx!.rotate(watermark.rotation);

  //       // Draw the text with the rotated context
  //       ctx!.font = watermark.font;
  //       ctx!.fillStyle = watermark.color;
  //       ctx!.textAlign = "center";
  //       ctx!.textBaseline = "middle";
  //       ctx!.fillText(watermark.text, 0, 0); // (0, 0) because we've already translated the origin

  //       // Restore the context to its original state
  //       ctx!.restore();
  //     });

  //     // Set the watermarked image as a data URL
  //     setWatermarkedImage(canvas?.toDataURL());
  //   };
  // };

  // const resizeImageProportionally = (
  //   imgWidth: number,
  //   imgHeight: number,
  //   targetWidth: number,
  //   targetHeight: number
  // ) => {
  //   const aspectRatio = imgWidth / imgHeight;

  //   if (targetWidth / targetHeight > aspectRatio) {
  //     return { width: targetHeight * aspectRatio, height: targetHeight };
  //   } else {
  //     return { width: targetWidth, height: targetWidth / aspectRatio };
  //   }
  // };

  // const applyBackground = () => {
  //   const id = toast.loading("Applying Background");
  //   const canvas = document.createElement("canvas") as HTMLCanvasElement;
  //   if (!canvas) {
  //     alert("Canvas element not found!");
  //     return;
  //   }

  //   const ctx = canvas.getContext("2d");
  //   if (!ctx) {
  //     alert("Failed to get canvas context!");
  //     return;
  //   }

  //   if (watermarkedImage && selectedBackground) {
  //     let toedit;
  //     if (history.current.length > 0) {
  //       toedit = history.current.at(0);
  //     } else {
  //       toedit = watermarkedImage;
  //     }
  //     history.current.push(watermarkedImage);

  //     const bgImg = new Image();
  //     bgImg.src = selectedBackground;

  //     bgImg.onload = () => {
  //       canvas.width = bgImg.width;
  //       canvas.height = bgImg.height;

  //       ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  //       const mainImg = new Image();
  //       mainImg.src = toedit!;

  //       mainImg.onload = () => {
  //         const padding = Math.min(canvas.width, canvas.height) * 0.05; // 5% padding
  //         const { width, height } = resizeImageProportionally(
  //           mainImg.width,
  //           mainImg.height,
  //           canvas.width - 2 * padding,
  //           canvas.height - 2 * padding
  //         );
  //         const centerX = (canvas.width - width) / 2;
  //         const centerY = (canvas.height - height) / 2;

  //         ctx.drawImage(mainImg, centerX, centerY, width, height);

  //         const updatedImageUrl = canvas.toDataURL();
  //         setWatermarkedImage(updatedImageUrl);
  //         toast.update(id, {
  //           isLoading: false,
  //           closeButton: true,
  //           autoClose: 5000,
  //           render: "Background Applied To Image",
  //         });
  //       };

  //       mainImg.onerror = () => {
  //         toast.update(id, {
  //           isLoading: false,
  //           closeButton: true,
  //           autoClose: 5000,
  //           type: "error",
  //           render: "Failed to load the foreground image",
  //         });
  //       };
  //     };

  //     bgImg.onerror = () => {
  //       toast.update(id, {
  //         isLoading: false,
  //         closeButton: true,
  //         autoClose: 5000,
  //         type: "error",
  //         render: "Failed to load the background image.",
  //       });
  //     };
  //     setchangeSingleImageBg(false);
  //   } else {
  //     toast.update(id, {
  //       isLoading: false,
  //       closeButton: true,
  //       type: "error",
  //       render: "Please select an image and a background!",
  //       autoClose: 5000,
  //     });
  //   }
  // };
  // const applyBackgroundForBulkImages = (imgURL: string): Promise<string> => {
  //   return new Promise((resolve, reject) => {
  //     const canvas = document.createElement("canvas") as HTMLCanvasElement;

  //     const ctx = canvas.getContext("2d");

  //     const bgImg = new Image();
  //     bgImg.src = selectedBackground;

  //     bgImg.onload = () => {
  //       canvas.width = bgImg.width;
  //       canvas.height = bgImg.height;

  //       ctx?.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  //       const mainImg = new Image();
  //       mainImg.crossOrigin = "anonymous"; // Allow cross-origin requests
  //       mainImg.src = imgURL;
  //       mainImg.onload = () => {
  //         const padding = Math.min(canvas.width, canvas.height) * 0.05; // 5% padding
  //         const { width, height } = resizeImageProportionally(
  //           mainImg.width,
  //           mainImg.height,
  //           canvas.width - 2 * padding,
  //           canvas.height - 2 * padding
  //         );
  //         const centerX = (canvas.width - width) / 2;
  //         const centerY = (canvas.height - height) / 2;

  //         ctx?.drawImage(mainImg, centerX, centerY, width, height);

  //         canvas.toBlob(
  //           (blob) => {
  //             if (blob) {
  //               const blobUrl = URL.createObjectURL(blob); // Create a URL for the blob
  //               resolve(blobUrl); // Resolve the Promise with the blob URL
  //             } else {
  //               reject("Failed to convert canvas to Blob.");
  //             }
  //           },
  //           "image/png" // Specify the desired output format
  //         );
  //       };

  //       mainImg.onerror = () => {
  //         // alert("Failed to load the foreground image.");
  //         reject("Failed to load the foreground image.");
  //       };
  //     };

  //     bgImg.onerror = () => {
  //       // alert("Failed to load the background image.");
  //       reject("Failed to load the background image.");
  //     };
  //   });
  // };
  // const applyBackgroundOnAllImages = async () => {
  //   const id = toast.loading("Applying New Background To Images");
  //   try {
  //     const toProcess =
  //       processedImagesHistory.current.length > 0
  //         ? processedImagesHistory.current
  //         : processedImages;
  //     processedImagesHistory.current = [];
  //     console.log("To PRocess", toProcess);
  //     const processedImagesWithBackground = await Promise.all(
  //       toProcess.map((image) => {
  //         console.log("Image of Toprocess", image);
  //         processedImagesHistory.current.push(image);
  //         return applyBackgroundForBulkImages(image); // Apply background and get the processed image URL
  //       })
  //     );
  //     toast.update(id, {
  //       isLoading: false,
  //       closeButton: true,
  //       type: "success",
  //       render: "New Background Applied To Images",
  //       autoClose: 5000,
  //     });
  //     setProcessedImages(processedImagesWithBackground!);
  //     setchangeBulkImagesBg(false);
  //   } catch (error) {
  //     toast.update(id, {
  //       isLoading: false,
  //       closeButton: true,
  //       type: "error",
  //       render: "An Error Occurred " + error,
  //     });

  //     // console.error("Error processing images:", error);
  //   }
  // };
  // const undoBulkImagesBackgroundChanges = () => {
  //   const imges = processedImagesHistory.current.map((i) => i);
  //   if (imges.length > 0) {
  //     setProcessedImages(imges);
  //   } else {
  //     toast.info("Nothing To Process");
  //   }
  // };
  // useEffect(() => {
  //   if (selectedBackground && changeBulkImagesBg) applyBackgroundOnAllImages();
  // }, [selectedBackground, changeBulkImagesBg]);
  // useEffect(() => {
  //   if (selectedBackground && changeSingleImageBg) applyBackground();
  // }, [selectedBackground, changeSingleImageBg]);

  const HandleDent = (e: any) => {
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100; // Calculate percentage
    const y = ((e.clientY - rect.top) / rect.height) * 100; // Calculate percentage
    const dentId = Date.now();
    setedithandleId(dentId);
    setdentDescription("");
    setdentUploadedImage(null);
    setDents((prevDents: any) => [
      ...prevDents,
      { id: dentId, x, y, reference: { description: "", image: null } }, // Store percentages
    ]);
    setdentModal(true);
  };
  const editHandleDent = (dent: dentDescription) => {
    setdentModal(true);
    setedithandleId(dent.id);
    setdentUploadedImage(dent.reference?.image || null);
    setdentDescription(dent.reference.description);
  };
  const [editHandleid, setedithandleId] = useState<number | null>(null);
  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Uploaded file:", file);
    } else {
      alert("Please select a file.");
    }
  };
  const [dentuploadedImage, setdentUploadedImage] = useState<string | null>(
    null
  );
  const [dentDescription, setdentDescription] = useState<string>("");
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setdentUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const removeDent = () => {
    setDents((prevDents: any) =>
      prevDents.filter((d: any) => d.id !== editHandleid)
    );
    setdentModal(false);
  };
  const saveDentDescription = () => {
    if (!dentDescription || !dentuploadedImage)
      return toast.error("Please Upload Dent Description and Image");
    const toEdit = dents.find((d) => d.id === editHandleid);
    if (!toEdit) return;
    let toUpdateDents = dents.filter((d) => d.id !== editHandleid);
    toUpdateDents = [
      ...toUpdateDents,
      {
        ...toEdit,
        reference: {
          description: dentDescription,
          image: dentuploadedImage,
        },
      },
    ];
    setDents(toUpdateDents);

    setdentDescription("");
    setdentUploadedImage(null);
    setdentModal(false);
  };
  return (
    <Box
      sx={{
        p: 4,
        backgroundColor: "background.default",
        color: "text.primary",
        minHeight: "100vh",
      }}
    >
      <Dialog
        open={three60viewopen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            overflow: "hidden", // Prevent overflow inside the dialog paper
            maxHeight: "80vh", // Limit the height of the dialog
            padding: 4,
          },
        }}
      >
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          360 spin
        </Typography>
        {/* <DynamicView360 blobs={processedImages} /> */}
        <Custom360Viewer />
      </Dialog>
      <Dialog
        open={dentModal}
        onClose={setdentModal.bind(null, false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Close-Up Dent
          <IconButton
            edge="end"
            color="inherit"
            onClick={() => setdentModal(false)}
            aria-label="close"
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {/* Dent Description */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Upload Close-Up of Dent
            </Typography>
            <TextField
              fullWidth
              label="Dent Description"
              name="dentDescription"
              onChange={(e) => setdentDescription(e.target.value)}
              variant="outlined"
              multiline
              value={dentDescription}
            />
          </Box>

          {/* Upload Section */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Upload Image
            </Typography>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                handleFileChange(e); // Display the image
                handleFileUpload(e); // Add your upload logic
              }}
            />
          </Box>

          {/* Display Uploaded Image */}
          {dentuploadedImage && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Uploaded Image
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box
                    component="img"
                    src={dentuploadedImage}
                    alt="Uploaded Dent"
                    sx={{
                      width: "100%",
                      height: "auto",
                      borderRadius: 2,
                      border: "1px solid #ddd",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Action Buttons */}
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}
          >
            <Button variant="contained" color="secondary" onClick={removeDent}>
              Remove
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={saveDentDescription}
            >
              Save
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog open={open} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleCloseModal}
            aria-label="close"
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
          View Image
        </DialogTitle>
        <DialogContent>
          <Typography>Click To Highlight Dents</Typography>
          {selectedImage && (
            <div className="image-container" onClick={HandleDent}>
              <img
                src={watermarkedImage ? watermarkedImage : selectedImage}
                alt="Large Preview"
                className="processed-image"
              />
              {dents.map((dent: dentDescription) => (
                <div
                  key={dent.id}
                  className="dent"
                  style={{
                    position: "absolute",
                    top: `${dent.y}%`,
                    left: `${dent.x}%`,
                    zIndex: 10, // Dents in front of the image
                  }}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent click event from propagating to the image
                    editHandleDent(dent);
                  }}
                >
                  <span className="dent-text">!</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={satisfiedopen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            overflow: "hidden", // Prevent overflow inside the dialog paper
            maxHeight: "80vh", // Limit the height of the dialog
            padding: 4,
          },
        }}
      >
        <DialogTitle>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleCloseModal}
            aria-label="close"
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
          Are you sure You Are Satisfied With The Result ?
        </DialogTitle>

        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              handleSubmitToCloud().then((res) => {
                setIsSatisfied(true);
              });
            }}
            disabled={isuploading}
          >
            Yes Submit to Cloud
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleDownloadImages}
            disabled={isuploading}
          >
            Bulk Download Images
          </Button>
          <Button onClick={handleCloseModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Add New Vehicle
      </Typography>

      {/* Vehicle Details Form */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Vehicle Name"
              name="name"
              value={vehicleDetails.name}
              onChange={handleInputChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Model"
              name="model"
              value={vehicleDetails.model}
              onChange={handleInputChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Registration Number"
              name="registrationNumber"
              value={vehicleDetails.registrationNumber}
              onChange={handleInputChange}
              variant="outlined"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Image Upload Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Upload Images
        </Typography>
        <Button variant="contained" component="label">
          Upload Images
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleImageUpload}
          />
        </Button>
        <Typography variant="body2" sx={{ mt: 1 }}>
          You can upload up to 50 images.
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            mt: 3,
          }}
        >
          {images.map((image, index) => (
            <Box
              key={index}
              sx={{
                width: 120,
                height: 120,
                position: "relative",
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: 1,
              }}
              onClick={handleImageClick.bind(null, image)}
            >
              <img
                src={URL.createObjectURL(image)}
                alt={`Preview ${index}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Processed Images Section */}
      {/* {images.length > 0 && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Remove Background
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRemoveBackground}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Removing Background...
              </>
            ) : (
              "Remove Background"
            )}
          </Button>
        </Paper>
      )} */}

      {/* {processedImages.length > 0 && !isProcessing && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Processed Images
          </Typography>
          <Typography component={"p"} sx={{ mb: 2 }}>
            *Click On Individual Image To Inspect
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            {processedImages.map((image, index) => (
              <Box
                key={index}
                sx={{
                  width: 120,
                  height: 120,
                  position: "relative",
                  borderRadius: 2,
                  overflow: "hidden",
                  boxShadow: 1,
                  display: "inline-block",
                  border: "1px solid #ccc",
                }}
                onClick={() => handleImageClick(image)}
              >
                <img
                  src={image}
                  alt={`Processed Preview ${index}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>
            ))}
          </Box>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Apply New Background
          </Typography>
          {processedImages.length > 0 && !isProcessing && (
            <Box sx={{ mt: 4 }}>
              <Typography component={"p"} sx={{ mb: 2 }}>
                *Select Image Below To Apply Background To All Images.
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                {backgroundImages.map((image, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 120,
                      height: 120,
                      position: "relative",
                      borderRadius: 2,
                      overflow: "hidden",
                      boxShadow: 1,
                    }}
                    // onClick={() => handleImageClick(image)}
                    onClick={() => {
                      setSelectedBackground(image);
                      setchangeBulkImagesBg(true);
                    }}
                  >
                    <img
                      src={image}
                      alt={`Processed Preview ${index}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                ))}
              </Box>

              <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    undoBulkImagesBackgroundChanges();
                  }}
                >
                  Undo Backgound Changes
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      )} */}
      <Box sx={{ my: 3, display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={setsatisfiedOpen.bind(null, true)}
        >
          Proceed
        </Button>
      </Box>
      {/* {processedImages.length > 0 && (
        <Button
          variant="contained"
          color="info"
          onClick={() => {
            setthree60viewopen(true);
          }}
          className="my-2"
        >
          Show 360 View
        </Button>
      )} */}
    </Box>
  );
}
