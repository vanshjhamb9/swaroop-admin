"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
} from "@mui/material";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "@/firebase";

import { toast } from "react-toastify";
import { FirebaseError } from "firebase/app";
import { useRouter } from "next/navigation";

const Authenticate = () => {
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
    const id = toast.loading("Signing In");
    try {
      if (email && password) {
        // Simulate account creation
        const user = await signInWithEmailAndPassword(auth, email, password);

        toast.update(id, {
          render: "Signed In Successfully",
          isLoading: false,
          closeButton: true,
          autoClose: 5000,
          type: "success",
        });
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
          Log In
        </Typography>
        <form>
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

          {/* Submit Button */}
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              sx={{ width: "100%" }}
            >
              Sign In
            </Button>
          </Box>
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                signOut(auth);
              }}
              sx={{ width: "100%" }}
            >
              Sign Out
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default Authenticate;
