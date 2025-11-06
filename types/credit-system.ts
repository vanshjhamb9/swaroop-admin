export type PlanType = 'prepaid' | 'postpaid';

export type TransactionType = 'credit' | 'debit';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  timestamp: string;
  balanceAfter: number;
}

export interface UserCreditData {
  userId: string;
  planType: PlanType;
  creditBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentLog {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  paymentMethod: 'phonepe' | 'manual';
  phonePeTransactionId?: string;
  phonePeMerchantTransactionId?: string;
  zohoInvoiceId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
