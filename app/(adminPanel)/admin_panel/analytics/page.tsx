'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Skeleton,
  Alert,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Stack,
  Chip,
  Avatar,
  useTheme,
  IconButton,
  Fade
} from '@mui/material';
import {
  Group as GroupIcon,
  Store as StoreIcon,
  CurrencyRupee as RupeeIcon,
  ReceiptLong as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  FilterList as FilterIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { getAuth } from 'firebase/auth';
import { subDays, format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';

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

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsPage() {
  const theme = useTheme();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  const fetchAnalytics = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('Not authenticated');
    }

    const token = await user.getIdToken();

    const params = new URLSearchParams();
    if (dateRange !== 'all') {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const startDate = subDays(new Date(), days);
      params.append('startDate', startDate.toISOString());
    }
    if (customStartDate) {
      params.append('startDate', new Date(customStartDate).toISOString());
    }
    if (customEndDate) {
      params.append('endDate', new Date(customEndDate).toISOString());
    }

    const response = await fetch(`/api/analytics/stats?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch analytics');
    }

    const result = await response.json();

    if (result.success) {
      return result.data as AnalyticsData;
    } else {
      throw new Error(result.error || 'Failed to fetch analytics');
    }
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['analytics', dateRange, customStartDate, customEndDate],
    queryFn: fetchAnalytics,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1
  });

  const handleCustomDateFilter = () => {
    if (customStartDate && customEndDate) {
      refetch();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Prepare chart data
  const revenueChartData = data?.revenueByDate
    .slice(0, 30)
    .map((item) => ({
      date: format(new Date(item.date), 'MMM dd'),
      revenue: item.amount,
    }))
    .reverse() || [];

  const topUsersChartData = data?.topUsers.slice(0, 5).map((user) => ({
    name: user.name || user.email || 'Unknown',
    value: user.totalSpent,
  })) || [];

  const StatCard = ({ title, value, icon, color, trend }: any) => (
    <Card 
      sx={{ 
        height: '100%', 
        position: 'relative', 
        overflow: 'visible',
        borderRadius: 4,
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px 0 rgba(0,0,0,0.1)'
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box 
              sx={{ 
                p: 1.5, 
                borderRadius: 3, 
                bgcolor: `${color}15`, 
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {icon}
            </Box>
            {trend && (
              <Chip 
                icon={<TrendingUpIcon sx={{ fontSize: '1rem !important' }} />} 
                label={trend} 
                size="small" 
                color="success" 
                sx={{ bgcolor: 'success.light', color: 'success.dark', fontWeight: 600 }} 
              />
            )}
          </Stack>
          <Box>
            <Typography variant="h4" fontWeight="800" sx={{ mb: 0.5 }}>
              {isLoading ? <Skeleton width={100} /> : value}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight="500">
              {title}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ 
      p: { xs: 2, md: 4 }, 
      bgcolor: '#f8fafc', 
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)'
    }}>
      <Fade in={true}>
        <Box>
          {/* Header */}
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'start', md: 'center' }} mb={4} gap={2}>
            <Box>
              <Typography variant="h4" fontWeight="800" color="text.primary" gutterBottom>
                Analytics Overview
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Monitor your business performance and growth
              </Typography>
            </Box>
            
            <Paper 
              elevation={0} 
              sx={{ 
                p: 1, 
                borderRadius: 3, 
                bgcolor: 'white', 
                border: '1px solid', 
                borderColor: 'divider',
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                alignItems: 'center'
              }}
            >
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  displayEmpty
                  variant="standard"
                  disableUnderline
                  sx={{ px: 2, py: 0.5, fontWeight: 600 }}
                  IconComponent={FilterIcon}
                >
                  <MenuItem value="7d">Last 7 Days</MenuItem>
                  <MenuItem value="30d">Last 30 Days</MenuItem>
                  <MenuItem value="90d">Last 90 Days</MenuItem>
                  <MenuItem value="all">All Time</MenuItem>
                </Select>
              </FormControl>
              
              <Box sx={{ width: '1px', height: 24, bgcolor: 'divider' }} />
              
              <Box display="flex" gap={1} alignItems="center">
                <TextField
                  size="small"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  variant="standard"
                  InputProps={{ disableUnderline: true }}
                  sx={{ width: 130 }}
                />
                <Typography color="text.secondary">-</Typography>
                <TextField
                  size="small"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  variant="standard"
                  InputProps={{ disableUnderline: true }}
                  sx={{ width: 130 }}
                />
                {(customStartDate || customEndDate) && (
                  <IconButton size="small" onClick={handleCustomDateFilter} color="primary">
                    <DateRangeIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </Paper>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
              {(error as Error).message}
            </Alert>
          )}

          {/* Stats Grid */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Users"
                value={data?.overview.totalUsers}
                icon={<GroupIcon />}
                color="#6366f1"
                trend="+12%"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Active Dealers"
                value={data?.overview.totalDealers}
                icon={<StoreIcon />}
                color="#10b981"
                trend="+5%"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Revenue"
                value={data ? formatCurrency(data.overview.totalRevenue) : ''}
                icon={<RupeeIcon />}
                color="#f59e0b"
                trend="+24%"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Transactions"
                value={data?.overview.transactionCount}
                icon={<ReceiptIcon />}
                color="#ef4444"
              />
            </Grid>
          </Grid>

          {/* Charts Section */}
          <Grid container spacing={3}>
            {/* Revenue Area Chart */}
            <Grid item xs={12} md={8}>
              <Paper 
                sx={{ 
                  p: 3, 
                  borderRadius: 4, 
                  height: '100%',
                  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' 
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                  <Box>
                    <Typography variant="h6" fontWeight="700">Revenue Growth</Typography>
                    <Typography variant="body2" color="text.secondary">Monthly income overview</Typography>
                  </Box>
                  <Chip label="Income" color="primary" size="small" variant="soft" />
                </Stack>
                
                <Box height={350}>
                  {isLoading ? (
                    <Skeleton variant="rectangular" height="100%" sx={{ borderRadius: 2 }} />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#64748b', fontSize: 12 }} 
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#64748b', fontSize: 12 }} 
                          tickFormatter={(value) => `₹${value/1000}k`}
                        />
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          formatter={(value: any) => [formatCurrency(value), 'Revenue']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#6366f1" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorRevenue)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Top Users Pie Chart */}
            <Grid item xs={12} md={4}>
              <Paper 
                sx={{ 
                  p: 3, 
                  borderRadius: 4, 
                  height: '100%',
                  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' 
                }}
              >
                <Typography variant="h6" fontWeight="700" gutterBottom>Top Spenders</Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>Highest contributing users</Typography>
                
                <Box height={300} display="flex" justifyContent="center">
                  {isLoading ? (
                    <Skeleton variant="circular" width={250} height={250} />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={topUsersChartData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {topUsersChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value: any) => formatCurrency(value)}
                          contentStyle={{ borderRadius: 8 }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Top Users List */}
            <Grid item xs={12}>
              <Paper 
                sx={{ 
                  borderRadius: 4, 
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' 
                }}
              >
                <Box p={3} borderBottom="1px solid" borderColor="divider">
                  <Typography variant="h6" fontWeight="700">Top Performing Users</Typography>
                </Box>
                
                <Box sx={{ overflowX: 'auto' }}>
                  {isLoading ? (
                    <Stack spacing={2} p={3}>
                      {[1,2,3].map(i => <Skeleton key={i} height={50} />)}
                    </Stack>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ backgroundColor: '#f8fafc' }}>
                        <tr>
                          <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>User</th>
                          <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Email</th>
                          <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Transactions</th>
                          <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Total Spent</th>
                          <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.topUsers.map((user, index) => (
                          <tr key={user.userId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '16px 24px' }}>
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar sx={{ bgcolor: COLORS[index % COLORS.length], width: 32, height: 32, fontSize: 14 }}>
                                  {user.name?.[0]?.toUpperCase() || 'U'}
                                </Avatar>
                                <Typography fontWeight="600" variant="body2">{user.name || 'Unknown User'}</Typography>
                              </Stack>
                            </td>
                            <td style={{ padding: '16px 24px', color: '#64748b' }}>{user.email}</td>
                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                              <Chip label={user.transactionCount} size="small" sx={{ borderRadius: 1.5 }} />
                            </td>
                            <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 600 }}>
                              {formatCurrency(user.totalSpent)}
                            </td>
                            <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                              <Chip 
                                label="Active" 
                                color="success" 
                                size="small" 
                                variant="soft"
                                sx={{ borderRadius: 1.5, bgcolor: '#dcfce7', color: '#166534' }} 
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </Box>
  );
}