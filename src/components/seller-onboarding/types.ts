import { SellerOnboardingData, ProductItem } from '@/lib/seller-types';

export interface StepProps {
  data: SellerOnboardingData;
  updateData: (fields: Partial<SellerOnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  onSaveDraft?: () => void;
  savingDraft?: boolean;
}

export const INITIAL_ONBOARDING_DATA: SellerOnboardingData = {
  account: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    whatsapp: '',
    password: '',
    confirmPassword: '',
  },
  sellerTypes: [],
  business: {
    farmBusinessName: '',
    businessDescription: '',
    businessPhone: '',
    businessEmail: '',
    yearEstablished: new Date().getFullYear() - 2,
    businessType: 'Individual',
    cacNumber: '',
    farmName: '',
    farmSize: '',
    farmSizeUnit: 'Hectares',
    farmOwnership: 'Family Land',
  },
  products: [],
  location: {
    state: 'Akwa Ibom State',
    lga: 'Uyo',
    ward: '',
    communityVillage: '',
    farmBusinessAddress: '',
    landmark: '',
    gpsCoordinates: '',
  },
  delivery: {
    deliveryMethod: 'Delivery + Pickup',
    deliveryCoverage: 'Across Akwa Ibom State',
    pickupAddress: '',
    deliveryNotes: 'Farm-fresh harvest packaged in clean breathable crates/bags.',
    estimatedDeliveryTime: 'Within 24 hours of harvest confirmation',
  },
  verification: {
    identificationType: 'NIN',
    identificationNumber: '',
    profilePhotoUrl: '',
    farmPhotoUrls: [],
    productPhotoUrls: [],
    proofOfOwnershipUrl: '',
    businessDocumentUrl: '',
  },
  confirmation: {
    infoAccurate: false,
    termsAgreed: false,
    understandsReview: false,
  },
};
