'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  IconButton,
  CircularProgress,
  Alert,
  FormControlLabel,
  Switch,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface InvoiceItem {
  name: string;
  rate: number;
  quantity: number;
  gstRate: number;
}

interface CustomerAddress {
  street: string;
  city: string;
  pincode: string;
  gstState: string;
  gstin: string;
  country: string;
}

export default function CreateInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendEmail, setSendEmail] = useState(true);

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [invoiceTitle, setInvoiceTitle] = useState('Tax Invoice');
  
  const [customerAddress, setCustomerAddress] = useState<CustomerAddress>({
    street: '',
    city: '',
    pincode: '',
    gstState: '',
    gstin: '',
    country: 'IN'
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { name: '', rate: 0, quantity: 1, gstRate: 18 }
  ]);

  const addItem = () => {
    setItems([...items, { name: '', rate: 0, quantity: 1, gstRate: 18 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const subtotal = item.rate * item.quantity;
      const tax = (subtotal * item.gstRate) / 100;
      return total + subtotal + tax;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }

    if (items.some(item => !item.name.trim() || item.rate <= 0)) {
      toast.error('All items must have a name and valid rate');
      return;
    }

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

      const response = await fetch('/api/invoice/refrens/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          customerAddress,
          invoiceTitle,
          items,
          sendEmail,
          currency: 'INR'
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Invoice ${result.data.invoiceNumber} created successfully!`);
        router.push('/admin_panel/invoices');
      } else {
        throw new Error(result.error || 'Failed to create invoice');
      }
    } catch (err: any) {
      console.error('Error creating invoice:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton component={Link} href="/admin_panel/invoices" sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">Create New Invoice</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Customer Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Customer Name"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Street Address"
                    value={customerAddress.street}
                    onChange={e => setCustomerAddress({ ...customerAddress, street: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    value={customerAddress.city}
                    onChange={e => setCustomerAddress({ ...customerAddress, city: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Pincode"
                    value={customerAddress.pincode}
                    onChange={e => setCustomerAddress({ ...customerAddress, pincode: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="GST State Code"
                    value={customerAddress.gstState}
                    onChange={e => setCustomerAddress({ ...customerAddress, gstState: e.target.value })}
                    placeholder="e.g., 29 for Karnataka"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="GSTIN"
                    value={customerAddress.gstin}
                    onChange={e => setCustomerAddress({ ...customerAddress, gstin: e.target.value })}
                    placeholder="GST Identification Number"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Invoice Settings
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Invoice Title"
                    value={invoiceTitle}
                    onChange={e => setInvoiceTitle(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={sendEmail}
                        onChange={e => setSendEmail(e.target.checked)}
                      />
                    }
                    label="Send invoice email to customer"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Line Items</Typography>
                <Button startIcon={<AddIcon />} onClick={addItem} variant="outlined" size="small">
                  Add Item
                </Button>
              </Box>

              {items.map((item, index) => (
                <Box key={index} mb={2}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Item Name"
                        value={item.name}
                        onChange={e => updateItem(index, 'name', e.target.value)}
                        required
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <TextField
                        fullWidth
                        label="Rate"
                        type="number"
                        value={item.rate}
                        onChange={e => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                        required
                        size="small"
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <TextField
                        fullWidth
                        label="Quantity"
                        type="number"
                        value={item.quantity}
                        onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        required
                        size="small"
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <TextField
                        fullWidth
                        label="GST %"
                        type="number"
                        value={item.gstRate}
                        onChange={e => updateItem(index, 'gstRate', parseFloat(e.target.value) || 0)}
                        size="small"
                        inputProps={{ min: 0, max: 100 }}
                      />
                    </Grid>
                    <Grid item xs={4} sm={1}>
                      <Typography variant="body2" fontWeight="bold">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(
                          item.rate * item.quantity * (1 + item.gstRate / 100)
                        )}
                      </Typography>
                    </Grid>
                    <Grid item xs={2} sm={1}>
                      <IconButton
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="flex-end">
                <Typography variant="h5">
                  Total:{' '}
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(
                    calculateTotal()
                  )}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button
                variant="outlined"
                component={Link}
                href="/admin_panel/invoices"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Creating...' : 'Create Invoice'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
