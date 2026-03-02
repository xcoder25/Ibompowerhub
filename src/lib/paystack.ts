/**
 * Paystack Payment Integration Service
 * Handles wallet funding and transfers using Paystack API
 */

export interface PaystackConfig {
  key: string;
  email: string;
  amount: number; // in kobo (NGN) or smallest currency unit
  ref?: string;
  metadata?: Record<string, any>;
  callback?: (response: any) => void;
  onClose?: () => void;
  currency?: string;
}

export interface TransferRecipient {
  type: 'nuban' | 'mobile_money' | 'basa';
  name: string;
  account_number: string;
  bank_code: string;
  currency?: string;
  email?: string;
}

export interface TransferData {
  source: 'balance';
  amount: number; // in kobo
  recipient: string; // recipient code from Paystack
  reason?: string;
  reference?: string;
  currency?: string;
}

export interface BulkTransferData {
  source: 'balance';
  currency?: string;
  transfers: {
    amount: number;
    recipient: string;
    reference?: string;
    reason?: string;
  }[];
}

export interface FinalizeTransferData {
  transfer_code: string;
  otp: string;
}

export interface ListTransferParams {
  perPage?: number;
  page?: number;
  recipient?: string;
  from?: string;
  to?: string;
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: PaystackConfig) => {
        openIframe: () => void;
      };
    };
  }
}

/**
 * Initialize Paystack payment
 */
export function initializePaystack(config: PaystackConfig): void {
  if (typeof window === 'undefined' || !window.PaystackPop) {
    throw new Error('Paystack script not loaded. Please include Paystack inline JS.');
  }

  const handler = window.PaystackPop.setup({
    key: config.key,
    email: config.email,
    amount: config.amount,
    ref: config.ref || `PH-${Date.now()}`,
    metadata: config.metadata || {},
    callback: (response: any) => {
      if (config.callback) {
        config.callback(response);
      }
    },
    onClose: () => {
      if (config.onClose) {
        config.onClose();
      }
    },
  });

  handler.openIframe();
}

/**
 * Load Paystack inline script
 */
export function loadPaystackScript(publicKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window object not available'));
      return;
    }

    // Check if script already loaded
    if (window.PaystackPop) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack script'));
    document.head.appendChild(script);
  });
}

/**
 * Create transfer recipient via Paystack API
 * Note: This requires backend API call with secret key
 */
export async function createTransferRecipient(
  apiUrl: string,
  recipient: TransferRecipient
): Promise<{ status: boolean; data: { recipient_code: string } }> {
  const response = await fetch(`${apiUrl}/api/paystack/create-recipient`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(recipient),
  });

  if (!response.ok) {
    throw new Error('Failed to create transfer recipient');
  }

  return response.json();
}

/**
 * Initiate transfer via Paystack API
 * Note: This requires backend API call with secret key
 */
export async function initiateTransfer(
  apiUrl: string,
  transferData: TransferData
): Promise<{ status: boolean; data: any }> {
  const response = await fetch(`${apiUrl}/api/paystack/transfer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transferData),
  });

  if (!response.ok) {
    throw new Error('Failed to initiate transfer');
  }

  return response.json();
}

/**
 * Verify payment transaction
 * Note: This requires backend API call with secret key
 */
export async function verifyPayment(
  apiUrl: string,
  reference: string
): Promise<{ status: boolean; data: any }> {
  const response = await fetch(`${apiUrl}/api/paystack/verify/${reference}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to verify payment');
  }

  return response.json();
}

/**
 * Resolve bank account details
 */
export async function resolveBankAccount(
  apiUrl: string,
  accountNumber: string,
  bankCode: string
): Promise<{ status: boolean; data: { account_name: string } }> {
  const response = await fetch(
    `${apiUrl}/api/paystack/resolve-account?account_number=${accountNumber}&bank_code=${bankCode}`,
    { method: 'GET' }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to resolve bank account');
  }

  return response.json();
}

/**
 * Create a Dedicated Virtual Account
 */
export async function createDedicatedAccount(
  apiUrl: string,
  userData: { email: string; firstName?: string; lastName?: string; phone?: string }
): Promise<{ status: boolean; data: any }> {
  const response = await fetch(`${apiUrl}/api/paystack/create-dva`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create dedicated account');
  }

  return response.json();
}

/**
 * Finalize transfer via Paystack API
 */
export async function finalizeTransfer(
  apiUrl: string,
  finalizeData: FinalizeTransferData
): Promise<{ status: boolean; data: any }> {
  const response = await fetch(`${apiUrl}/api/paystack/transfer/finalize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(finalizeData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to finalize transfer');
  }

  return response.json();
}

/**
 * Initiate bulk transfer via Paystack API
 */
export async function initiateBulkTransfer(
  apiUrl: string,
  bulkData: BulkTransferData
): Promise<{ status: boolean; data: any[] }> {
  const response = await fetch(`${apiUrl}/api/paystack/transfer/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bulkData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to initiate bulk transfer');
  }

  return response.json();
}

/**
 * List transfers via Paystack API
 */
export async function listTransfers(
  apiUrl: string,
  params: ListTransferParams = {}
): Promise<{ status: boolean; data: any[]; meta: any }> {
  const queryParams = new URLSearchParams();
  if (params.perPage) queryParams.append('perPage', params.perPage.toString());
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.recipient) queryParams.append('recipient', params.recipient);
  if (params.from) queryParams.append('from', params.from);
  if (params.to) queryParams.append('to', params.to);

  const response = await fetch(`${apiUrl}/api/paystack/transfer?${queryParams.toString()}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to list transfers');
  }

  return response.json();
}

/**
 * Fetch transfer details via Paystack API
 */
export async function fetchTransfer(
  apiUrl: string,
  idOrCode: string
): Promise<{ status: boolean; data: any }> {
  const response = await fetch(`${apiUrl}/api/paystack/transfer/${idOrCode}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch transfer');
  }

  return response.json();
}

/**
 * Verify transfer status via Paystack API
 */
export async function verifyTransfer(
  apiUrl: string,
  reference: string
): Promise<{ status: boolean; data: any }> {
  const response = await fetch(`${apiUrl}/api/paystack/transfer/verify/${reference}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to verify transfer');
  }

  return response.json();
}
