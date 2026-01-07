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
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText
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
import { getGSTStateOptions, validateGSTIN } from '@/lib/gst-helper';

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
  const [ccEmails, setCcEmails] = useState('');
  const [paymentLink, setPaymentLink] = useState('');
  
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

  const [gstinError, setGstinError] = useState<string>('');

  const gstStateOptions = getGSTStateOptions();

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

  const handleGSTINChange = (value: string) => {
    const upperValue = value.toUpperCase();
    setCustomerAddress({ ...customerAddress, gstin: upperValue });
    
    if (upperValue && !validateGSTIN(upperValue)) {
      setGstinError('Invalid GSTIN format. Example: 29AAUFJ3424H1ZZ');
    } else {
      setGstinError('');
      // Auto-fill state code from GSTIN
      if (upperValue.length >= 2) {
        const stateCode = upperValue.substring(0, 2);
        setCustomerAddress({ ...customerAddress, gstin: upperValue, gstState: stateCode });
      }
    }
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

    if (customerAddress.gstin && !validateGSTIN(customerAddress.gstin)) {
      toast.error('Please enter a valid GSTIN or leave it empty');
      return;
    }

    if (customerAddress.gstin && !customerAddress.gstState) {
      toast.error('GST State Code is required when GSTIN is provided');
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

      // Prepare address data - only include non-empty fields
      const addressData: any = {
        country: 'IN'
      };

      if (customerAddress.street?.trim()) addressData.street = customerAddress.street.trim();
      if (customerAddress.city?.trim()) addressData.city = customerAddress.city.trim();
      if (customerAddress.pincode?.trim()) addressData.pincode = customerAddress.pincode.trim();
      
      // IMPORTANT: Only include GST fields if GSTIN is provided
      if (customerAddress.gstin?.trim()) {
        addressData.gstin = customerAddress.gstin.trim().toUpperCase();
        addressData.gstState = customerAddress.gstState; // This MUST be the numeric code like "29"
      }

      const requestBody: any = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: addressData,
        invoiceTitle,
        items,
        sendEmail,
        currency: 'INR'
      };

      // Add CC emails if provided
      if (ccEmails.trim()) {
        requestBody.ccEmails = ccEmails.trim();
      }

      // Add payment link if provided
      if (paymentLink.trim()) {
        requestBody.paymentLink = paymentLink.trim();
      }

      console.log('🔍 Sending request:', JSON.stringify(requestBody, null, 2));

      const response = await fetch('/api/invoice/refrens/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
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
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="GSTIN (Optional)"
                    value={customerAddress.gstin}
                    onChange={e => handleGSTINChange(e.target.value)}
                    placeholder="29AAUFJ3424H1ZZ"
                    error={!!gstinError}
                    helperText={gstinError || 'Leave empty for non-GST customers. State code will auto-fill.'}
                  />
                </Grid>
                {customerAddress.gstin && (
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>GST State Code</InputLabel>
                      <Select
                        value={customerAddress.gstState}
                        onChange={e => setCustomerAddress({ ...customerAddress, gstState: e.target.value })}
                        label="GST State Code"
                      >
                        <MenuItem value="">
                          <em>Select State</em>
                        </MenuItem>
                        {gstStateOptions.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>
                        Auto-filled from GSTIN. Verify it matches your state.
                      </FormHelperText>
                    </FormControl>
                  </Grid>
                )}
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
                        inputProps={{ min: 0, step: 0.01 }}
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
                        inputProps={{ min: 0, max: 100, step: 0.01 }}
                      />
                    </Grid>
                    <Grid item xs={4} sm={1}>
                      <Typography variant="body2" fontWeight="bold">
                        ₹{(item.rate * item.quantity * (1 + item.gstRate / 100)).toFixed(2)}
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
                  Total: ₹{calculateTotal().toFixed(2)}
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