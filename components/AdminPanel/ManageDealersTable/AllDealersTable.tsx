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

  // Pagination State
  const [page, setPage] = useState(0);
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const ITEMS_PER_PAGE = 10;

  const fetchdealers = async (cursor: string | null = null) => {
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

      let url = `/api/dealers?limit=${ITEMS_PER_PAGE}`;
      if (cursor) {
        url += `&startAfter=${cursor}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dealers');
      }

      const result = await response.json();

      if (result.success) {
        const dealersList = Array.isArray(result.data)
          ? result.data
          : (result.data?.dealers || []);
        setdealers(dealersList);

        // Update pagination
        if (result.data?.lastVisible || result.data?.hasMore) {
          // If API returns lastVisible, use it. If not explicitly, checks hasMore.
          // Since we added lastVisible to API, we rely on it or the list length.
          setHasNextPage(!!result.data.lastVisible || (dealersList.length === ITEMS_PER_PAGE));
        } else {
          setHasNextPage(false);
        }
      } else {
        setdealers([]);
        setHasNextPage(false);
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

  const handlePageChange = (direction: 'next' | 'prev') => {
    if (direction === 'next' && hasNextPage) {
      // Use the last dealer's ID as the cursor
      // Note: Make sure 'id' exists on the dealer object. API returns { id: doc.id, ...data }
      const lastDealer = dealers[dealers.length - 1];
      if (lastDealer?.id) {
        const newStack = [...cursorStack, lastDealer.id];
        setCursorStack(newStack);
        setPage(page + 1);
        fetchdealers(lastDealer.id);
      }
    } else if (direction === 'prev' && page > 0) {
      const newStack = [...cursorStack];
      newStack.pop();
      const prevCursor = newStack[newStack.length - 1];
      setCursorStack(newStack);
      setPage(page - 1);
      fetchdealers(prevCursor);
    }
  };

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

  if (dealers.length === 0 && page === 0) {
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
    <>
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

      {/* Pagination Controls */}
      <Box display="flex" justifyContent="center" alignItems="center" mt={3} gap={2}>
        <Button
          disabled={page === 0}
          onClick={() => handlePageChange('prev')}
          variant="outlined"
          size="small"
        >
          Previous
        </Button>
        <Typography variant="body2" color="text.secondary">
          Page {page + 1}
        </Typography>
        <Button
          disabled={!hasNextPage}
          onClick={() => handlePageChange('next')}
          variant="outlined"
          size="small"
        >
          Next
        </Button>
      </Box>
    </>
  );
}

export default AllDealersTable;
