const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID || '';
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET || '';
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN || '';
const ZOHO_ORGANIZATION_ID = process.env.ZOHO_ORGANIZATION_ID || '';
const ZOHO_API_URL = 'https://www.zohoapis.com/books/v3';

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: ZOHO_REFRESH_TOKEN,
      client_id: ZOHO_CLIENT_ID,
      client_secret: ZOHO_CLIENT_SECRET,
      grant_type: 'refresh_token'
    })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`Failed to get Zoho access token: ${JSON.stringify(data)}`);
  }

  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
  
  return accessToken;
}

export async function createOrGetCustomer(email: string, name: string): Promise<string> {
  const token = await getAccessToken();

  const searchResponse = await fetch(
    `${ZOHO_API_URL}/contacts?email=${encodeURIComponent(email)}&organization_id=${ZOHO_ORGANIZATION_ID}`,
    {
      headers: {
        'Authorization': `Zoho-oauthtoken ${token}`
      }
    }
  );

  const searchData = await searchResponse.json();

  if (searchData.contacts && searchData.contacts.length > 0) {
    return searchData.contacts[0].contact_id;
  }

  const createResponse = await fetch(
    `${ZOHO_API_URL}/contacts?organization_id=${ZOHO_ORGANIZATION_ID}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Zoho-oauthtoken ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contact_name: name,
        company_name: name,
        email
      })
    }
  );

  const createData = await createResponse.json();

  if (!createResponse.ok) {
    throw new Error(`Failed to create Zoho customer: ${JSON.stringify(createData)}`);
  }

  return createData.contact.contact_id;
}

export async function generateInvoice(
  customerId: string,
  amount: number,
  description: string,
  referenceNumber: string
): Promise<string> {
  const token = await getAccessToken();

  const invoiceData = {
    customer_id: customerId,
    reference_number: referenceNumber,
    date: new Date().toISOString().split('T')[0],
    line_items: [
      {
        name: description,
        description: `Credit purchase - ${description}`,
        rate: amount,
        quantity: 1
      }
    ]
  };

  const response = await fetch(
    `${ZOHO_API_URL}/invoices?organization_id=${ZOHO_ORGANIZATION_ID}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Zoho-oauthtoken ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invoiceData)
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to create Zoho invoice: ${JSON.stringify(data)}`);
  }

  return data.invoice.invoice_id;
}

export async function sendInvoice(invoiceId: string): Promise<boolean> {
  const token = await getAccessToken();

  const response = await fetch(
    `${ZOHO_API_URL}/invoices/${invoiceId}/email?organization_id=${ZOHO_ORGANIZATION_ID}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Zoho-oauthtoken ${token}`
      }
    }
  );

  return response.ok;
}
