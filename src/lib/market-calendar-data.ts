export interface TraditionalMarket {
  id: string;
  name: string;
  lga: string;
  location: string;
  cycleDayIndex: number; // 0 to 7 corresponding to the 8-day rotation
  cycleDayName: string;
  specialtyProduce: string[];
  crowdLevel: 'High' | 'Very High' | 'Medium';
  tradingHours: string;
  isDailyPartial: boolean;
}

export interface CommodityPrice {
  id: string;
  item: string;
  localName: string;
  unit: string;
  currentAvgPriceNgn: number;
  prevWeekPriceNgn: number;
  priceTrend: 'UP' | 'DOWN' | 'STABLE';
  topMarketLocation: string;
  lastUpdated: string;
}

// The traditional 8-day market cycle in Ibibio/Annang land
export const TRADITIONAL_CYCLE_DAYS = [
  { index: 0, name: 'Fiongetok', meaning: 'Small Market Day, pre-harvest trades' },
  { index: 1, name: 'Fiong-Aran', meaning: 'Oil Day — peak palm oil & farm produce' },
  { index: 2, name: 'Edet', meaning: 'Main Commercial Trading Day' },
  { index: 3, name: 'Atim', meaning: 'High-Volume Agro Gathering' },
  { index: 4, name: 'Ekpene', meaning: 'Artisan & Craft Trading Day' },
  { index: 5, name: 'Uruabom', meaning: 'Big Grand Market Exchange' },
  { index: 6, name: 'Ederetim', meaning: 'Civic & Village Market Exchange' },
  { index: 7, name: 'Aqua-Edet', meaning: 'Great Festival Market Day' },
];

export const TRADITIONAL_MARKETS: TraditionalMarket[] = [
  {
    id: 'mkt-itam',
    name: 'Urua Itam (Itam Market)',
    lga: 'Itu / Uyo Boundary',
    location: 'Itam Junction, Calabar-Itu Highway',
    cycleDayIndex: 1,
    cycleDayName: 'Fiong-Aran',
    specialtyProduce: ['Food Stuffs in Bulk', 'Fresh Meat', 'Yam Tubers', 'Imported Textiles', 'Electronics'],
    crowdLevel: 'Very High',
    tradingHours: '6:00 AM - 7:00 PM',
    isDailyPartial: true,
  },
  {
    id: 'mkt-akpan-andem',
    name: 'Akpan Andem Market',
    lga: 'Uyo',
    location: 'Udo Umana / Johnson Street, Uyo',
    cycleDayIndex: 2,
    cycleDayName: 'Edet',
    specialtyProduce: ['Fresh Periwinkles (Mfi)', 'Afang & Waterleaf', 'Palm Oil', 'Smoked Fish', 'Boutique Wears'],
    crowdLevel: 'Very High',
    tradingHours: '6:30 AM - 8:00 PM',
    isDailyPartial: true,
  },
  {
    id: 'mkt-oron-beach',
    name: 'Oron Beach Crayfish & Seafood Market',
    lga: 'Oron',
    location: 'Oron Marine Jetty',
    cycleDayIndex: 5,
    cycleDayName: 'Uruabom',
    specialtyProduce: ['Crayfish Bags (Whole/Ground)', 'Giant Prawns', 'Smoked Barracuda', 'Fresh Crabs', 'Snails (Nnyin)'],
    crowdLevel: 'Very High',
    tradingHours: '5:00 AM - 6:30 PM',
    isDailyPartial: true,
  },
  {
    id: 'mkt-urua-anwa',
    name: 'Urua Anwa (Ikot Ekpene Central Market)',
    lga: 'Ikot Ekpene',
    location: 'Aba Road / Market Road, Ikot Ekpene',
    cycleDayIndex: 2,
    cycleDayName: 'Edet',
    specialtyProduce: ['Raffia Bags & Mats', 'Wood Carvings', 'Garri Yellow/White', 'Live Goats', 'Palm Wine'],
    crowdLevel: 'Very High',
    tradingHours: '7:00 AM - 7:00 PM',
    isDailyPartial: true,
  },
  {
    id: 'mkt-urua-kpokpo',
    name: 'Urua Kpokpo (Eket Main Market)',
    lga: 'Eket',
    location: 'Market Road, Eket Urban',
    cycleDayIndex: 3,
    cycleDayName: 'Atim',
    specialtyProduce: ['Fresh River Fish', 'Crayfish', 'Plantain Bunches', 'Vegetables', 'Cassava Flour'],
    crowdLevel: 'High',
    tradingHours: '7:00 AM - 6:30 PM',
    isDailyPartial: true,
  },
  {
    id: 'mkt-nung-udoe',
    name: 'Urua Nung Udoe',
    lga: 'Ibesikpo Asutan',
    location: 'Nung Udoe Roundabout',
    cycleDayIndex: 1,
    cycleDayName: 'Fiong-Aran',
    specialtyProduce: ['Fresh Palm Oil in 25L Cans', 'Live Poultry', 'Local Gin (Ufofop)', 'Bushmeat'],
    crowdLevel: 'High',
    tradingHours: '6:00 AM - 6:00 PM',
    isDailyPartial: false,
  },
  {
    id: 'mkt-ini-rice',
    name: 'Ini Rice & Grain Depot',
    lga: 'Ini',
    location: 'Odoro Ikpe Town',
    cycleDayIndex: 6,
    cycleDayName: 'Ederetim',
    specialtyProduce: ['Local Parboiled Rice (Ini Rice 50kg)', 'Cocoa Bags', 'Yam Stacks', 'Honey'],
    crowdLevel: 'Medium',
    tradingHours: '7:00 AM - 5:00 PM',
    isDailyPartial: false,
  },
  {
    id: 'mkt-ikot-abasi',
    name: 'Egbo Ibi Waterfront Market',
    lga: 'Ikot Abasi',
    location: 'Egbo Ibi Beach, Ikot Abasi',
    cycleDayIndex: 0,
    cycleDayName: 'Fiongetok',
    specialtyProduce: ['Fresh Brackish Tilapia', 'Mangrove Oysters', 'Periwinkle', 'Sea Salt'],
    crowdLevel: 'Medium',
    tradingHours: '6:00 AM - 4:30 PM',
    isDailyPartial: false,
  },
];

