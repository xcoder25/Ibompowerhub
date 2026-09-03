export interface BankOption {
  code: string;
  name: string;
  isPopular?: boolean;
}

export const NIGERIAN_BANKS: BankOption[] = [
  // Popular fintechs & top commercial banks
  { code: '100004', name: 'OPay Digital Services', isPopular: true },
  { code: '999992', name: 'Moniepoint Microfinance Bank', isPopular: true },
  { code: '100033', name: 'PalmPay Limited', isPopular: true },
  { code: '999991', name: 'Kuda Microfinance Bank', isPopular: true },
  { code: '058', name: 'Guaranty Trust Bank (GTBank)', isPopular: true },
  { code: '057', name: 'Zenith Bank', isPopular: true },
  { code: '044', name: 'Access Bank', isPopular: true },
  { code: '033', name: 'United Bank for Africa (UBA)', isPopular: true },
  { code: '011', name: 'First Bank of Nigeria', isPopular: true },
  { code: '035', name: 'Wema Bank (ALAT)', isPopular: true },
  { code: 'ibomx', name: 'Ibom X State Citizen Account', isPopular: true },

  // Other Commercial Banks
  { code: '070', name: 'Fidelity Bank' },
  { code: '214', name: 'First City Monument Bank (FCMB)' },
  { code: '050', name: 'Ecobank Nigeria' },
  { code: '221', name: 'Stanbic IBTC Bank' },
  { code: '232', name: 'Sterling Bank' },
  { code: '076', name: 'Polaris Bank' },
  { code: '082', name: 'Keystone Bank' },
  { code: '032', name: 'Union Bank of Nigeria' },
  { code: '215', name: 'Unity Bank' },
  { code: '100', name: 'SunTrust Bank' },
  { code: '101', name: 'Providus Bank' },
  { code: '102', name: 'Titan Trust Bank' },
  { code: '103', name: 'Globus Bank' },
  { code: '104', name: 'Parallex Bank' },
  { code: '105', name: 'Premium Trust Bank' },
  { code: '106', name: 'Signature Bank' },
];

export interface WalletData {
  balance: number;
  currency: string;
  dva?: {
    account_number: string;
    account_name: string;
    bank_name: string;
  };
  tier?: number;
  bvnVerified?: boolean;
  pinSet?: boolean;
  pinHash?: string;
  isCardFrozen?: boolean;
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  category?: 'transfer' | 'deposit' | 'bill' | 'flight' | 'airsend' | 'market';
  timestamp: any;
  reference?: string;
  recipientName?: string;
  recipientBank?: string;
  recipientAccount?: string;
  senderName?: string;
  status?: 'success' | 'pending' | 'failed';
  fee?: number;
}

export interface SavingsVault {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  interestRate: number; // e.g. 12%
  dueDate?: string;
  createdAt: any;
}

export interface VirtualCard {
  id: string;
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  isFrozen: boolean;
  spendingLimit: number;
  currency: 'NGN' | 'USD';
  balance: number;
}

export function formatNaira(amount: number): string {
  return '₦' + Number(amount || 0).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function maskAccountNumber(acc: string): string {
  if (!acc || acc.length < 4) return '••••';
  return '•••• ' + acc.slice(-4);
}

export function generateDVA(fullName: string, phone: string = '') {
  // Generates or derives a deterministic 10-digit virtual account
  let baseNumber = phone.replace(/\D/g, '').slice(-9);
  if (baseNumber.length < 9) {
    baseNumber = '90' + Math.floor(1000000 + Math.random() * 9000000);
  }
  const accountNumber = '9' + baseNumber.slice(-9);
  return {
    account_number: accountNumber,
    account_name: (fullName || 'Ibom Citizen').toUpperCase(),
    bank_name: 'Wema Bank (Ibom State DVA)',
  };
}
