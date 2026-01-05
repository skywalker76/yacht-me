// Boat Types
export type BoatType = 'motor_yacht_20m' | 'sailboat_14m' | 'dinghy' | 'jetski';

// Extra service pricing
export interface ExtraService {
  name: string;
  price: number;
  unit: 'day' | 'trip' | 'person';
}

export interface BoatFeatures {
  // Servizi base
  crew?: boolean;
  cabins?: number;
  bathrooms?: number;
  license_required?: boolean;

  // Navigazione e Sicurezza
  gps?: boolean;
  autopilot?: boolean;
  radar?: boolean;
  vhf_radio?: boolean;
  life_jackets?: boolean;

  // Comfort
  air_conditioning?: boolean;
  wifi?: boolean;
  generator?: boolean;
  watermaker?: boolean;
  heating?: boolean;

  // Intrattenimento
  tv?: boolean;
  stereo?: boolean;
  swimming_platform?: boolean;
  tender?: boolean;
  snorkeling_equipment?: boolean;

  [key: string]: boolean | number | string | undefined;
}

export interface Boat {
  id: string;
  name: string;
  name_en?: string | null;
  slug: string;
  type: BoatType;
  description: string | null;
  description_en?: string | null;
  price_full_day: number | null;
  price_half_day: number | null;
  capacity: number | null;
  length: string | null;
  image_url: string | null;
  gallery_urls: string[];
  features: BoatFeatures;
  is_featured: boolean;
  created_at: string;

  // Nuovi campi
  year?: number;
  refurbished_year?: number;
  location?: string;
  location_coords?: { lat: number; lng: number };
  highlights?: string[];
  included_services?: string[];
  excluded_services?: string[];
  extra_services?: ExtraService[];
  cancellation_policy?: string;
  engine_power?: string;
  fuel_consumption?: string;
}

// Booking Types
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Booking {
  id: string;
  boat_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  start_date: string;
  end_date: string;
  status: BookingStatus;
  notes: string | null;
  total_price: number | null;
  created_at: string;
  boat?: Boat;
}

export interface BookingFormData {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  start_date: string;
  end_date: string;
  notes?: string;
}

// Customer Types (CRM)
export type CustomerSource = 'manual' | 'booking' | 'website';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  notes: string | null;
  tags: string[];
  source: CustomerSource;
  total_spent: number;
  total_bookings: number;
  last_booking_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerFormData {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  tags?: string[];
}

// Article Types
export type ArticleCategory = 'blog' | 'escursioni' | 'news' | 'info';
export type ArticleStatus = 'draft' | 'published';

export interface Article {
  id: string;
  title: string;
  title_en?: string | null;
  slug: string;
  excerpt: string | null;
  excerpt_en?: string | null;
  content: string;
  content_en?: string | null;
  cover_image: string | null;
  category: ArticleCategory;
  status: ArticleStatus;
  author: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleFormData {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  cover_image?: string;
  category: ArticleCategory;
  status: ArticleStatus;
  author?: string;
}

export const ARTICLE_CATEGORY_LABELS: Record<ArticleCategory, string> = {
  blog: 'Blog',
  escursioni: 'Escursioni',
  news: 'Novità',
  info: 'Informazioni',
};

export const ARTICLE_STATUS_LABELS: Record<ArticleStatus, string> = {
  draft: 'Bozza',
  published: 'Pubblicato',
};

// Service Types
export interface Service {
  id: string;
  name: string;
  name_en?: string | null;
  slug: string;
  description: string | null;
  description_en?: string | null;
  features: string[];
  features_en?: string[];
  price_text: string | null;
  price_text_en?: string | null;
  icon: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceFormData {
  name: string;
  slug: string;
  description?: string;
  features?: string[];
  price_text?: string;
  icon?: string;
  image_url?: string;
  display_order?: number;
  is_active?: boolean;
}

// Navigation
export interface NavItem {
  label: string;
  href: string;
}

// Component Props
export interface FleetCardProps {
  boat: Boat;
  index?: number;
}

export interface HeroProps {
  title: string;
  subtitle?: string;
  backgroundImage: string;
  ctaText?: string;
  ctaHref?: string;
  showScroll?: boolean;
}

// Constants
export const BOAT_TYPE_LABELS: Record<BoatType, string> = {
  motor_yacht_20m: 'Motor Yacht 20m',
  sailboat_14m: 'Barca a Vela 14m',
  dinghy: 'Gommone',
  jetski: 'Moto d\'Acqua',
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'In Attesa',
  confirmed: 'Confermata',
  cancelled: 'Annullata',
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Flotta', href: '/fleet' },
  { label: 'Escursioni', href: '/escursioni' },
  { label: 'Servizi', href: '/services' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contatti', href: '/contact' },
];

