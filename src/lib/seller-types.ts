import * as z from 'zod';

export type SellerCategory =
  | 'farmer'
  | 'agro_processor'
  | 'fish_farmer'
  | 'poultry_farmer'
  | 'livestock_farmer'
  | 'seed_seller'
  | 'agro_input_dealer'
  | 'equipment_seller'
  | 'service_provider'
  | 'agri_business'
  | 'cooperative'
  | 'other';

export interface SellerTypeOption {
  id: SellerCategory;
  title: string;
  description: string;
  iconName: string;
  isProducer?: boolean;
}

export const SELLER_TYPES: SellerTypeOption[] = [
  {
    id: 'farmer',
    title: 'Farmer',
    description: 'Grow and sell raw agricultural crops, tubers, and fresh vegetables.',
    iconName: 'Sprout',
    isProducer: true,
  },
  {
    id: 'agro_processor',
    title: 'Agro Processor',
    description: 'Process raw farm harvest into garri, palm oil, flours, packaged spices, etc.',
    iconName: 'Factory',
    isProducer: true,
  },
  {
    id: 'fish_farmer',
    title: 'Fish Farmer',
    description: 'Sell live, smoked, or dried catfish, tilapia, and aquaculture products.',
    iconName: 'Fish',
    isProducer: true,
  },
  {
    id: 'poultry_farmer',
    title: 'Poultry Farmer',
    description: 'Sell broilers, layers, eggs, turkey, day-old chicks, and poultry feed.',
    iconName: 'Egg',
    isProducer: true,
  },
  {
    id: 'livestock_farmer',
    title: 'Livestock Farmer',
    description: 'Breed and trade goats, pigs, sheep, rabbits, and cattle.',
    iconName: 'Beef',
    isProducer: true,
  },
  {
    id: 'seed_seller',
    title: 'Seed / Seedling Seller',
    description: 'Provide certified seeds, hybrid suckers, oil palm seedlings, and stems.',
    iconName: 'TreePine',
  },
  {
    id: 'agro_input_dealer',
    title: 'Agro-input Dealer',
    description: 'Retail fertilizers, organic manure, crop enhancers, and agrochemicals.',
    iconName: 'FlaskConical',
  },
  {
    id: 'equipment_seller',
    title: 'Farm Equipment Seller',
    description: 'Sell or lease tractors, tillers, knapsack sprayers, processing mills & tools.',
    iconName: 'Wrench',
  },
  {
    id: 'service_provider',
    title: 'Agricultural Service Provider',
    description: 'Offer veterinary, land clearing, drone spraying, irrigation, or soil testing.',
    iconName: 'Briefcase',
  },
  {
    id: 'agri_business',
    title: 'Agricultural Business',
    description: 'Commercial agro-enterprise, commodity trading company, or export aggregate.',
    iconName: 'Building2',
  },
  {
    id: 'cooperative',
    title: 'Cooperative / Group',
    description: 'Farmer cluster, agricultural cooperative society, or union selling collectively.',
    iconName: 'Users',
  },
  {
    id: 'other',
    title: 'Other Merchant',
    description: 'Other verified agricultural trade or specialized food market enterprise.',
    iconName: 'Store',
  },
];

export type BusinessType =
  | 'Individual'
  | 'Partnership'
  | 'Cooperative'
  | 'Registered Company'
  | 'Family Business'
  | 'Other';

export const BUSINESS_TYPES: BusinessType[] = [
  'Individual',
  'Partnership',
  'Cooperative',
  'Registered Company',
  'Family Business',
  'Other',
];

export type FarmSizeUnit = 'Acres' | 'Hectares' | 'Plots';
export type FarmOwnership = 'Owned' | 'Leased' | 'Family Land' | 'Community Land' | 'Other';

export const PRODUCT_CATEGORIES = [
  {
    group: 'Crops',
    items: ['Cassava', 'Yam', 'Plantain', 'Maize', 'Rice', 'Vegetables (Waterleaf/Ugu)', 'Fruits', 'Cocoyam', 'Sweet Potato', 'Other Crop'],
  },
  {
    group: 'Fish & Aquaculture',
    items: ['Catfish (Live/Smoked)', 'Tilapia', 'Crayfish (Oron Special)', 'Periwinkle (Mfi)', 'Prawns/Crab', 'Other Fish'],
  },
  {
    group: 'Poultry',
    items: ['Broiler Chicken', 'Layer Chicken', 'Fresh Eggs (Crates)', 'Turkey', 'Duck/Guinea Fowl', 'Other Poultry'],
  },
  {
    group: 'Livestock',
    items: ['Goat', 'Sheep', 'Pig / Pork', 'Cattle', 'Rabbit', 'Snail', 'Other Livestock'],
  },
  {
    group: 'Agricultural Inputs',
    items: ['Certified Seeds', 'Seedlings & Suckers', 'Fertilizer & Organic Manure', 'Agrochemicals', 'Farm Implements & Tools'],
  },
  {
    group: 'Processed Products',
    items: ['Garri (Yellow/White)', 'Palm Oil (Pure AKS Red)', 'Groundnut Products', 'Cassava Flour / Fufu', 'Processed Pepper & Spices', 'Other Processed'],
  },
];

