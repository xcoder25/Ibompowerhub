import { NextRequest, NextResponse } from 'next/server';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const accountNumber = searchParams.get('account_number');
    const bankCode = searchParams.get('bank_code');

    if (!accountNumber || !bankCode) {
        return NextResponse.json(
            { status: false, message: 'Missing account number or bank code' },
            { status: 400 }
        );
    }

    try {
        if (!PAYSTACK_SECRET_KEY) {
            return NextResponse.json(
                { status: false, message: 'Paystack secret key not configured' },
                { status: 500 }
            );
        }

        const response = await fetch(
            `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { status: false, message: data.message || 'Failed to resolve account' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error resolving bank account:', error);
        return NextResponse.json(
            { status: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
