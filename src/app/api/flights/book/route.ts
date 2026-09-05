import { NextResponse } from 'next/server';

function generatePnr(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let pnr = 'QI';
  for (let i = 0; i < 4; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pnr;
}

function generateTicketNumber(): string {
  const num = Math.floor(1000000000 + Math.random() * 9000000000);
  return `087-${num}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      flight,
      cabinClass = 'Economy Classic',
      passengers = 1,
      passengerDetails,
      totalAmount,
      userId = 'guest-session'
    } = body;

    if (!flight || !totalAmount) {
      return NextResponse.json(
        { success: false, error: 'Flight details and payment amount are required.' },
        { status: 400 }
      );
    }

    const pnr = generatePnr();
    const ticketNumber = generateTicketNumber();
    const bookingDate = new Date().toISOString();
    const seatNumber = `${Math.floor(4 + Math.random() * 22)}${['A', 'C', 'D', 'F'][Math.floor(Math.random() * 4)]}`;

    const eTicket = {
      pnr,
      ticketNumber,
      flightNo: flight.flightNo || 'QI 0101',
      airline: 'Ibom Air',
      origin: flight.origin || 'Uyo (QUO)',
      destination: flight.destination || 'Lagos (LOS)',
      departureTime: flight.departureTime || '08:30',
      arrivalTime: flight.arrivalTime || '09:45',
      duration: flight.duration || '1h 15m',
      aircraft: flight.aircraft || 'Airbus A220-300',
      cabinClass: typeof cabinClass === 'string' ? cabinClass : cabinClass.name,
      seatNumber,
      gate: 'G2',
      terminal: 'Terminal 1',
      passengerName: passengerDetails?.fullName || 'Akwa Ibom Resident',
      passengerEmail: passengerDetails?.email || '',
      passengerPhone: passengerDetails?.phone || '',
      totalAmountPaid: totalAmount,
      bookingDate,
      status: 'CONFIRMED',
      barcodeData: `IBOMAIR:${pnr}:${ticketNumber}:${flight.flightNo}:${seatNumber}`
    };

    return NextResponse.json({
      success: true,
      data: eTicket,
      message: `Flight booked successfully! PNR: ${pnr}`
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
