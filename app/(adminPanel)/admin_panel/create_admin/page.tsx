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

const CreateAdmin = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();
  const [isLoading, setisloading] = useState<boolean>(false);
  // Form submit handler

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const id = toast.loading("Creating Account");

    try {
      // const user = await createUserWithEmailAndPassword(auth, email, password);
      // await setDoc(doc(db, "admins", user.user.uid), {
      //   name,
      //   email,
      //   createdAt: serverTimestamp(),
      // });
      const token = await auth?.currentUser?.getIdToken();

      const res = await fetch("/api/createAdmin", {
        body: JSON.stringify({ email, isAdmin: true, name, password }),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include token in Authorization header
        },
      });
      if (!res.ok) throw await res.json();
      const body = await res.json();

      toast.update(id, {
        render: "Created Admin Successfully",
        isLoading: false,
        closeButton: true,
        autoClose: 5000,
        type: "success",
      });
    } catch (e: any) {
      console.log("Error", e);
      toast.update(id, {
        render: e.message,
        isLoading: false,
        closeButton: true,
        autoClose: 5000,
        type: "error",
      });
    } finally {
      setisloading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ padding: 3 }}>
        <Typography variant="h5" gutterBottom>
          Create New Admin
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

          {/* Submit Button */}
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              sx={{ width: "100%" }}
            >
              Create Admin
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateAdmin;
