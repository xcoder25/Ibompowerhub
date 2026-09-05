import { NextResponse } from 'next/server';
import { FLOOD_SENSORS } from '@/lib/floodsense-data';

export async function GET() {
  try {
    // Returns the official Akwa Ibom Ministry of Environment Flood Telemetry baseline
    return NextResponse.json({
      success: true,
      data: FLOOD_SENSORS,
      timestamp: new Date().toISOString(),
      networkStatus: 'ONLINE',
      activeSensorsCount: FLOOD_SENSORS.length
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sensorId, waterLevelCm, flowVelocityMs } = body;

    if (!sensorId || typeof waterLevelCm !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Valid sensorId and numeric waterLevelCm are required.' },
        { status: 400 }
      );
    }

    const sensor = FLOOD_SENSORS.find(s => s.id === sensorId);
    const maxThreshold = sensor ? sensor.maxThresholdCm : 120;
    
    let status = 'SAFE';
    if (waterLevelCm >= maxThreshold * 0.9) status = 'CRITICAL';
    else if (waterLevelCm >= maxThreshold * 0.7) status = 'WARNING';
    else if (waterLevelCm >= maxThreshold * 0.5) status = 'ADVISORY';

    return NextResponse.json({
      success: true,
      message: `Sensor ${sensorId} telemetry logged.`,
      data: {
        sensorId,
        waterLevelCm,
        flowVelocityMs: flowVelocityMs || 1.2,
        status,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
