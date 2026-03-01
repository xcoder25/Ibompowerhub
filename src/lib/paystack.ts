/**
 * Paystack Payment Integration Service
 * Handles wallet funding and transfers using Paystack API
 */

export interface PaystackConfig {
  publicKey: string;
  email: string;
  amount: number; // in kobo (NGN) or smallest currency unit
  reference?: string;
  metadata?: Record<string, any>;
  callback_url?: string;
  onSuccess?: (response: any) => void;
  onClose?: () => void;
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
    key: config.publicKey,
    email: config.email,
    amount: config.amount,
    ref: config.reference || `PH-${Date.now()}`,
    metadata: config.metadata || {},
    callback: (response: any) => {
      if (config.onSuccess) {
        config.onSuccess(response);
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
