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
  InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';
import Link from 'next/link';

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

      const response = await fetch(
        `/api/invoice/refrens/list?limit=${rowsPerPage}&skip=${page * rowsPerPage}&sortBy=createdAt&sortOrder=-1`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

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
    fetchInvoices();
  }, [page, rowsPerPage]);

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
      currency: 'INR'
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Invoice Management</Typography>
        <Box>
          <IconButton onClick={fetchInvoices} disabled={loading}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={Link}
            href="/admin_panel/invoices/create"
            sx={{ ml: 1 }}
          >
            Create Invoice
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {analytics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                Total Invoices
              </Typography>
              <Typography variant="h3">{analytics.totalInvoices}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#e8f5e9' }}>
              <Typography variant="h6" color="text.secondary">
                Total Revenue
              </Typography>
              <Typography variant="h4" color="success.main">
                {formatCurrency(analytics.totalRevenue)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#fff3e0' }}>
              <Typography variant="h6" color="text.secondary">
                Pending Amount
              </Typography>
              <Typography variant="h4" color="warning.main">
                {formatCurrency(analytics.pendingAmount)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                This Month
              </Typography>
              <Typography variant="h4">{analytics.thisMonthInvoices}</Typography>
              <Typography variant="caption" color="text.secondary">
                {formatCurrency(analytics.thisMonthRevenue)} revenue
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {analytics && (
          <>
            <Grid item>
              <Chip label={`Paid: ${analytics.paidInvoices}`} color="success" variant="outlined" />
            </Grid>
            <Grid item>
              <Chip label={`Unpaid: ${analytics.unpaidInvoices}`} color="warning" variant="outlined" />
            </Grid>
            <Grid item>
              <Chip label={`Partially Paid: ${analytics.partiallyPaidInvoices}`} color="info" variant="outlined" />
            </Grid>
            <Grid item>
              <Chip label={`Canceled: ${analytics.canceledInvoices}`} color="error" variant="outlined" />
            </Grid>
          </>
        )}
      </Grid>

      <Paper sx={{ mb: 3 }}>
        <Box p={2}>
          <TextField
            fullWidth
            placeholder="Search by invoice number, customer name or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            size="small"
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell>Invoice #</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary" py={3}>
                      No invoices found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map(invoice => (
                  <TableRow key={invoice._id} hover>
                    <TableCell>
                      <Typography fontWeight="medium">{invoice.invoiceNumber}</Typography>
                    </TableCell>
                    <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                    <TableCell>
                      <Typography>{invoice.billedTo.name}</Typography>
                      {invoice.billedTo.email && (
                        <Typography variant="caption" color="text.secondary">
                          {invoice.billedTo.email}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold">{formatCurrency(invoice.finalTotal?.total || 0)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={invoice.status} color={getStatusColor(invoice.status) as any} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      {invoice.share?.link && (
                        <Tooltip title="View Invoice">
                          <IconButton
                            size="small"
                            onClick={() => window.open(invoice.share?.link, '_blank')}
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
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {invoice.share?.link && (
                        <Tooltip title="Copy Share Link">
                          <IconButton
                            size="small"
                            onClick={() => {
                              navigator.clipboard.writeText(invoice.share?.link || '');
                              toast.success('Link copied to clipboard');
                            }}
                          >
                            <ShareIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Edit Payment Status">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenEditDialog(invoice)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {invoice.status !== 'CANCELED' && invoice.status !== 'PAID' && (
                        <Tooltip title="Cancel Invoice">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setCancelDialogOpen(true);
                            }}
                          >
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

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
        />
      </Paper>

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
