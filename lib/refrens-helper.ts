const REFRENS_URL_KEY = process.env.REFRENS_URL_KEY || '';
const REFRENS_APP_ID = process.env.REFRENS_APP_ID || '';
const REFRENS_APP_SECRET = process.env.REFRENS_APP_SECRET || '';
const REFRENS_API_URL = 'https://api.refrens.com';

let accessToken: string | null = null;
let tokenExpiry: number = 0;

export interface RefrensInvoiceItem {
  name: string;
  rate: number;
  quantity: number;
  gstRate?: number;
  taxRate?: number;
}

export interface RefrensBillingInfo {
  name: string;
  street?: string;
  city?: string;
  pincode?: string;
  gstState?: string;
  state?: string;
  country: string;
  panNumber?: string;
  gstin?: string;
  phone?: string;
  email?: string;
}

export interface RefrensInvoiceData {
  invoiceNumber?: string;
  invoiceTitle?: string;
  invoiceSubTitle?: string;
  invoiceDate?: string;
  dueDate?: string;
  invoiceType?: 'INVOICE' | 'BOS';
  currency?: string;
  billedTo: RefrensBillingInfo;
  billedBy?: RefrensBillingInfo;
  items: RefrensInvoiceItem[];
  contact?: {
    phone?: string;
    email?: string;
  };
  email?: {
    to?: { name?: string; email: string };
    cc?: Array<{ name?: string; email: string }>;
  };
}