export const COMMODITY_PRICES: CommodityPrice[] = [
  {
    id: 'cmd-crayfish',
    item: 'Crayfish (Big Bag / Sack)',
    localName: 'Ubaak Uroŋ (Oron Crayfish)',
    unit: '1 Big Hessian Sack (~40kg)',
    currentAvgPriceNgn: 145000,
    prevWeekPriceNgn: 160000,
    priceTrend: 'DOWN',
    topMarketLocation: 'Oron Beach Seafood Market',
    lastUpdated: 'Today, 8:00 AM',
  },
  {
    id: 'cmd-palm-oil',
    item: 'Pure Red Palm Oil',
    localName: 'Aran Ise / Aran Ubok',
    unit: '25-Litre Yellow Keg',
    currentAvgPriceNgn: 38000,
    prevWeekPriceNgn: 36000,
    priceTrend: 'UP',
    topMarketLocation: 'Urua Nung Udoe / Urua Anwa',
    lastUpdated: 'Today, 9:30 AM',
  },
  {
    id: 'cmd-garri-white',
    item: 'White Garri (Crisp Dry)',
    localName: 'Iwa Usung (Garri)',
    unit: '1 Custard Bucket (4L)',
    currentAvgPriceNgn: 3200,
    prevWeekPriceNgn: 3400,
    priceTrend: 'DOWN',
    topMarketLocation: 'Urua Itam / Akpan Andem',
    lastUpdated: 'Today, 10:15 AM',
  },
  {
    id: 'cmd-garri-yellow',
    item: 'Yellow Garri (Palm Oil infused)',
    localName: 'Iwa Aran',
    unit: '1 Custard Bucket (4L)',
    currentAvgPriceNgn: 3500,
    prevWeekPriceNgn: 3600,
    priceTrend: 'DOWN',
    topMarketLocation: 'Urua Anwa, Ikot Ekpene',
    lastUpdated: 'Today, 10:15 AM',
  },
  {
    id: 'cmd-mfi',
    item: 'Shelled Periwinkles',
    localName: 'Mfi Akpan',
    unit: '1 Basin (Big)',
    currentAvgPriceNgn: 14000,
    prevWeekPriceNgn: 14000,
    priceTrend: 'STABLE',
    topMarketLocation: 'Akpan Andem Market, Uyo',
    lastUpdated: 'Today, 7:45 AM',
  },
  {
    id: 'cmd-afang',
    item: 'Fresh Wild Afang Leaves',
    localName: 'Ikong Afang',
    unit: '1 Big Bundle (Standard)',
    currentAvgPriceNgn: 2500,
    prevWeekPriceNgn: 2200,
    priceTrend: 'UP',
    topMarketLocation: 'Akpan Andem & Urua Itam',
    lastUpdated: 'Today, 9:00 AM',
  },
  {
    id: 'cmd-ini-rice',
    item: 'Stone-Free Ini Local Rice',
    localName: 'Edesi Ini',
    unit: '50kg Bag',
    currentAvgPriceNgn: 68000,
    prevWeekPriceNgn: 72000,
    priceTrend: 'DOWN',
    topMarketLocation: 'Ini Rice Processing Mill, Odoro Ikpe',
    lastUpdated: 'Yesterday',
  },
];

// Calculate which traditional day it is relative to a reference day
export function getTodaysTraditionalCycle(): { currentDay: typeof TRADITIONAL_CYCLE_DAYS[0]; todayMarkets: TraditionalMarket[] } {
  // Epoch reference day calculation
  const baseDate = new Date('2024-01-01T00:00:00Z').getTime();
  const today = new Date().getTime();
  const diffDays = Math.floor((today - baseDate) / (1000 * 60 * 60 * 24));
  const cycleIndex = (diffDays % 8 + 8) % 8;
  const currentDay = TRADITIONAL_CYCLE_DAYS[cycleIndex];
  const todayMarkets = TRADITIONAL_MARKETS.filter(m => m.cycleDayIndex === cycleIndex || m.isDailyPartial);

  return { currentDay, todayMarkets };
}
