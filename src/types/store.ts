export type ProductCategory =
  | 'Palazzo'
  | 'Pajama'
  | 'Woman Pants'
  | 'Leggings'
  | 'Trouser'
  | 'Kurtis'
  | 'Dresses';

export type SizeOption = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export type ThemePresetId = 'alabaster' | 'sandstone' | 'sage-linen' | 'rose-clay' | 'custom';

export interface ProductHighlights {
  styleId: string;
  color: string;
  pattern: string;
  fabric: string;
  fit: string;
  rise: string;
  length: string;
  occasion: string;
  pocket: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: ProductCategory;
  isBottomwear: boolean;
  price: number;
  mrp: number;
  badge?: 'Bestseller' | 'New Arrival' | 'Pure Mulmul' | 'Atelier Pick';
  vibeTag: string;
  rating: number;
  reviewsCount: number;
  sizes: SizeOption[];
  outOfStockSizes?: SizeOption[];
  /** 5 realistic human model angles */
  images: string[];
  angleLabels: string[];
  description: string;
  highlights: ProductHighlights;
  washCare: string[];
  pairWithIds: string[];
}

export interface BrandConfig {
  studioName: string;
  studioTagline: string;
  logoMode: 'monogram' | 'image';
  logoMonogram: string;
  logoImageUrl: string;
  heroHeadline: string;
  heroSubheadline: string;
  marqueePromo: string;
  addressLine1: string;
  addressLine2: string;
  cityStatePin: string;
  phone: string;
  whatsapp: string;
  supportEmail: string;
  instagramHandle: string;
  gstin: string;
  storeHours: string;
  freeShippingThreshold: number;
  prepaidExtraDiscountPct: number;
  themePreset: ThemePresetId;
  customToneA: string;
  customToneB: string;
}

export interface BagItem {
  productId: string;
  size: SizeOption;
  quantity: number;
  addedAt: number;
}

export type TelemetryEventType =
  | 'session_start'
  | 'category_select'
  | 'search_query'
  | 'search_zero_results'
  | 'filter_zero_results'
  | 'product_card_hover'
  | 'angle_scrub'
  | 'pdp_open'
  | 'pdp_dwell'
  | 'quick_view_open'
  | 'angle_compare_drag'
  | 'size_guide_open'
  | 'size_select'
  | 'size_hesitation'
  | 'missing_size_attempt'
  | 'pincode_check'
  | 'coupon_copy'
  | 'wishlist_toggle'
  | 'add_to_bag'
  | 'remove_from_bag'
  | 'bag_open'
  | 'checkout_start'
  | 'order_complete'
  | 'whatsapp_order_click'
  | 'scroll_depth'
  | 'rage_click'
  | 'theme_change'
  | 'studio_config_update';

export interface TelemetryEvent {
  id: string;
  sessionId: string;
  timestamp: number;
  type: TelemetryEventType;
  productId?: string;
  productTitle?: string;
  category?: string;
  value?: number;
  label?: string;
  metadata?: Record<string, string | number | boolean>;
  viewportWidth: number;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

export interface FrictionDiagnostic {
  id: string;
  severity: 'high' | 'medium' | 'opportunity';
  title: string;
  evidence: string;
  recommendation: string;
  affectedProductId?: string;
  metricCount: number;
}

export type DiagnosticInsight = FrictionDiagnostic;
