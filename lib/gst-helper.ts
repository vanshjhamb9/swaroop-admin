// lib/gst-helper.ts
// GST State Codes for India

export const GST_STATE_CODES: { [key: string]: string } = {
  '01': 'Jammu and Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '25': 'Daman and Diu',
  '26': 'Dadra and Nagar Haveli',
  '27': 'Maharashtra',
  '28': 'Andhra Pradesh (Old)',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman and Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh (New)',
  '38': 'Ladakh',
  '97': 'Other Territory',
  '99': 'Centre Jurisdiction'
};

// Get array of state options for dropdown
export const getGSTStateOptions = () => {
  return Object.entries(GST_STATE_CODES).map(([code, name]) => ({
    value: code,
    label: `${code} - ${name}`
  }));
};

// Validate GSTIN format
export const validateGSTIN = (gstin: string): boolean => {
  if (!gstin) return false;
  
  // GSTIN format: 2 digits (state code) + 10 chars (PAN) + 1 digit + 1 char + 1 char
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin.toUpperCase());
};

// Get state code from GSTIN
export const getStateCodeFromGSTIN = (gstin: string): string | null => {
  if (!gstin || gstin.length < 2) return null;
  return gstin.substring(0, 2);
};

// Validate PAN format
export const validatePAN = (pan: string): boolean => {
  if (!pan) return false;
  
  // PAN format: 5 chars + 4 digits + 1 char
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan.toUpperCase());
};