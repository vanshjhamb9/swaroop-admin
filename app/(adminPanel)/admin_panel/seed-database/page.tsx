'use client';
import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Alert, CircularProgress } from '@mui/material';

export default function SeedDatabasePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSeed = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.details || data.error || 'Failed to seed database');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Seed Test Database
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <strong>Important:</strong> This will create test data in your Firebase database. 
        Make sure you have configured your Firebase Admin credentials in the .env file before proceeding.
      </Alert>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          This will create:
        </Typography>
        <ul>
          <li>1 Super Admin account</li>
          <li>2 Admin accounts</li>
          <li>3 Dealer accounts with 9 total vehicles</li>
          <li>5 Customer accounts with credit history</li>
          <li>Sample payment and transaction records</li>
        </ul>

        <Button
          variant="contained"
          color="primary"
          onClick={handleSeed}
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Seed Database'}
        </Button>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6">Error:</Typography>
          <Typography>{error}</Typography>
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            Make sure your Firebase credentials are properly configured in the .env file.
          </Typography>
        </Alert>
      )}

      {result && result.success && (
        <Paper sx={{ p: 3 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            Database seeded successfully!
          </Alert>

          <Typography variant="h6" gutterBottom>
            Login Credentials:
          </Typography>
          <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography><strong>Super Admin:</strong> {result.credentials?.superAdmin}</Typography>
            <Typography><strong>Admin:</strong> {result.credentials?.admin}</Typography>
            <Typography><strong>Dealer:</strong> {result.credentials?.dealer}</Typography>
            <Typography><strong>Customer:</strong> {result.credentials?.customer}</Typography>
          </Box>

          <Typography variant="h6" gutterBottom>
            Results:
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography>Super Admin: {result.results?.superAdmin?.status}</Typography>
            <Typography>Admins: {result.results?.admins?.length} processed</Typography>
            <Typography>Dealers: {result.results?.dealers?.length} processed</Typography>
            <Typography>Customers: {result.results?.customers?.length} processed</Typography>
          </Box>

          {result.results?.errors && result.results.errors.length > 0 && (
            <>
              <Typography variant="h6" color="error" gutterBottom>
                Errors:
              </Typography>
              <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                {result.results.errors.map((err: string, idx: number) => (
                  <Typography key={idx} variant="body2">
                    {err}
                  </Typography>
                ))}
              </Box>
            </>
          )}
        </Paper>
      )}
    </Box>
  );
}
