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
    const { source, amount, recipient, reason, reference } = body;

    if (!source || !amount || !recipient) {
      return NextResponse.json(
        { status: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const response = await fetch('https://api.paystack.co/transfer', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source,
        amount,
        recipient,
        reason,
        reference,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { status: false, message: data.message || 'Transfer failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error initiating transfer:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
