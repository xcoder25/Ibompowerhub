import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      reporterName = 'Akwa Ibom Resident',
      lga = 'Uyo',
      location,
      severity = 'Moderate',
      waterDepthDescription = 'Ankle to knee deep water',
      passableByVehicle = false,
      passableByFoot = false,
      drainageBlocked = false,
      imageUrl = ''
    } = body;

    if (!location) {
      return NextResponse.json(
        { success: false, error: 'Location description is required.' },
        { status: 400 }
      );
    }

    const reportId = `REP-${Date.now().toString().slice(-6)}`;
    const ticketId = `AKSWMA-${Math.floor(1000 + Math.random() * 9000)}`;

    const newReport = {
      id: reportId,
      ticketId,
      reporterName,
      lga,
      location,
      severity,
      waterDepthDescription,
      passableByVehicle: Boolean(passableByVehicle),
      passableByFoot: Boolean(passableByFoot),
      drainageBlocked: Boolean(drainageBlocked),
      imageUrl,
      upvotes: 1,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString(),
      status: 'DISPATCHED_TO_AKSWMA'
    };

    return NextResponse.json({
      success: true,
      data: newReport,
      message: `Ticket #${ticketId} dispatched to AKSWMA Rapid Response Unit.`
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
