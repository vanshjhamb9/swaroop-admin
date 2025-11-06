"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Container,
  Snackbar,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { ref } from "firebase/storage";
import { toast } from "react-toastify";
import { FirebaseError } from "firebase/app";
import { useRouter } from "next/navigation";

const Alert = MuiAlert;

const CreateDealersAccount = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contactDetails, setContactDetails] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const router = useRouter();
  // Form submit handler

  // const handleSubmit = async (e: any) => {
  //   e.preventDefault();
  //   setisloading(true);
  //   try {
  //     const token = await auth?.currentUser?.getIdToken();

  //     const res = await fetch("/api/createAdmin", {
  //       body: JSON.stringify({ email: adminCredentials.email, isAdmin: true }),
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`, // Include token in Authorization header
  //       },
  //     });
  //     if (!res.ok) throw await res.json();
  //     const body = await res.json();

  //     toast.success(body.message);
  //   } catch (e: any) {
  //     console.log("Error", e);
  //     toast.error(e.message);
  //   } finally {
  //     setisloading(false);
  //   }
  // };

  const handleSubmit = async () => {
    const id = toast.loading("Creating Account");
    try {
      if (name && email && password && contactDetails) {
        const token = await auth?.currentUser?.getIdToken();

        const res = await fetch("/api/createDealerAdmin", {
          body: JSON.stringify({
            email,
            password,
            contactDetails,
            name,
            isAdmin: true,
          }),
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include token in Authorization header
          },
        });
        if (!res.ok) throw await res.json();
        const body = await res.json();
        toast.update(id, {
          render: "Created Car Dealer Account",
          isLoading: false,
          closeButton: true,
          autoClose: 5000,
          type: "success",
        });
        // router.back();
      }
    } catch (e: any) {
      console.log("e", e.message);
      toast.update(id, {
        render: e.message,
        isLoading: false,
        closeButton: true,
        autoClose: 5000,
        type: "error",
      });
    }

    // setOpenSnackbar(true);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ padding: 3 }}>
        <Typography variant="h5" gutterBottom>
          Create an Account
        </Typography>
        <form>
          {/* Name Input */}
          <TextField
            label="Full Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            required
          />

          {/* Email Input */}
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />

          {/* Password Input */}
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />

          {/* Contact Details (Multiline Text) */}
          <TextField
            label="Contact Details"
            multiline
            rows={4}
            fullWidth
            value={contactDetails}
            onChange={(e) => setContactDetails(e.target.value)}
            margin="normal"
            required
          />

          {/* Submit Button */}
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              sx={{ width: "100%" }}
            >
              Create Account
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Snackbar for messages */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          //@ts-ignore
          severity={snackbarSeverity}
          onClose={() => setOpenSnackbar(false)}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreateDealersAccount;
