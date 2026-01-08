'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Card,
  CardContent,
  Stack,
  Fade,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Receipt as ReceiptIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { format, subDays } from 'date-fns';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  invoiceDate: string;
  status: 'UNPAID' | 'PAID' | 'PARTIALLY_PAID' | 'CANCELED';
  billedTo: {
    name: string;
    email?: string;
  };
  finalTotal: {
    total: number;
    amount: number;
  };
  share?: {
    link: string;
    pdf: string;
  };
  createdAt: string;
}

interface Analytics {
  totalInvoices: number;
  paidInvoices: number;
  unpaidInvoices: number;
  canceledInvoices: number;
  partiallyPaidInvoices: number;
  totalRevenue: number;
  pendingAmount: number;
  thisMonthInvoices: number;
  thisMonthRevenue: number;
}

export default function InvoicesPage() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<string>('');
  const [editPaymentLink, setEditPaymentLink] = useState<string>('');
  const [editLoading, setEditLoading] = useState(false);

  const fetchInvoices = async () => {
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
      
      let url = `/api/invoice/refrens/list?limit=${rowsPerPage}&skip=${page * rowsPerPage}&sortBy=createdAt&sortOrder=-1`;
      
      if (startDate) {
        url += `&startDate=${startDate}`;
      }
      if (endDate) {
        url += `&endDate=${endDate}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }

      const result = await response.json();

      if (result.success) {
        setInvoices(result.data.invoices);
        setTotal(result.data.total);
        setAnalytics(result.data.analytics);
      } else {
        throw new Error(result.error || 'Failed to fetch invoices');
      }
    } catch (err: any) {
      console.error('Error fetching invoices:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dateRange !== 'custom' && dateRange !== 'all') {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const start = format(subDays(new Date(), days), 'yyyy-MM-dd');
      const end = format(new Date(), 'yyyy-MM-dd');
      setStartDate(start);
      setEndDate(end);
    } else if (dateRange === 'all') {
      setStartDate('');
      setEndDate('');
    }
  }, [dateRange]);

  useEffect(() => {
    fetchInvoices();
  }, [page, rowsPerPage, startDate, endDate]);

  const handleCancelInvoice = async () => {
    if (!selectedInvoice) return;

    try {
      setCancelLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        toast.error('Not authenticated');
        return;
      }

      const token = await user.getIdToken();

      const response = await fetch('/api/invoice/refrens/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ invoiceId: selectedInvoice._id })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Invoice canceled successfully');
        setCancelDialogOpen(false);
        setSelectedInvoice(null);
        fetchInvoices();
      } else {
        throw new Error(result.error || 'Failed to cancel invoice');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleOpenEditDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setEditStatus(invoice.status);
    setEditPaymentLink('');
    setEditDialogOpen(true);
  };

  const handleUpdateInvoiceStatus = async () => {
    if (!selectedInvoice) return;

    try {
      setEditLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        toast.error('Not authenticated');
        return;
      }

      const token = await user.getIdToken();

      const response = await fetch('/api/invoice/refrens/update-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          invoiceId: selectedInvoice._id,
          status: editStatus,
          paymentLink: editPaymentLink || undefined
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Invoice status updated successfully');
        setEditDialogOpen(false);
        setSelectedInvoice(null);
        setEditStatus('');
        setEditPaymentLink('');
        fetchInvoices();
      } else {
        throw new Error(result.error || 'Failed to update invoice status');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'UNPAID':
        return 'warning';
      case 'PARTIALLY_PAID':
        return 'info';
      case 'CANCELED':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredInvoices = invoices.filter(
    invoice =>
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.billedTo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.billedTo.email && invoice.billedTo.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading && invoices.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" bgcolor="#f8fafc">
        <CircularProgress size={40} thickness={4} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 2, md: 4 }, 
      bgcolor: '#f8fafc', 
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)'
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="800" color="text.primary" gutterBottom>
            Invoices
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your billing and payments efficiently
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchInvoices} disabled={loading} sx={{ bgcolor: 'white', boxShadow: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={Link}
            href="/admin_panel/invoices/create"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
          >
            Create Invoice
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {analytics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 4, height: '100%', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="overline" color="text.secondary" fontWeight="600">
                      Total Invoices
                    </Typography>
                    <Typography variant="h4" fontWeight="700" sx={{ mt: 1 }}>
                      {analytics.totalInvoices}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1, bgcolor: 'primary.50', borderRadius: 2, color: 'primary.main' }}>
                    <ReceiptIcon />
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1} mt={2}>
                  <Chip size="small" label={`Paid: ${analytics.paidInvoices}`} color="success" variant="soft" />
                  <Chip size="small" label={`Unpaid: ${analytics.unpaidInvoices}`} color="warning" variant="soft" />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 4, height: '100%', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
              <CardContent>
                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight="600">
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" fontWeight="700" color="success.main" sx={{ mt: 1 }}>
                    {formatCurrency(analytics.totalRevenue)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    From {analytics.paidInvoices} paid invoices
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 4, height: '100%', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
              <CardContent>
                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight="600">
                    Pending Amount
                  </Typography>
                  <Typography variant="h4" fontWeight="700" color="warning.main" sx={{ mt: 1 }}>
                    {formatCurrency(analytics.pendingAmount)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    From {analytics.unpaidInvoices} unpaid invoices
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 4, height: '100%', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
              <CardContent>
                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight="600">
                    This Month
                  </Typography>
                  <Typography variant="h4" fontWeight="700" sx={{ mt: 1 }}>
                    {analytics.thisMonthInvoices}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Revenue: {formatCurrency(analytics.thisMonthRevenue)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ 
        borderRadius: 4, 
        overflow: 'hidden', 
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
        border: '1px solid',
        borderColor: 'divider'
      }}>
        <Box p={3} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2, bgcolor: 'background.paper' }
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Range</InputLabel>
                <Select
                  value={dateRange}
                  label="Range"
                  onChange={(e) => setDateRange(e.target.value as any)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="7d">Last 7 Days</MenuItem>
                  <MenuItem value="30d">Last 30 Days</MenuItem>
                  <MenuItem value="90d">Last 90 Days</MenuItem>
                  <MenuItem value="custom">Custom Range</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setDateRange('custom');
                  }}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setDateRange('custom');
                  }}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
              </Stack>
            </Grid>
          </Grid>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Invoice Details</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Customer</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Box py={8} textAlign="center">
                      <ReceiptIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No invoices found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Try adjusting your search or date filters
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map(invoice => (
                  <TableRow 
                    key={invoice._id} 
                    hover 
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="600" color="primary">
                        {invoice.invoiceNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(invoice.invoiceDate)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">{invoice.billedTo.name}</Typography>
                      {invoice.billedTo.email && (
                        <Typography variant="caption" color="text.secondary">
                          {invoice.billedTo.email}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" fontWeight="700">
                        {formatCurrency(invoice.finalTotal?.total || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={invoice.status.replace('_', ' ')} 
                        color={getStatusColor(invoice.status) as any} 
                        size="small" 
                        sx={{ fontWeight: 600, borderRadius: 1.5 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        {invoice.share?.link && (
                          <Tooltip title="View Invoice">
                            <IconButton
                              size="small"
                              onClick={() => window.open(invoice.share?.link, '_blank')}
                              sx={{ bgcolor: 'action.hover' }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {invoice.share?.pdf && (
                          <Tooltip title="Download PDF">
                            <IconButton
                              size="small"
                              onClick={() => window.open(invoice.share?.pdf, '_blank')}
                              sx={{ bgcolor: 'action.hover' }}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Edit Status">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenEditDialog(invoice)}
                            sx={{ bgcolor: 'primary.50' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {invoice.status !== 'CANCELED' && invoice.status !== 'PAID' && (
                          <Tooltip title="Cancel">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setCancelDialogOpen(true);
                              }}
                              sx={{ bgcolor: 'error.50' }}
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={e => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50, 100]}
            sx={{ borderTop: '1px solid', borderColor: 'divider' }}
          />
        </TableContainer>
      </Paper>

      {/* Dialogs remain unchanged */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Invoice</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel invoice{' '}
            <strong>{selectedInvoice?.invoiceNumber}</strong>?
          </Typography>
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} disabled={cancelLoading}>
            No, Keep It
          </Button>
          <Button
            onClick={handleCancelInvoice}
            color="error"
            variant="contained"
            disabled={cancelLoading}
          >
            {cancelLoading ? <CircularProgress size={24} /> : 'Yes, Cancel Invoice'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Invoice Payment Status</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Invoice: <strong>{selectedInvoice?.invoiceNumber}</strong>
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Payment Status</InputLabel>
            <Select
              value={editStatus}
              label="Payment Status"
              onChange={(e) => setEditStatus(e.target.value)}
            >
              <MenuItem value="UNPAID">Unpaid</MenuItem>
              <MenuItem value="PAID">Paid</MenuItem>
              <MenuItem value="PARTIALLY_PAID">Partially Paid</MenuItem>
              <MenuItem value="CANCELED">Canceled</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Payment Link (Optional)"
            value={editPaymentLink}
            onChange={(e) => setEditPaymentLink(e.target.value)}
            margin="normal"
            placeholder="https://payment.example.com/pay/..."
            helperText="Update payment gateway link for this invoice"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} disabled={editLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateInvoiceStatus}
            variant="contained"
            disabled={editLoading}
          >
            {editLoading ? <CircularProgress size={24} /> : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
