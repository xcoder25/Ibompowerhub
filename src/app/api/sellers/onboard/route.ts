import { NextResponse } from 'next/server';
import { generateApplicationId, AKWA_IBOM_31_LGAS } from '@/lib/seller-types';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || !body.account || !body.business) {
      return NextResponse.json(
        { error: 'Incomplete application payload.' },
        { status: 400 }
      );
    }

    // Verify State is strictly Akwa Ibom
    if (body.location && body.location.state !== 'Akwa Ibom State') {
      return NextResponse.json(
        { error: 'Registration is strictly limited to Akwa Ibom State.' },
        { status: 400 }
      );
    }

    // Verify LGA is in the 31 LGAs
    if (
      body.location?.lga &&
      !AKWA_IBOM_31_LGAS.includes(body.location.lga as any)
    ) {
      return NextResponse.json(
        { error: 'Invalid Local Government Area in Akwa Ibom State.' },
        { status: 400 }
      );
    }

    // Verify at least 1 product
    if (body.status === 'UNDER_REVIEW' && (!body.products || body.products.length === 0)) {
      return NextResponse.json(
        { error: 'At least one agricultural product must be registered.' },
        { status: 400 }
      );
    }

    const applicationId = body.applicationId || generateApplicationId();

    return NextResponse.json({
      success: true,
      applicationId,
      status: body.status || 'UNDER_REVIEW',
      message: 'Seller application saved successfully.',
    });
  } catch (error: any) {
    console.error('Error in seller onboarding API:', error);
    return NextResponse.json(
      { error: error?.message || 'Server error processing seller application.' },
      { status: 500 }
    );
  }
}
