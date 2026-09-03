export interface FloodSensor {
  id: string;
  name: string;
  lga: string;
  location: string;
  coordinates: { lat: number; lng: number };
  waterLevelCm: number; // in centimeters
  maxThresholdCm: number;
  flowVelocityMs: number; // m/s
  drainageHealthPercent: number; // 0 - 100%
  status: 'SAFE' | 'ADVISORY' | 'WARNING' | 'CRITICAL';
  lastReadingTime: string;
  riskTrend: 'RISING' | 'STABLE' | 'FALLING';
  historicalRisk: 'High' | 'Medium' | 'Low';
}

export interface FloodReport {
  id: string;
  reporterName: string;
  lga: string;
  location: string;
  severity: 'Minor' | 'Moderate' | 'Severe' | 'Submerged';
  waterDepthDescription: string;
  passableByVehicle: boolean;
  passableByFoot: boolean;
  timestamp: string;
  upvotes: number;
  imageUrl?: string;
  drainageBlocked: boolean;
}

export interface SafeZone {
  id: string;
  name: string;
  lga: string;
  type: 'High Ground Shelter' | 'Civic Center' | 'School Facility' | 'Medical Safe Haven';
  address: string;
  capacity: number;
  elevationMeters: number;
  contactPhone: string;
  isOpen: boolean;
}

export const FLOOD_SENSORS: FloodSensor[] = [
  {
    id: 'FS-UYO-01',
    name: 'IBB Way Flood Basin Outfall',
    lga: 'Uyo',
    location: 'IBB Way / Idoro Road Junction',
    coordinates: { lat: 5.0421, lng: 7.9152 },
    waterLevelCm: 42,
    maxThresholdCm: 120,
    flowVelocityMs: 1.4,
    drainageHealthPercent: 78,
    status: 'SAFE',
    lastReadingTime: 'Just now',
    riskTrend: 'STABLE',
    historicalRisk: 'High',
  },
  {
    id: 'FS-UYO-02',
    name: 'Atiku Abubakar Canal Siphon',
    lga: 'Uyo',
    location: 'Atiku Abubakar Avenue by Sunbeam',
    coordinates: { lat: 5.0345, lng: 7.9287 },
    waterLevelCm: 85,
    maxThresholdCm: 110,
    flowVelocityMs: 2.1,
    drainageHealthPercent: 45,
    status: 'ADVISORY',
    lastReadingTime: '2 mins ago',
    riskTrend: 'RISING',
    historicalRisk: 'High',
  },
  {
    id: 'FS-UYO-03',
    name: 'Nwaniba Water Catchment Station',
    lga: 'Uruan / Uyo Border',
    location: 'Nwaniba Road towards Ibom Icon',
    coordinates: { lat: 5.0562, lng: 7.9891 },
    waterLevelCm: 28,
    maxThresholdCm: 100,
    flowVelocityMs: 0.8,
    drainageHealthPercent: 92,
    status: 'SAFE',
    lastReadingTime: '4 mins ago',
    riskTrend: 'FALLING',
    historicalRisk: 'Medium',
  },
  {
    id: 'FS-ITU-01',
    name: 'Itu Riverine Floodgate Alpha',
    lga: 'Itu',
    location: 'Itu Bridge / Ayadehe Waterway',
    coordinates: { lat: 5.2014, lng: 7.9823 },
    waterLevelCm: 145,
    maxThresholdCm: 180,
    flowVelocityMs: 3.2,
    drainageHealthPercent: 62,
    status: 'WARNING',
    lastReadingTime: '1 min ago',
    riskTrend: 'RISING',
    historicalRisk: 'High',
  },
  {
    id: 'FS-EKT-01',
    name: 'Qua Iboe River Basin Node',
    lga: 'Eket',
    location: 'Marina Road / Eket-Ibeno Bridge',
    coordinates: { lat: 4.6421, lng: 7.9281 },
    waterLevelCm: 60,
    maxThresholdCm: 150,
    flowVelocityMs: 1.1,
    drainageHealthPercent: 84,
    status: 'SAFE',
    lastReadingTime: '5 mins ago',
    riskTrend: 'STABLE',
    historicalRisk: 'High',
  },
  {
    id: 'FS-ORN-01',
    name: 'Oron Beach Tidal Surge Gauge',
    lga: 'Oron',
    location: 'Oron Beach Jetty & Marine Terminal',
    coordinates: { lat: 4.8194, lng: 8.2341 },
    waterLevelCm: 110,
    maxThresholdCm: 160,
    flowVelocityMs: 2.8,
    drainageHealthPercent: 70,
    status: 'ADVISORY',
    lastReadingTime: '3 mins ago',
    riskTrend: 'RISING',
    historicalRisk: 'High',
  },
  {
    id: 'FS-IBN-01',
    name: 'Ibeno Atlantic Shoreline Monitor',
    lga: 'Ibeno',
    location: 'Ibeno Beachfront Estuary',
    coordinates: { lat: 4.5512, lng: 7.9942 },
    waterLevelCm: 90,
    maxThresholdCm: 200,
    flowVelocityMs: 2.5,
    drainageHealthPercent: 88,
    status: 'SAFE',
    lastReadingTime: '6 mins ago',
    riskTrend: 'STABLE',
    historicalRisk: 'Medium',
  },
  {
    id: 'FS-IKA-01',
    name: 'Ikot Abasi Imo River Estuary Sensor',
    lga: 'Ikot Abasi',
    location: 'Egbo Ibi Beach / ALSCON Jetty',
    coordinates: { lat: 4.5684, lng: 7.5583 },
    waterLevelCm: 72,
    maxThresholdCm: 160,
    flowVelocityMs: 1.9,
    drainageHealthPercent: 81,
    status: 'SAFE',
    lastReadingTime: '8 mins ago',
    riskTrend: 'STABLE',
    historicalRisk: 'Medium',
  },
];

