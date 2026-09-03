import { NextResponse } from 'next/server';
import { generateMerchantId } from '@/lib/seller-types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, action, rejectionReason, changeRequest, suspensionReason, adminNotes } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'userId and action are required.' },
        { status: 400 }
      );
    }

    if (action === 'reject' && (!rejectionReason || !rejectionReason.trim())) {
      return NextResponse.json(
        { error: 'A rejection reason is required.' },
        { status: 400 }
      );
    }

    if (action === 'request_changes' && (!changeRequest || !changeRequest.trim())) {
      return NextResponse.json(
        { error: 'Specific instructions on what needs to be changed are required.' },
        { status: 400 }
      );
    }

    if (action === 'suspend' && (!suspensionReason || !suspensionReason.trim())) {
      return NextResponse.json(
        { error: 'A suspension reason is required.' },
        { status: 400 }
      );
    }

    let updatedStatus = 'UNDER_REVIEW';
    let merchantId = undefined;

    if (action === 'approve') {
      updatedStatus = 'APPROVED';
      // Generate a human-readable merchant ID
      const randomSeq = Math.floor(1000 + Math.random() * 9000);
      merchantId = generateMerchantId(randomSeq);
    } else if (action === 'reject') {
      updatedStatus = 'REJECTED';
    } else if (action === 'request_changes') {
      updatedStatus = 'REQUIRES_CHANGES';
    } else if (action === 'suspend') {
      updatedStatus = 'SUSPENDED';
    }

    return NextResponse.json({
      success: true,
      userId,
      status: updatedStatus,
      merchantId,
      reviewedAt: new Date().toISOString(),
      message: `Seller status successfully updated to ${updatedStatus}.`,
    });
  } catch (error: any) {
    console.error('Error in admin seller review API:', error);
    return NextResponse.json(
      { error: error?.message || 'Server error processing seller review.' },
      { status: 500 }
    );
  }
}
