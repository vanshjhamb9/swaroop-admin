"use client";
import React, { useEffect, useState } from "react";
import {
  TableContainer,
  TableRow,
  TableCell,
  Button,
  Table,
  TableHead,
  TableBody,
  Paper,
  CircularProgress,
  Box,
  Typography,
  Alert,
} from "@mui/material";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import useOwnersStore from "@/store/dealersPanel/OwnersInfo";

function AllDealersTable() {
  const [dealers, setdealers] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { setinfo } = useOwnersStore();
  
  const fetchdealers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        setError('Not authenticated');
        return;
      }

      const token = await user.getIdToken();
      
      const response = await fetch('/api/dealers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dealers');
      }

      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        setdealers(result.data);
      } else {
        setdealers([]);
      }
    } catch (e: any) {
      console.error("Error fetching dealers:", e);
      setError("Failed to fetch dealers");
      toast.error("Couldn't fetch dealers");
      setdealers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchdealers();
  }, []);

  const router = useRouter();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (dealers.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          No dealers found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Create your first dealer account to get started
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Details</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dealers.map((dealer: any) => (
            <TableRow key={dealer.id}>
              <TableCell>{dealer.name}</TableCell>
              <TableCell>{dealer.email}</TableCell>
              <TableCell>{dealer.contactDetails}</TableCell>
              <TableCell>
                <Button
                  variant="text"
                  color="primary"
                  onClick={() => {
                    setinfo({
                      uid: dealer.id,
                      email: dealer.email,
                      name: dealer.name,
                      contactDetails: dealer.contactDetails,
                      vehicles: dealer.vehicles,
                    });
                    router.push("/admin_panel/manage_dealers/View_dealer");
                  }}
                >
                  View
                </Button>
                <Button variant="text" color="error">
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default AllDealersTable;
