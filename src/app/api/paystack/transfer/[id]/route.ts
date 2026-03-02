import { NextRequest, NextResponse } from 'next/server';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } // In Next.js 15, params is a Promise
) {
    try {
        if (!PAYSTACK_SECRET_KEY || PAYSTACK_SECRET_KEY === '') {
            return NextResponse.json(
                { status: false, message: 'Paystack secret key not configured' },
                { status: 500 }
            );
        }

        const { id: id_or_code } = await params;

        if (!id_or_code) {
            return NextResponse.json(
                { status: false, message: 'Missing transfer ID or code' },
                { status: 400 }
            );
        }

        const response = await fetch(`https://api.paystack.co/transfer/${id_or_code}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { status: false, message: data.message || 'Failed to fetch transfer' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching transfer:', error);
        return NextResponse.json(
            { status: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
