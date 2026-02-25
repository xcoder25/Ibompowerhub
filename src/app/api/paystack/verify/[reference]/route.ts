import { NextRequest, NextResponse } from 'next/server';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

export async function GET(
  request: NextRequest,
  { params }: { params: { reference: string } }
) {
  try {
    if (!PAYSTACK_SECRET_KEY || PAYSTACK_SECRET_KEY === '') {
      return NextResponse.json(
        { status: false, message: 'Paystack secret key not configured' },
        { status: 500 }
      );
    }

    const { reference } = params;

    if (!reference) {
      return NextResponse.json(
        { status: false, message: 'Reference is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { status: false, message: data.message || 'Verification failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
