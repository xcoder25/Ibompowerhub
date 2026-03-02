import { NextRequest, NextResponse } from 'next/server';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ ref: string }> }
) {
    try {
        if (!PAYSTACK_SECRET_KEY || PAYSTACK_SECRET_KEY === '') {
            return NextResponse.json(
                { status: false, message: 'Paystack secret key not configured' },
                { status: 500 }
            );
        }

        const { ref: reference } = await params;

        if (!reference) {
            return NextResponse.json(
                { status: false, message: 'Missing transfer reference' },
                { status: 400 }
            );
        }

        const response = await fetch(`https://api.paystack.co/transfer/verify/${reference}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { status: false, message: data.message || 'Failed to verify transfer' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error verifying transfer:', error);
        return NextResponse.json(
            { status: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
