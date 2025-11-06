"use client";
import React, { useEffect, useState, useRef } from "react";
import AWS from "aws-sdk";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase";
import useVehicleStore from "@/store/dealersPanel/Vehiclestore";
import useOwnersStore from "@/store/dealersPanel/OwnersInfo";

const Custom360Viewer = () => {
  const { vehicle } = useVehicleStore();
  const {
    info: { uid },
  } = useOwnersStore();
  const [imageUrls, setImageUrls] = useState<any[]>(vehicle.images || []);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const lastIndexRef = useRef(currentImageIndex);

  //Fetch logic for AWS

  // useEffect(() => {
  //   const params = {
  //     Bucket: "car360",
  //     Prefix: "ring/",
  //   };

  //   s3.listObjectsV2(params, (err, data) => {
  //     if (err) {
  //       console.log("Error fetching images:", err);
  //       setIsLoading(false);
  //     } else {
  //       const urls = data?.Contents?.map((item) =>
  //         s3.getSignedUrl("getObject", {
  //           Bucket: "car360",
  //           Key: item.Key,
  //           Expires: 60 * 5,
  //         })
  //       );
  //       setImageUrls(urls || []);
  //       setIsLoading(false);
  //     }
  //   });
  // }, []);

  // useEffect(() => {
  //   const fetchFirebaseImages = async () => {
  //     try {
  //       setIsLoading(true);
  //       const folderRef = ref(
  //         storage,
  //         `dealersVehicles/${uid}/${vehicle.registration}`
  //       ); // Replace with your folder in Firebase
  //       const result = await listAll(folderRef);
  //       console.log('result',result.items)
  //       const urls = await Promise.all(
  //         result.items.map((item) => getDownloadURL(item))
  //       );
  //       console.log("akks ursls", urls);
  //       // const basePath =
  //       //   "https://firebasestorage.googleapis.com/v0/b/car360-8eee0.firebasestorage.app/o/dummycup%2F";

  //       // const fileNamesWithTokens = urls.map((url) =>
  //       //   url.replace(`${basePath}`, "")
  //       // );
  //       // console.log("File Names with Tokens:", fileNamesWithTokens);

  //       setImageUrls(urls); // Set file names for the viewer
  //     } catch (error) {
  //       console.error("Error fetching images from Firebase Storage:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchFirebaseImages();
  // }, []);
  useEffect(() => {
    if (imageUrls.length > 0) {
      setCurrentImageIndex(0);
    }
  }, [imageUrls]);

  const nextImage = () => {
    if (imageUrls.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length);
    }
  };

  const prevImage = () => {
    if (imageUrls.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? imageUrls.length - 1 : prev - 1
      );
    }
  };

  useEffect(() => {
    //@ts-ignore
    let interval;
    if (isAutoRotating && imageUrls.length > 0) {
      interval = setInterval(() => {
        nextImage();
      }, 200);
    } else {
      clearInterval(interval);
    }
    //@ts-ignore

    return () => clearInterval(interval);
  }, [isAutoRotating, imageUrls.length]);

  const handleMouseDown = (e: any) => {
    setIsDragging(true);
    startX.current = e.clientX || (e as React.TouchEvent).touches[0].clientX;
    e.preventDefault(); // Prevent default drag behavior
  };

  const handleMouseMove = (e: any) => {
    if (!isDragging) return;
    const currentX = e.clientX || (e as React.TouchEvent).touches[0].clientX;
    const deltaX = startX.current - currentX;

    const rotationIndex = Math.floor(deltaX / 10);
    const newIndex =
      (lastIndexRef.current + rotationIndex + imageUrls.length) %
      imageUrls.length;
    console.log("new Index", newIndex);
    if (newIndex !== lastIndexRef.current && newIndex > 0) {
      setCurrentImageIndex(newIndex);
      lastIndexRef.current = newIndex;
      startX.current = currentX;
    }
    e.preventDefault(); // Prevent default drag behavior
  };

  const handleMouseUp = (e: any) => {
    setIsDragging(true);
    startX.current = e.clientX || (e as React.TouchEvent).touches[0].clientX;
  };

  const handleMouseLeave = () => {
    console.log("unsetting");
    setIsDragging(false);
  };
  useEffect(() => {
    const loadImages = async () => {
      console.log("Loading images");
      const loadedImages = await Promise.all(
        imageUrls.map((url) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = url;
          });
        })
      );
      //@ts-ignore
      setLoadedImages(loadedImages);
      setIsLoading(false);
    };

    if (imageUrls.length > 0) {
      loadImages();
    }
  }, [imageUrls]);

  // useEffect(() => {
  //   if (loadedImages.length > 0) {
  //     const interval = setInterval(() => {
  //       setCurrentImageIndex((prev) => (prev + 1) % loadedImages.length);
  //     }, 100);

  //     return () => clearInterval(interval);
  //   }
  // }, [loadedImages, isAutoRotating]);
  console.log("loaded images", loadedImages);
  if (isLoading || loadedImages.length === 0) {
    return <p>Loading 360 Viewer...</p>;
  }
  console.log("is Dragging", isDragging);
  return (
    <div style={{ textAlign: "center" }}>
      {loadedImages.length > 0 && (
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          onTouchCancel={handleMouseLeave}
          onClick={() => {
            console.log("setting up");
            setIsDragging((p) => !p);
          }}
          style={{
            cursor: isDragging ? "grabbing" : "grab",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "0 auto", // Center the viewer horizontally
            width: "100%", // Fixed width
            height: "70vh", // Fixed height
            overflow: "hidden", // Prevent overflow
            border: "1px solid #ccc", // Optional: Add a border
          }}
        >
          <img
            src={imageUrls[currentImageIndex]}
            alt={`360 view - ${currentImageIndex}`}
            style={{
              maxWidth: "100%",
              objectFit: "contain", // Ensures the entire image fits within the container
            }}
          />
        </div>
      )}

      <div style={{ marginTop: "10px" }}>
        <button onClick={prevImage} style={{ marginRight: "10px" }}>
          Previous
        </button>
        <button onClick={nextImage}>Next</button>
      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={() => setIsAutoRotating((prev) => !prev)}>
          {isAutoRotating ? "Stop Auto-Rotation" : "Start Auto-Rotation"}
        </button>
      </div>
    </div>
  );
};

export default Custom360Viewer;
