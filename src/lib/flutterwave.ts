/**
 * Flutterwave Integration Service
 * Handles bill payments and airtime via Flutterwave API
 */

export interface FlutterwaveConfig {
    public_key: string;
    tx_ref: string;
    amount: number;
    currency: string;
    payment_options: string;
    customer: {
        email: string;
        phone_number?: string;
        name?: string;
    };
    customizations: {
        title: string;
        description: string;
        logo?: string;
    };
    callback?: (data: any) => void;
    onClose?: () => void;
}

/**
 * Initialize Flutterwave payment
 */
export function initializeFlutterwave(config: FlutterwaveConfig): void {
    if (typeof window === 'undefined' || !(window as any).FlutterwaveCheckout) {
        throw new Error('Flutterwave script not loaded.');
    }

    (window as any).FlutterwaveCheckout({
        public_key: config.public_key,
        tx_ref: config.tx_ref,
        amount: config.amount,
        currency: config.currency || 'NGN',
        payment_options: config.payment_options || 'card,mobilemoney,ussd',
        customer: config.customer,
        customizations: config.customizations,
        callback: (data: any) => {
            if (config.callback) {
                config.callback(data);
            }
        },
        onClose: () => {
            if (config.onClose) {
                config.onClose();
            }
        },
    });
}

/**
 * Load Flutterwave inline script
 */
export function loadFlutterwaveScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') {
            reject(new Error('Window object not available'));
            return;
        }

        if ((window as any).FlutterwaveCheckout) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.flutterwave.com/v3.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Flutterwave script'));
        document.head.appendChild(script);
    });
}

/**
 * Fetch Bill Categories (Power, Water, TV, etc.)
 */
export async function fetchBillCategories(type?: string): Promise<any> {
    const url = type ? `/api/flutterwave/bill-categories?type=${type}` : '/api/flutterwave/bill-categories';
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch bill categories');
    return response.json();
}

/**
 * Validate Bill Service (Validate Meter Number, SmartCard ID, etc.)
 */
export async function validateBill(data: { item_code: string; code: string; customer: string }): Promise<any> {
    const response = await fetch('/api/flutterwave/validate-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Bill validation failed');
    return response.json();
}

/**
 * Pay Bill
 */
export async function payBill(data: {
    country: string;
    customer: string;
    amount: number;
    type: string;
    reference: string;
}): Promise<any> {
    const response = await fetch('/api/flutterwave/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Bill payment failed');
    return response.json();
}

/**
 * Purchase Airtime
 */
export async function purchaseAirtime(data: {
    country: string;
    customer: string;
    amount: number;
    type: string;
    reference: string;
}): Promise<any> {
    const response = await fetch('/api/flutterwave/airtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Airtime purchase failed');
    return response.json();
}