export const PRODUCT_UNITS = [
  'Kilogram',
  'Gram',
  'Bag (50kg)',
  'Bag (100kg)',
  'Basket',
  'Crate',
  'Tonne',
  'Litre',
  'Piece',
  'Tuber',
  'Bunch',
  'Bundle',
  'Carton',
  'Other',
] as const;

export type ProductUnit = (typeof PRODUCT_UNITS)[number];

export type ProductAvailability = 'Available Now' | 'Seasonal' | 'Currently Unavailable';

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  description: string;
  price: number;
  availableQuantity: number;
  unit: ProductUnit;
  minimumOrderQuantity: number;
  availability: ProductAvailability;
  images: string[];
}

export const AKWA_IBOM_31_LGAS = [
  'Abak',
  'Eastern Obolo',
  'Eket',
  'Esit Eket',
  'Essien Udim',
  'Etim Ekpo',
  'Etinan',
  'Ibeno',
  'Ibesikpo Asutan',
  'Ibiono Ibom',
  'Ika',
  'Ikono',
  'Ikot Abasi',
  'Ikot Ekpene',
  'Ini',
  'Itu',
  'Mbo',
  'Mkpat Enin',
  'Nsit Atai',
  'Nsit Ibom',
  'Nsit Ubium',
  'Obot Akara',
  'Okobo',
  'Onna',
  'Oron',
  'Oruk Anam',
  'Udung Uko',
  'Ukanafun',
  'Uruan',
  'Urue-Offong/Oruko',
  'Uyo',
] as const;

export type AkwaIbomLGA = (typeof AKWA_IBOM_31_LGAS)[number];

export type DeliveryOption = 'Seller Delivery' | 'Customer Pickup' | 'Marketplace Delivery' | 'Delivery + Pickup';
export type DeliveryCoverage = 'My Community' | 'My LGA' | 'Across Akwa Ibom State';

export type IdentificationType = "NIN" | "Voter's Card" | "Driver's Licence" | "International Passport";

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'REQUIRES_CHANGES';

export interface SellerOnboardingData {
  account: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    whatsapp: string;
    password?: string;
    confirmPassword?: string;
    userId?: string;
  };
  sellerTypes: SellerCategory[];
  business: {
    farmBusinessName: string;
    businessDescription: string;
    businessPhone: string;
    businessEmail: string;
    yearEstablished: number | string;
    businessType: BusinessType;
    cacNumber?: string;
    farmName?: string;
    farmSize?: number | string;
    farmSizeUnit?: FarmSizeUnit;
    farmOwnership?: FarmOwnership;
  };
  products: ProductItem[];
  location: {
    state: 'Akwa Ibom State';
    lga: AkwaIbomLGA | string;
    ward: string;
    communityVillage: string;
    farmBusinessAddress: string;
    landmark?: string;
    gpsCoordinates?: string;
  };
  delivery: {
    deliveryMethod: DeliveryOption;
    deliveryCoverage: DeliveryCoverage;
    pickupAddress: string;
    deliveryNotes?: string;
    estimatedDeliveryTime: string;
  };
  verification: {
    identificationType: IdentificationType;
    identificationNumber: string;
    profilePhotoUrl?: string;
    farmPhotoUrls?: string[];
    productPhotoUrls?: string[];
    proofOfOwnershipUrl?: string;
    businessDocumentUrl?: string;
  };
  confirmation: {
    infoAccurate: boolean;
    termsAgreed: boolean;
    understandsReview: boolean;
  };
}

