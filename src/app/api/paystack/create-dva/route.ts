import { NextRequest, NextResponse } from 'next/server';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

export async function POST(request: NextRequest) {
    try {
        if (!PAYSTACK_SECRET_KEY) {
            return NextResponse.json(
                { status: false, message: 'Paystack secret key not configured' },
                { status: 500 }
            );
        }

        const { email, firstName, lastName, phone } = await request.json();

        if (!email) {
            return NextResponse.json(
                { status: false, message: 'Email is required' },
                { status: 400 }
            );
        }

        // 1. Create or Identify Customer
        const customerResponse = await fetch('https://api.paystack.co/customer', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                first_name: firstName,
                last_name: lastName,
                phone,
            }),
        });

        const customerData = await customerResponse.json();

        // If customer already exists, it might return success: true or an error saying email taken.
        // Paystack's /customer endpoint is idempotent for email usually.
        if (!customerResponse.ok && customerData.message !== 'Emails has already been taken') {
            return NextResponse.json(
                { status: false, message: customerData.message || 'Failed to create customer' },
                { status: customerResponse.status }
            );
        }

        // If it was already taken, we might need to fetch the customer by email?
        // Actually, Paystack's "Create DVA" can take an email if you use certain plans, 
        // but usually it wants a customer context.

        let customerCode = customerData.data?.customer_code;

        if (!customerCode) {
            // Fetch customer if creation failed due to "taken"
            const fetchCust = await fetch(`https://api.paystack.co/customer/${email}`, {
                headers: { 'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}` }
            });
            const fetchedData = await fetchCust.json();
            customerCode = fetchedData.data?.customer_code;
        }

        if (!customerCode) {
            return NextResponse.json(
                { status: false, message: 'Could not resolve customer code' },
                { status: 400 }
            );
        }

        // 2. Create Dedicated Virtual Account
        const dvaResponse = await fetch('https://api.paystack.co/dedicated_account', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customer: customerCode,
                preferred_bank: 'wema-bank', // Common for DVA, or omit for default
            }),
        });

        const dvaData = await dvaResponse.json();

        if (!dvaResponse.ok) {
            return NextResponse.json(
                { status: false, message: dvaData.message || 'Failed to create DVA' },
                { status: dvaResponse.status }
            );
        }

        return NextResponse.json(dvaData);
    } catch (error: any) {
        console.error('Error creating DVA:', error);
        return NextResponse.json(
            { status: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
