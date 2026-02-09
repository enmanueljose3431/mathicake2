
export type Step = 'SIZE' | 'FLAVOR' | 'DECORATION' | 'PERSONALIZATION' | 'SUMMARY' | 'PAYMENT' | 'ADMIN_LOGIN' | 'ADMIN_PANEL';

export type HeightType = 'TALL' | 'SHORT';
export type DeliveryMethod = 'DELIVERY' | 'PICKUP';
export type CoverageType = 'chantilly' | 'chocolate' | 'arequipe';

export interface CakeColor {
  name: string;
  hex: string;
  isSaturated?: boolean;
}

export interface CakeSize {
  id: string;
  diameter: number;
  heightType: HeightType;
  portions: string;
  basePrice: number;
}

export interface Flavor {
  id: string;
  name: string;
  color: string;
  priceModifier: number;
  pattern?: string;
  textureUrl?: string;
}

export interface Filling {
  id: string;
  name: string;
  color: string;
  priceModifier: number;
  pattern?: string;
  textureUrl?: string;
}

export type DecorationStyle = 'liso' | 'vintage' | 'textura' | 'degradado';
export type TopperType = 'none' | 'generic' | 'personalized' | 'plus_pieces';

export interface DecorationInfo {
  id: DecorationStyle;
  label: string;
  priceModifier: number;
}

export interface PaymentDetails {
  bankName: string;
  accountHolder: string;
  zelleEmail: string;
  taxId: string;
  exchangeRateNote: string;
}

export interface AppTheme {
  brandName: string;
  whatsappNumber: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  surfaceColor: string;
}

export interface AppConfig {
  sizes: CakeSize[];
  flavors: Flavor[];
  fillings: Filling[];
  colors: CakeColor[];
  decorations: Record<string, DecorationInfo>;
  topperPrices: Record<string, number>;
  spheresPrice: number;
  saturatedColorSurcharge: number;
  coverageSurcharges: Record<string, number>;
  paymentDetails: PaymentDetails;
  appTheme: AppTheme;
}

export interface Order {
  id: string;
  date: string;
  customerName: string;
  details: string;
  total: number;
  status: 'PENDING' | 'COMPLETED';
}

export interface AppState {
  step: Step;
  selectedSize: CakeSize | null;
  selectedFlavor: Flavor | null;
  selectedFilling: Filling | null;
  selectedDecoration: DecorationStyle;
  cakeColors: string[];
  topperType: TopperType;
  hasSpheres: boolean;
  theme: string;
  birthdayName: string;
  birthdayAge: string;
  specialRequirements: string;
  referenceImage: string | null;
  paymentReference: string;
  amountBs: string;
  paymentProof: string | null;
  deliveryMethod: DeliveryMethod;
  deliveryDate: string;
  deliveryTime: string;
  coverageType: CoverageType;
  totalPrice: number;
  customFlavor: string;
  customFilling: string;
}