export interface SellerApplicationRecord {
  id: string;
  applicationId: string;
  userId: string;
  sellerTypes: SellerCategory[];
  account: SellerOnboardingData['account'];
  business: SellerOnboardingData['business'];
  products: ProductItem[];
  location: SellerOnboardingData['location'];
  delivery: SellerOnboardingData['delivery'];
  verification: {
    identificationType: IdentificationType;
    identificationNumberMasked: string;
    profilePhotoUrl?: string;
    farmPhotoUrls?: string[];
    proofOfOwnershipUrl?: string;
    businessDocumentUrl?: string;
  };
  status: ApplicationStatus;
  submittedAt: any;
  updatedAt: any;
  reviewedAt?: any;
  reviewedBy?: string;
  rejectionReason?: string;
  changeRequest?: string;
  suspensionReason?: string;
  adminNotes?: string;
  merchantId?: string;
}

export interface SellerProfileRecord {
  id: string;
  merchantId: string;
  applicationId: string;
  userId: string;
  storeName: string;
  storeSlug: string;
  sellerTypes: SellerCategory[];
  description: string;
  phone: string;
  whatsapp: string;
  email: string;
  businessType: BusinessType;
  cacNumber?: string;
  farmSize?: string;
  location: {
    state: 'Akwa Ibom State';
    lga: string;
    community: string;
    address: string;
    landmark?: string;
  };
  delivery: {
    methods: DeliveryOption;
    coverage: DeliveryCoverage;
    pickupAddress: string;
    deliveryNotes?: string;
    estimatedTime: string;
  };
  logoUrl?: string;
  coverImageUrl?: string;
  isVerified: boolean;
  verifiedAt: any;
  rating: number;
  totalReviews: number;
  completedOrders: number;
  createdAt: any;
  updatedAt: any;
}

export function generateMerchantId(index = 1): string {
  const year = new Date().getFullYear();
  const padded = String(index).padStart(6, '0');
  return `AKM-${year}-${padded}`;
}

export function generateApplicationId(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `AKS-AGRO-${year}-${randomSuffix}`;
}

export const accountStepSchema = z.object({
  firstName: z.string().min(2, 'First name is required (at least 2 characters)'),
  lastName: z.string().min(2, 'Last name is required (at least 2 characters)'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid Nigerian phone number (e.g. 080... or +234...)'),
  whatsapp: z.string().min(10, 'Please enter your WhatsApp contact number'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
});

export const businessStepSchema = z.object({
  farmBusinessName: z.string().min(3, 'Farm or Business name must be at least 3 characters'),
  businessDescription: z.string().min(15, 'Please provide a descriptive overview of what you grow/produce (min 15 characters)'),
  businessPhone: z.string().min(10, 'Please enter a contact phone number for the farm/business'),
  businessEmail: z.string().email('Please provide a valid business/contact email'),
  yearEstablished: z.union([z.string(), z.number()]).refine((val) => {
    const num = Number(val);
    return num >= 1950 && num <= new Date().getFullYear();
  }, 'Year established must be between 1950 and current year'),
  businessType: z.string().min(1, 'Please select your business structure'),
  cacNumber: z.string().optional(),
  farmName: z.string().optional(),
  farmSize: z.union([z.string(), z.number()]).optional(),
  farmSizeUnit: z.string().optional(),
  farmOwnership: z.string().optional(),
});

export const singleProductSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  category: z.string().min(1, 'Product category is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(1, 'Price must be at least ₦1'),
  availableQuantity: z.number().min(0, 'Quantity cannot be negative'),
  unit: z.string().min(1, 'Please select a unit (e.g. Bag, Kg, Basket)'),
  minimumOrderQuantity: z.number().min(1, 'Minimum order quantity must be at least 1'),
  availability: z.enum(['Available Now', 'Seasonal', 'Currently Unavailable']),
  images: z.array(z.string()).optional(),
});

export const locationStepSchema = z.object({
  state: z.literal('Akwa Ibom State'),
  lga: z.string().min(1, 'Please select an Akwa Ibom Local Government Area'),
  ward: z.string().min(2, 'Ward name is required'),
  communityVillage: z.string().min(2, 'Community / Village name is required'),
  farmBusinessAddress: z.string().min(5, 'Physical farm/business address is required'),
  landmark: z.string().optional(),
  deliveryMethod: z.string().min(1, 'Please select how you deliver orders'),
  deliveryCoverage: z.string().min(1, 'Please select your delivery coverage'),
  pickupAddress: z.string().min(5, 'Please provide a pickup location for buyers/logistics'),
  estimatedDeliveryTime: z.string().min(2, 'Estimated delivery turnaround is required (e.g. Same day, 24-48 hours)'),
  deliveryNotes: z.string().optional(),
});

export const verificationStepSchema = z.object({
  identificationType: z.enum(["NIN", "Voter's Card", "Driver's Licence", "International Passport"]),
  identificationNumber: z.string().min(6, 'Please enter a valid identification number'),
});