export interface RefrensInvoice {
  _id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  currency: string;
  billType: string;
  status: 'UNPAID' | 'PAID' | 'PARTIALLY_PAID' | 'CANCELED';
  billedBy: RefrensBillingInfo;
  billedTo: RefrensBillingInfo;
  invoiceTitle: string;
  items: Array<{
    _id: string;
    name: string;
    rate: number;
    quantity: number;
    gstRate?: number;
    amount: number;
    total: number;
  }>;
  finalTotal: {
    total: number;
    amount: number;
    subTotal: number;
    igst: number;
    cgst: number;
    sgst: number;
    discount: number;
  };
  share?: {
    link: string;
    pdf: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RefrensListResponse {
  total: number;
  limit: number;
  skip: number;
  data: RefrensInvoice[];
}

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  if (!REFRENS_APP_ID || !REFRENS_APP_SECRET) {
    throw new Error('Refrens API credentials not configured');
  }

  const response = await fetch(`${REFRENS_API_URL}/authentication`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      strategy: 'app-secret',
      appId: REFRENS_APP_ID,
      appSecret: REFRENS_APP_SECRET
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to get Refrens access token: ${JSON.stringify(data)}`);
  }

  // Extract token from nested authentication object
  accessToken = data.authentication?.accessToken || data.accessToken || data.token;
  tokenExpiry = Date.now() + (55 * 60 * 1000);

  if (!accessToken) {
    throw new Error('Failed to obtain access token from Refrens');
  }

  return accessToken;
}

export async function createInvoice(invoiceData: RefrensInvoiceData): Promise<RefrensInvoice> {
  const token = await getAccessToken();

  if (!REFRENS_URL_KEY) {
    throw new Error('Refrens URL Key not configured');
  }

  const response = await fetch(`${REFRENS_API_URL}/businesses/${REFRENS_URL_KEY}/invoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(invoiceData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to create Refrens invoice: ${JSON.stringify(data)}`);
  }

  return data;
}

export interface ListInvoicesOptions {
  limit?: number;
  skip?: number;
  startDate? : string;
  endDate? : string;

  sortBy?: 'createdAt' | 'invoiceNumber' | 'invoiceDate';
  sortOrder?: 1 | -1;
}

export async function listInvoices(options: ListInvoicesOptions = {}): Promise<RefrensListResponse> {
  const token = await getAccessToken();

  if (!REFRENS_URL_KEY) {
    throw new Error('Refrens URL Key not configured');
  }

 

  const queryParams = new URLSearchParams();
  
   if(options.startDate){
    queryParams.append('date_from',options.startDate)
  }
  if(options.endDate){
    queryParams.append('date_to',options.endDate);
  }

  if (options.limit) {
    queryParams.append('$limit', options.limit.toString());
  }
  if (options.skip) {
    queryParams.append('$skip', options.skip.toString());
  }
  if (options.sortBy && options.sortOrder) {
    queryParams.append(`$sort[${options.sortBy}]`, options.sortOrder.toString());
  }

  const url = `${REFRENS_API_URL}/businesses/${REFRENS_URL_KEY}/invoices${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to list Refrens invoices: ${JSON.stringify(data)}`);
  }

  return data;
}

export async function getInvoice(invoiceId: string): Promise<RefrensInvoice> {
  const token = await getAccessToken();

  if (!REFRENS_URL_KEY) {
    throw new Error('Refrens URL Key not configured');
  }

  const response = await fetch(`${REFRENS_API_URL}/businesses/${REFRENS_URL_KEY}/invoices/${invoiceId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to get Refrens invoice: ${JSON.stringify(data)}`);
  }

  return data;
}

export async function cancelInvoice(invoiceId: string): Promise<RefrensInvoice> {
  const token = await getAccessToken();

  if (!REFRENS_URL_KEY) {
    throw new Error('Refrens URL Key not configured');
  }

  const response = await fetch(`${REFRENS_API_URL}/businesses/${REFRENS_URL_KEY}/invoices/${invoiceId}?cancelPayment=true`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      status: 'CANCELED'
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to cancel Refrens invoice: ${JSON.stringify(data)}`);
  }

  return data;
}

export async function generateAutoInvoice(
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  amount: number,
  description: string,
  paymentId: string,
  sendEmail: boolean = true
): Promise<RefrensInvoice> {
  const invoiceData: RefrensInvoiceData = {
    invoiceTitle: 'Tax Invoice',
    invoiceType: 'INVOICE',
    currency: 'INR',
    billedTo: {
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      country: 'IN'
    },
    items: [
      {
        name: description,
        rate: amount,
        quantity: 1,
        gstRate: 18
      }
    ],
    contact: {
      email: customerEmail,
      phone: customerPhone
    }
  };

  if (sendEmail && customerEmail) {
    invoiceData.email = {
      to: {
        name: customerName,
        email: customerEmail
      }
    };
  }

  return await createInvoice(invoiceData);
}

export function getInvoiceAnalytics(invoices: RefrensInvoice[]) {
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(inv => inv.status === 'PAID').length;
  const unpaidInvoices = invoices.filter(inv => inv.status === 'UNPAID').length;
  const canceledInvoices = invoices.filter(inv => inv.status === 'CANCELED').length;
  const partiallyPaidInvoices = invoices.filter(inv => inv.status === 'PARTIALLY_PAID').length;

  const totalRevenue = invoices
    .filter(inv => inv.status === 'PAID')
    .reduce((sum, inv) => sum + (inv.finalTotal?.total || 0), 0);

  const pendingAmount = invoices
    .filter(inv => inv.status === 'UNPAID' || inv.status === 'PARTIALLY_PAID')
    .reduce((sum, inv) => sum + (inv.finalTotal?.total || 0), 0);

  const thisMonthInvoices = invoices.filter(inv => {
    const invoiceDate = new Date(inv.invoiceDate);
    const now = new Date();
    return invoiceDate.getMonth() === now.getMonth() && 
           invoiceDate.getFullYear() === now.getFullYear();
  });

  const thisMonthRevenue = thisMonthInvoices
    .filter(inv => inv.status === 'PAID')
    .reduce((sum, inv) => sum + (inv.finalTotal?.total || 0), 0);

  return {
    totalInvoices,
    paidInvoices,
    unpaidInvoices,
    canceledInvoices,
    partiallyPaidInvoices,
    totalRevenue,
    pendingAmount,
    thisMonthInvoices: thisMonthInvoices.length,
    thisMonthRevenue
  };
}


