'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import { getAuth } from 'firebase/auth';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalDealers: number;
    totalRevenue: number;
    transactionCount: number;
  };
  revenueByDate: Array<{ date: string; amount: number }>;
  topUsers: Array<{
    userId: string;
    name: string;
    email: string;
    totalSpent: number;
    transactionCount: number;
  }>;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      const token = await user.getIdToken();
      
      const response = await fetch('/api/analytics/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const result = await response.json();
      setData(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  if (!data) {
    return <Typography>No data available</Typography>;
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Analytics Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" color="text.secondary">
              Total Users
            </Typography>
            <Typography variant="h3">{data.overview.totalUsers}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" color="text.secondary">
              Total Dealers
            </Typography>
            <Typography variant="h3">{data.overview.totalDealers}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" color="text.secondary">
              Total Revenue
            </Typography>
            <Typography variant="h3">₹{data.overview.totalRevenue.toFixed(2)}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" color="text.secondary">
              Transactions
            </Typography>
            <Typography variant="h3">{data.overview.transactionCount}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Revenue by Date
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {data.revenueByDate.map((item) => (
                <Box
                  key={item.date}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 1,
                    borderBottom: '1px solid #eee'
                  }}
                >
                  <Typography>{item.date}</Typography>
                  <Typography fontWeight="bold">₹{item.amount.toFixed(2)}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top 10 Active Users
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {data.topUsers.map((user, index) => (
                <Box
                  key={user.userId}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 1,
                    borderBottom: '1px solid #eee'
                  }}
                >
                  <Box>
                    <Typography fontWeight="bold">
                      {index + 1}. {user.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email} ({user.transactionCount} transactions)
                    </Typography>
                  </Box>
                  <Typography fontWeight="bold" color="primary">
                    ₹{user.totalSpent.toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
