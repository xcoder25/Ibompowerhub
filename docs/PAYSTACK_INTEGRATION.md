# Paystack Payment Integration Guide

This document describes the Paystack payment integration for PowerHub CRS wallet system.

## Overview

The Paystack integration enables:
- **Wallet Funding**: Users can top up their wallet using Paystack payment gateway
- **Bank Transfers**: Users can transfer funds from their wallet to bank accounts via Paystack

## Setup

### 1. Environment Variables

Add the following to your `.env.local` file:

```env
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
```

**Important**: 
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` is used on the client-side (public)
- `PAYSTACK_SECRET_KEY` is used only on the server-side (keep it secret!)

### 2. Get Paystack Keys

1. Sign up at [paystack.com](https://paystack.com)
2. Go to Settings > API Keys & Webhooks
3. Copy your Public Key and Secret Key
4. Use test keys for development, live keys for production

## Architecture

### Frontend Components

- **`src/lib/paystack.ts`**: Paystack utility functions
- **`src/app/wallet/page.tsx`**: Wallet page with Paystack integration

### Backend API Routes

- **`src/app/api/paystack/create-recipient/route.ts`**: Creates transfer recipients
- **`src/app/api/paystack/transfer/route.ts`**: Initiates bank transfers
- **`src/app/api/paystack/verify/[reference]/route.ts`**: Verifies payment transactions

## Features

### Wallet Funding

1. User enters amount to add
2. Paystack payment modal opens
3. User completes payment via card/bank transfer/USSD
4. Payment is verified on the backend
5. Wallet balance is updated
6. Transaction is recorded in Firestore

### Bank Transfers

1. User enters transfer details:
   - Amount
   - Recipient name
   - Account number
   - Bank code
   - Reason (optional)
2. System creates transfer recipient via Paystack API
3. Transfer is initiated
4. Wallet balance is deducted
5. Transaction is recorded

## Bank Codes

Common Nigerian bank codes:
- **058** - GTBank
- **044** - Access Bank
- **050** - Ecobank
- **070** - Fidelity Bank
- **011** - First Bank
- **214** - First City Monument Bank
- **301** - Jaiz Bank
- **082** - Keystone Bank
- **526** - Parallex Bank
- **076** - Polaris Bank
- **101** - Providus Bank
- **221** - Stanbic IBTC Bank
- **068** - Standard Chartered Bank
- **232** - Sterling Bank
- **100** - Suntrust Bank
- **032** - Union Bank
- **033** - United Bank For Africa
- **215** - Unity Bank
- **035** - Wema Bank
- **057** - Zenith Bank

Full list: [Paystack Bank Codes](https://paystack.com/docs/payments/transfers/bank-codes)

## Usage Example

### Funding Wallet

```typescript
import { initializePaystack, loadPaystackScript } from '@/lib/paystack';

// Load Paystack script
await loadPaystackScript(process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!);

// Initialize payment
initializePaystack({
  publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
  email: user.email,
  amount: 10000, // in kobo (₦100.00)
  reference: `PH-${Date.now()}`,
  onSuccess: async (response) => {
    // Verify payment
    const result = await verifyPayment('/api/paystack/verify', response.reference);
    // Update wallet balance
  }
});
```

### Transfer Funds

```typescript
// Create recipient
const recipient = await fetch('/api/paystack/create-recipient', {
  method: 'POST',
  body: JSON.stringify({
    type: 'nuban',
    name: 'John Doe',
    account_number: '0123456789',
    bank_code: '058'
  })
});

// Initiate transfer
const transfer = await fetch('/api/paystack/transfer', {
  method: 'POST',
  body: JSON.stringify({
    source: 'balance',
    amount: 500000, // in kobo (₦5,000.00)
    recipient: recipientCode,
    reason: 'Payment for services'
  })
});
```

## Security Considerations

1. **Never expose secret keys**: Only use `PAYSTACK_SECRET_KEY` in server-side code
2. **Verify payments**: Always verify payments on the backend before updating balances
3. **Validate amounts**: Check amounts match between frontend and backend
4. **Rate limiting**: Consider adding rate limiting to API routes
5. **Webhook verification**: Implement webhook endpoints for payment notifications (recommended)

## Testing

### Test Cards

Paystack provides test cards for development:

- **Success**: `4084084084084081`
- **Insufficient Funds**: `5060666666666666666`
- **Declined**: `5060666666666666667`

Use any future expiry date and any CVV.

### Test Bank Accounts

For transfers, use test account numbers provided in Paystack dashboard.

## Troubleshooting

### Payment Modal Not Opening

- Check if Paystack script is loaded: `window.PaystackPop` should exist
- Verify public key is correct
- Check browser console for errors

### Transfer Fails

- Verify bank code is correct
- Check account number format
- Ensure sufficient balance in Paystack account
- Check API response for specific error messages

### Verification Fails

- Verify secret key is correct
- Check reference number matches
- Ensure payment was successful before verification

## Next Steps

1. Implement webhook endpoints for payment notifications
2. Add payment history with Paystack transaction references
3. Add support for recurring payments
4. Implement payment retry logic
5. Add email notifications for transactions
