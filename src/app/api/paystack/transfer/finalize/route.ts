import { NextRequest, NextResponse } from 'next/server';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

export async function POST(request: NextRequest) {
    try {
        if (!PAYSTACK_SECRET_KEY || PAYSTACK_SECRET_KEY === '') {
            return NextResponse.json(
                { status: false, message: 'Paystack secret key not configured' },
                { status: 500 }
            );
        }

        const body = await request.json();
        const { transfer_code, otp } = body;

        if (!transfer_code || !otp) {
            return NextResponse.json(
                { status: false, message: 'Missing required fields: transfer_code and otp' },
                { status: 400 }
            );
        }

        const response = await fetch('https://api.paystack.co/transfer/finalize_transfer', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ transfer_code, otp }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { status: false, message: data.message || 'Finalize transfer failed' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error finalizing transfer:', error);
        return NextResponse.json(
            { status: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
