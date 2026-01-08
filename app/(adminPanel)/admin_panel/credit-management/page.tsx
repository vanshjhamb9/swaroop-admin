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
  Fade,
  Stack,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  CreditCard as CreditCardIcon,
  AddCircle as AddCircleIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon
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

  // Pagination State
  const [page, setPage] = useState(0);
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]); // Stack to store cursors for previous pages
  const [hasNextPage, setHasNextPage] = useState(false);
  const ITEMS_PER_PAGE = 10;

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

  const fetchDealerCredits = async (cursor: string | null = null) => {
    try {
      setDealersLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      let url = `/api/admin/dealer-credits?limit=${ITEMS_PER_PAGE}`;
      if (cursor) {
        url += `&startAfter=${cursor}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setDealers(result.data.dealers || []);

          // Update pagination state
          if (result.data.lastVisible) {
            setHasNextPage(true);
            // Only add to stack if moving forward (we handle stack in handlePageChange for prev)
          } else {
            setHasNextPage(false);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching dealer credits:', err);
      toast.error('Failed to fetch dealer credits');
    } finally {
      setDealersLoading(false);
    }
  };

  const handlePageChange = (direction: 'next' | 'prev') => {
    if (direction === 'next' && hasNextPage) {
      const currentLastDealer = dealers[dealers.length - 1];
      const nextCursor = currentLastDealer ? (currentLastDealer as any).dealerId : null; // Using dealerId assuming it matches doc ID used in API

      // We need the ACTUAL doc ID for cursor, API returns `dealerId` which is correct, 
      // but API `startAfter` logic relies on the last doc seen.
      // NOTE: The API returns `lastVisible` which is the ID we should use for next page.
      // But we need to capture it from the response. 
      // My previous fetchDealerCredits didn't store lastVisible. 
      // Let's rely on the dealers list last item ID since we sort by name?
      // Wait, API sorts by name. startAfter needs the SNAPSHOT or the Field Values.
      // If we use just ID, we need to `doc(id).get()` in API.
      // The modified API DOES exactly that: `doc(startAfterId).get()`.
      // So passing the ID of the last dealer in the list is the correct next cursor.

      const newCursor = dealers.length > 0 ? dealers[dealers.length - 1].dealerId : null;

      if (newCursor) {
        const newStack = [...cursorStack, newCursor];
        setCursorStack(newStack);
        setPage(page + 1);
        fetchDealerCredits(newCursor);
      }
    } else if (direction === 'prev' && page > 0) {
      const newStack = [...cursorStack];
      newStack.pop(); // Remove current page cursor
      const prevCursor = newStack[newStack.length - 1];
      setCursorStack(newStack);
      setPage(page - 1);
      fetchDealerCredits(prevCursor);
    }
  };

  const handleUpdateConfig = async () => {
    try {
      setConfigLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      const getResponse = await fetch('/api/config/manage', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!getResponse.ok) throw new Error('Failed to fetch current config');

      const currentConfig = await getResponse.json();

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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" bgcolor="#f8fafc">
        <CircularProgress size={40} thickness={4} />
      </Box>
    );
  }

  const ConfigCard = ({ title, value, icon, subtext }: any) => (
    <Card
      sx={{
        height: '100%',
        borderRadius: 4,
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-2px)' }
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'primary.50',
              color: 'primary.main',
              width: 'fit-content'
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="overline" color="text.secondary" fontWeight="600">
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="700" sx={{ mt: 0.5 }}>
              {value} <Typography component="span" variant="body2" color="text.secondary">credits</Typography>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {subtext}
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
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
              <Typography variant="h4" fontWeight="800" color="text.primary" gutterBottom>
                Credit Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Configure rates and manage dealer balances
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              textColor="primary"
              indicatorColor="primary"
              sx={{ '& .MuiTab-root': { fontWeight: 600, minHeight: 48 } }}
            >
              <Tab icon={<SettingsIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Configuration" />
              <Tab icon={<CreditCardIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Dealer Credits" />
            </Tabs>
          </Box>

          {tabValue === 0 && (
            <Box>
              <Stack direction="row" justifyContent="flex-end" mb={3}>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setConfigDialogOpen(true)}
                  sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
                >
                  Edit Rates
                </Button>
              </Stack>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <ConfigCard
                    title="Single Image"
                    value={creditConfig.singleImage}
                    icon={<ImageIcon />}
                    subtext="Cost per standard image upload"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <ConfigCard
                    title="Multiple Images"
                    value={creditConfig.multipleImages}
                    icon={<ImageIcon />}
                    subtext="Cost per image in batch uploads"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <ConfigCard
                    title="Video Processing"
                    value={creditConfig.video}
                    icon={<VideoIcon />}
                    subtext="Cost per video processed"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {tabValue === 1 && (
            <Box>
              <Stack direction="row" justifyContent="flex-end" mb={3}>
                <Button
                  variant="contained"
                  startIcon={<AddCircleIcon />}
                  onClick={() => setAddCreditDialogOpen(true)}
                  sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
                >
                  Add Credits
                </Button>
              </Stack>

              {dealersLoading ? (
                <Box display="flex" justifyContent="center" p={8}>
                  <CircularProgress />
                </Box>
              ) : dealers.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>No dealers found</Alert>
              ) : (
                <>
                  <Paper sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'grey.50' }}>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Dealer</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Contact</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Balance</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Latest Activity</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary' }}>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dealers.map((dealer) => (
                            <TableRow key={dealer.dealerId} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                              <TableCell>
                                <Typography variant="subtitle2" fontWeight="600">
                                  {dealer.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ID: {dealer.dealerId.substring(0, 8)}...
                                </Typography>
                              </TableCell>
                              <TableCell>{dealer.email}</TableCell>
                              <TableCell align="right">
                                <Chip
                                  label={`${dealer.creditBalance}`}
                                  color={dealer.creditBalance > 100 ? 'success' : dealer.creditBalance > 0 ? 'warning' : 'error'}
                                  size="small"
                                  sx={{ fontWeight: 600, borderRadius: 1.5 }}
                                />
                              </TableCell>
                              <TableCell>
                                {dealer.recentTransactions.length > 0 ? (
                                  <Box>
                                    <Typography variant="caption" fontWeight="600" display="block">
                                      {dealer.recentTransactions[0].type.toUpperCase()} • {dealer.recentTransactions[0].amount}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {new Date(dealer.recentTransactions[0].timestamp).toLocaleDateString()}
                                    </Typography>
                                  </Box>
                                ) : (
                                  <Typography variant="caption" color="text.disabled">
                                    No recent activity
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell align="center">
                                <Tooltip title="Add Credits">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setSelectedDealer(dealer.dealerId);
                                      setAddCreditDialogOpen(true);
                                    }}
                                    sx={{ color: 'primary.main', bgcolor: 'primary.50' }}
                                  >
                                    <AddCircleIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>

                  {/* Pagination Controls */}
                  <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" mt={3}>
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
                  </Stack>
                </>
              )}
            </Box>
          )}

          {/* Dialogs */}
          <Dialog open={configDialogOpen} onClose={() => setConfigDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: 700 }}>Edit Credit Rates</DialogTitle>
            <DialogContent>
              <Stack spacing={2} mt={1}>
                <TextField
                  fullWidth
                  label="Single Image Credits"
                  type="number"
                  value={creditConfig.singleImage}
                  onChange={(e) => setCreditConfig({ ...creditConfig, singleImage: Number(e.target.value) })}
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
                <TextField
                  fullWidth
                  label="Multiple Images (per image)"
                  type="number"
                  value={creditConfig.multipleImages}
                  onChange={(e) => setCreditConfig({ ...creditConfig, multipleImages: Number(e.target.value) })}
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
                <TextField
                  fullWidth
                  label="Video Processing"
                  type="number"
                  value={creditConfig.video}
                  onChange={(e) => setCreditConfig({ ...creditConfig, video: Number(e.target.value) })}
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setConfigDialogOpen(false)} sx={{ fontWeight: 600 }}>Cancel</Button>
              <Button onClick={handleUpdateConfig} variant="contained" disabled={configLoading} sx={{ borderRadius: 2, px: 3 }}>
                {configLoading ? <CircularProgress size={24} /> : 'Save Changes'}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={addCreditDialogOpen} onClose={() => setAddCreditDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: 700 }}>Add Credits to Dealer</DialogTitle>
            <DialogContent>
              <Stack spacing={3} mt={1}>
                <TextField
                  fullWidth
                  select
                  label="Select Dealer"
                  value={selectedDealer}
                  onChange={(e) => setSelectedDealer(e.target.value)}
                  SelectProps={{ native: true }}
                  InputProps={{ sx: { borderRadius: 2 } }}
                >
                  <option value="">Select a dealer</option>
                  {dealers.map((dealer) => (
                    <option key={dealer.dealerId} value={dealer.dealerId}>
                      {dealer.name} ({dealer.email}) - Bal: {dealer.creditBalance}
                    </option>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  label="Credit Amount"
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
                <TextField
                  fullWidth
                  label="Description (Optional)"
                  value={creditDescription}
                  onChange={(e) => setCreditDescription(e.target.value)}
                  multiline
                  rows={2}
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setAddCreditDialogOpen(false)} sx={{ fontWeight: 600 }}>Cancel</Button>
              <Button onClick={handleAddCredit} variant="contained" disabled={addCreditLoading} sx={{ borderRadius: 2, px: 3 }}>
                {addCreditLoading ? <CircularProgress size={24} /> : 'Add Credits'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Fade>
    </Box>
  );
}