export const COMMUNITY_FLOOD_REPORTS: FloodReport[] = [
  {
    id: 'RPT-001',
    reporterName: 'Bassey Effiong',
    lga: 'Uyo',
    location: 'Abak Road by Flyover underpass',
    severity: 'Moderate',
    waterDepthDescription: 'Water above ankle height, slow drainage due to debris.',
    passableByVehicle: true,
    passableByFoot: false,
    timestamp: '15 mins ago',
    upvotes: 19,
    drainageBlocked: true,
  },
  {
    id: 'RPT-002',
    reporterName: 'Iniubong Akpan',
    lga: 'Itu',
    location: 'Mary Slessor Hospital Junction',
    severity: 'Severe',
    waterDepthDescription: 'Heavy rainfall run-off from ravine slopes. Small sedans turning back.',
    passableByVehicle: false,
    passableByFoot: false,
    timestamp: '42 mins ago',
    upvotes: 34,
    drainageBlocked: true,
  },
  {
    id: 'RPT-003',
    reporterName: 'Emem Umoh',
    lga: 'Oron',
    location: 'Customs Barracks Road, Oron',
    severity: 'Minor',
    waterDepthDescription: 'Surface puddling, fully passable for all vehicles.',
    passableByVehicle: true,
    passableByFoot: true,
    timestamp: '2 hours ago',
    upvotes: 8,
    drainageBlocked: false,
  },
];

export const SAFE_ZONES: SafeZone[] = [
  {
    id: 'SZ-UYO-01',
    name: 'Godswill Akpabio Int’l Stadium High Grounds',
    lga: 'Uyo',
    type: 'High Ground Shelter',
    address: 'Goodluck Jonathan Boulevard, Uyo',
    capacity: 2500,
    elevationMeters: 74,
    contactPhone: '0803 123 4567',
    isOpen: true,
  },
  {
    id: 'SZ-UYO-02',
    name: 'State Secretariat Annex Complex',
    lga: 'Uyo',
    type: 'Civic Center',
    address: 'Idongesit Nkanga Secretariat, Uyo',
    capacity: 1200,
    elevationMeters: 68,
    contactPhone: '0812 999 8881',
    isOpen: true,
  },
  {
    id: 'SZ-ITU-01',
    name: 'Itu Model Science Academy Safe Center',
    lga: 'Itu',
    type: 'School Facility',
    address: 'Calabar-Itu Highway, West Itam',
    capacity: 800,
    elevationMeters: 82,
    contactPhone: '0901 222 3344',
    isOpen: true,
  },
  {
    id: 'SZ-EKT-01',
    name: 'Eket Civic Auditorium Relief Center',
    lga: 'Eket',
    type: 'Civic Center',
    address: 'Grace Bill Road, Eket',
    capacity: 1500,
    elevationMeters: 45,
    contactPhone: '0802 777 6655',
    isOpen: true,
  },
  {
    id: 'SZ-ORN-01',
    name: 'Maritime Academy of Nigeria Upper Campus',
    lga: 'Oron',
    type: 'Medical Safe Haven',
    address: 'College Road, Oron',
    capacity: 1000,
    elevationMeters: 55,
    contactPhone: '0803 444 5566',
    isOpen: true,
  },
];

export const FLOOD_HOTLINES = [
  { agency: 'State Emergency Management Agency (SEMA AKS)', phone: '0803 000 1122' },
  { agency: 'AKSWMA Drainage Clearing Hotline', phone: '0909 888 7771' },
  { agency: 'Akwa Ibom Fire & Rescue Service', phone: '112 / 0802 333 4444' },
  { agency: 'Ministry of Environment Rapid Response', phone: '0814 555 6677' },
];
