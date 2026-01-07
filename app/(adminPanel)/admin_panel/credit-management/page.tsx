'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tab,
  Tabs,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';

interface CreditConfig {
  singleImage: number;
  multipleImages: number;
  video: number;
}

interface DealerCredit {
  dealerId: string;
  name: string;
  email: string;
  creditBalance: number;
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    description: string;
    timestamp: string;
  }>;
}

export default function CreditManagementPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Credit Configuration
  const [creditConfig, setCreditConfig] = useState<CreditConfig>({
    singleImage: 10,
    multipleImages: 8,
    video: 50,
  });
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [configLoading, setConfigLoading] = useState(false);
  
  // Dealer Credits
  const [dealers, setDealers] = useState<DealerCredit[]>([]);
  const [dealersLoading, setDealersLoading] = useState(false);
  
  // Manual Credit Addition
  const [addCreditDialogOpen, setAddCreditDialogOpen] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState<string>('');
  const [creditAmount, setCreditAmount] = useState<string>('');
  const [creditDescription, setCreditDescription] = useState<string>('');
  const [addCreditLoading, setAddCreditLoading] = useState(false);

  useEffect(() => {
    fetchCreditConfig();
    fetchDealerCredits();
  }, []);

  const fetchCreditConfig = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch('/api/config/manage', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.creditRates) {
          setCreditConfig({
            singleImage: result.data.creditRates.singleImage?.credits || 10,
            multipleImages: result.data.creditRates.multipleImages?.creditsPerImage || 8,
            video: result.data.creditRates.video?.credits || 50,
          });
        }
      }
    } catch (err) {
      console.error('Error fetching credit config:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDealerCredits = async () => {
    try {
      setDealersLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch('/api/admin/dealer-credits', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setDealers(result.data.dealers || []);
        }
      }
    } catch (err) {
      console.error('Error fetching dealer credits:', err);
      toast.error('Failed to fetch dealer credits');
    } finally {
      setDealersLoading(false);
    }
  };

  const handleUpdateConfig = async () => {
    try {
      setConfigLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      
      // Get current config first
      const getResponse = await fetch('/api/config/manage', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!getResponse.ok) throw new Error('Failed to fetch current config');
      
      const currentConfig = await getResponse.json();
      
      // Update credit rates
      const updatedConfig = {
        ...currentConfig.data,
        creditRates: {
          ...currentConfig.data.creditRates,
          singleImage: {
            ...currentConfig.data.creditRates.singleImage,
            credits: Number(creditConfig.singleImage),
          },
          multipleImages: {
            ...currentConfig.data.creditRates.multipleImages,
            creditsPerImage: Number(creditConfig.multipleImages),
          },
          video: {
            credits: Number(creditConfig.video),
            description: 'Video processing',
          },
        },
      };
      
      // Ensure video is included even if it didn't exist before
      if (!currentConfig.data.creditRates.video) {
        updatedConfig.creditRates.video = {
          credits: Number(creditConfig.video),
          description: 'Video processing',
        };
      }

      const updateResponse = await fetch('/api/config/manage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedConfig),
      });

      if (updateResponse.ok) {
        toast.success('Credit configuration updated successfully');
        setConfigDialogOpen(false);
      } else {
        throw new Error('Failed to update configuration');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update configuration');
    } finally {
      setConfigLoading(false);
    }
  };

  const handleAddCredit = async () => {
    if (!selectedDealer || !creditAmount || Number(creditAmount) <= 0) {
      toast.error('Please select a dealer and enter a valid amount');
      return;
    }

    try {
      setAddCreditLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch('/api/credit/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedDealer,
          amount: Number(creditAmount),
          description: creditDescription || 'Manual credit addition by admin',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success(`Added ${creditAmount} credits successfully`);
          setAddCreditDialogOpen(false);
          setSelectedDealer('');
          setCreditAmount('');
          setCreditDescription('');
          fetchDealerCredits();
        } else {
          throw new Error(result.error || 'Failed to add credits');
        }
      } else {
        throw new Error('Failed to add credits');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to add credits');
    } finally {
      setAddCreditLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Credit Management
        </Typography>
      </Box>

      <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="Credit Rates" />
        <Tab label="Dealer Credits" />
      </Tabs>

      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Credit Rates Configuration</Typography>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setConfigDialogOpen(true)}
                  >
                    Edit
                  </Button>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Single Image:</strong> {creditConfig.singleImage} credits
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Multiple Images (per image):</strong> {creditConfig.multipleImages} credits
                  </Typography>
                  <Typography variant="body1">
                    <strong>Video Processing:</strong> {creditConfig.video} credits
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Box>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddCreditDialogOpen(true)}
            >
              Add Credits Manually
            </Button>
          </Box>

          {dealersLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : dealers.length === 0 ? (
            <Alert severity="info">No dealers found</Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Dealer Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell align="right">Credit Balance</TableCell>
                    <TableCell>Recent Transactions</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dealers.map((dealer) => (
                    <TableRow key={dealer.dealerId}>
                      <TableCell>{dealer.name}</TableCell>
                      <TableCell>{dealer.email}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${dealer.creditBalance} credits`}
                          color={dealer.creditBalance > 0 ? 'success' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>
                        {dealer.recentTransactions.length > 0 ? (
                          <Typography variant="caption">
                            {dealer.recentTransactions[0].type} - {dealer.recentTransactions[0].amount} credits
                            <br />
                            {new Date(dealer.recentTransactions[0].timestamp).toLocaleDateString()}
                          </Typography>
                        ) : (
                          'No transactions'
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => {
                            setSelectedDealer(dealer.dealerId);
                            setAddCreditDialogOpen(true);
                          }}
                        >
                          Add Credits
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Edit Credit Config Dialog */}
      <Dialog open={configDialogOpen} onClose={() => setConfigDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Credit Rates</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Single Image Credits"
            type="number"
            value={creditConfig.singleImage}
            onChange={(e) => setCreditConfig({ ...creditConfig, singleImage: Number(e.target.value) })}
            margin="normal"
            inputProps={{ min: 0 }}
          />
          <TextField
            fullWidth
            label="Multiple Images (per image) Credits"
            type="number"
            value={creditConfig.multipleImages}
            onChange={(e) => setCreditConfig({ ...creditConfig, multipleImages: Number(e.target.value) })}
            margin="normal"
            inputProps={{ min: 0 }}
          />
          <TextField
            fullWidth
            label="Video Processing Credits"
            type="number"
            value={creditConfig.video}
            onChange={(e) => setCreditConfig({ ...creditConfig, video: Number(e.target.value) })}
            margin="normal"
            inputProps={{ min: 0 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateConfig} variant="contained" disabled={configLoading}>
            {configLoading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Credit Dialog */}
      <Dialog open={addCreditDialogOpen} onClose={() => setAddCreditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Credits to Dealer</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Select Dealer"
            value={selectedDealer}
            onChange={(e) => setSelectedDealer(e.target.value)}
            margin="normal"
            SelectProps={{ native: true }}
          >
            <option value="">Select a dealer</option>
            {dealers.map((dealer) => (
              <option key={dealer.dealerId} value={dealer.dealerId}>
                {dealer.name} ({dealer.email}) - Balance: {dealer.creditBalance}
              </option>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Credit Amount"
            type="number"
            value={creditAmount}
            onChange={(e) => setCreditAmount(e.target.value)}
            margin="normal"
            inputProps={{ min: 1 }}
          />
          <TextField
            fullWidth
            label="Description (Optional)"
            value={creditDescription}
            onChange={(e) => setCreditDescription(e.target.value)}
            margin="normal"
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddCreditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddCredit} variant="contained" disabled={addCreditLoading}>
            {addCreditLoading ? <CircularProgress size={24} /> : 'Add Credits'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

