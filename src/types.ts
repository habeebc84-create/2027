export interface ProductSize {
  size: string;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  description: string;
  image: string;
  price: number;
  stock: number;
  type: string;
  grade: string;
  unit?: string;
  sizes?: ProductSize[];
  featured: boolean;
  enabled: boolean;
  specifications?: Record<string, string>;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  description: string;
  enabled?: boolean;
  order?: number;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  categories: string[];
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: string;
  active: boolean;
  createdAt?: string;
  dateBadge?: string;
  read?: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  active: boolean;
  cta?: string;
  link?: string;
  order?: number;
}

export interface SiteContent {
  businessName: string;
  tagline: string;
  heroHeading: string;
  heroSubheading: string;
  splashImage: string;
  heroImage: string;
  address: string;
  locationDetails: string;
  pincode: string;
  phone: string;
  whatsapp: string;
  businessHours: string;
  googleMapsEmbed: string;
  aboutStory: string;
  aboutExperience: string;
  services: SiteService[];
  galleryImages: GalleryImage[];
  frontPageImages: string[];
  maintenanceMode: boolean;
}

export interface SiteService {
  id: string;
  title: string;
  desc: string;
  icon: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  /** achievement | contract | certificate */
  kind: 'achievement' | 'contract' | 'certificate';
  date?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}

export interface OrderCustomer {
  name: string;
  mobile: string;
  email?: string;
  address: string;
  village?: string;
  mandal?: string;
  pincode?: string;
  landmark: string;
}

export interface Order {
  id: string;
  orderId: string;
  items: CartItem[];
  total: number;
  customer: OrderCustomer;
  paymentMode: string;
  deliveryNote: string;
  deliveryLocation: string;
  deliveryMethod: 'delivery' | 'pickup';
  deliveryCharge: number;
  handlingCharge: number;
  /** Customer-shared map link (Google Maps URL of the delivery spot). */
  customerLocation?: string;
  /** Owner-reviewed final delivery charge (Rs.) after seeing the shared location. */
  finalDeliveryCharge?: number;
  date: string;
  status: OrderStatus;
  timeline: OrderTimelineEvent[];
}

export type OrderStatus = 'placed' | 'confirmed' | 'processing' | 'ready_dispatch' | 'out_delivery' | 'delivered' | 'cancelled' | 'returned';

export interface OrderTimelineEvent {
  status: OrderStatus;
  date: string;
  note?: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  totalOrders: number;
  totalSpending: number;
  lastOrder: string;
  createdAt: string;
  addresses: { address: string; village?: string; mandal?: string; pincode?: string }[];
}

export interface TransportZone {
  id: string;
  name: string;
  mandal: string;
  charge: number;
  estimatedTime: string;
  enabled: boolean;
}

export interface ContentBlock {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  cta?: string;
  link?: string;
  active: boolean;
  type: 'hero' | 'banner' | 'promo' | 'announcement' | 'offer';
  schedule?: { start?: string; end?: string };
  order: number;
}

export interface TermsContent {
  id: string;
  title: string;
  content: string;
  lastUpdated: string;
}

export interface SiteSettings {
  businessName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  businessHours: string;
  gstNumber: string;
  logo: string;
}

export type AdminPage = 'overview' | 'analytics' | 'products' | 'categories' | 'orders' | 'customers' | 'content' | 'transport' | 'notifications' | 'terms' | 'security';

export type Page = 'home' | 'splash' | 'welcome-gate' | 'products' | 'product-detail' | 'services' | 'gallery' | 'about' | 'contact' | 'checkout' | 'order-success' | 'order-tracking' | 'admin-login' | 'admin' | 'terms';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export const ORDER_STATUSES: { key: OrderStatus; label: string; color: string }[] = [
  { key: 'placed', label: 'Order Placed', color: 'text-blue-400 bg-blue-500/20 border-blue-500/30' },
  { key: 'confirmed', label: 'Order Confirmed', color: 'text-indigo-400 bg-indigo-500/20 border-indigo-500/30' },
  { key: 'processing', label: 'Processing', color: 'text-amber-400 bg-amber-500/20 border-amber-500/30' },
  { key: 'ready_dispatch', label: 'Ready for Dispatch', color: 'text-orange-400 bg-orange-500/20 border-orange-500/30' },
  { key: 'out_delivery', label: 'Out for Delivery', color: 'text-purple-400 bg-purple-500/20 border-purple-500/30' },
  { key: 'delivered', label: 'Delivered', color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30' },
  { key: 'cancelled', label: 'Cancelled', color: 'text-rose-400 bg-rose-500/20 border-rose-500/30' },
  { key: 'returned', label: 'Returned', color: 'text-slate-400 bg-slate-500/20 border-slate-500/30' },
];

export const DEFAULT_TERMS: TermsContent[] = [
  { id: 'terms', title: 'Terms & Conditions', content: 'Welcome to HSN Cement & Steel. By accessing or using our website and services, you agree to be bound by these Terms and Conditions. All products are subject to availability. Prices may change without prior notice. Orders are subject to confirmation. Delivery times are estimates and not guaranteed. Payment must be completed before dispatch unless agreed otherwise for credit accounts. We reserve the right to refuse or cancel any order. Disputes shall be subject to the jurisdiction of courts in Andhra Pradesh, India.', lastUpdated: new Date().toISOString() },
  { id: 'privacy', title: 'Privacy Policy', content: 'HSN Cement & Steel respects your privacy. We collect personal information only to process orders and improve our services. Your data is stored securely and is not shared with third parties except as necessary for order fulfillment. We may use your contact information to communicate about orders, promotions, and service updates. You can request deletion of your data at any time by contacting us.', lastUpdated: new Date().toISOString() },
  { id: 'shipping', title: 'Shipping Policy', content: 'We offer delivery across Kalikiri and surrounding mandals in Annamayya District. Delivery charges vary by location and order size. Same-day delivery is available for orders placed before 2:00 PM. Bulk orders may require 1-2 business days for preparation. Self-pickup is available at our Kalikiri yard during business hours.', lastUpdated: new Date().toISOString() },
  { id: 'returns', title: 'Return Policy', content: 'Due to the nature of construction materials, returns are accepted only for damaged or defective products. Claims must be reported within 24 hours of delivery with photographic evidence. Cement bags opened or used cannot be returned. Steel products cut to custom lengths are non-returnable. Approved returns will be processed within 7 business days.', lastUpdated: new Date().toISOString() },
  { id: 'cancellation', title: 'Cancellation Policy', content: 'Orders can be cancelled before dispatch without any charge. Once dispatched, cancellation is not possible. For bulk orders, cancellation within 24 hours of confirmation may incur a 5% processing fee. Refunds for cancelled orders are processed within 5-7 business days.', lastUpdated: new Date().toISOString() },
  { id: 'payment', title: 'Payment Policy', content: 'We accept Cash on Delivery, UPI payments, bank transfers, and cheques (for verified contractors). All prices are inclusive of GST unless stated otherwise. Credit terms may be available for established contractors subject to approval. Outstanding balances must be cleared within 30 days.', lastUpdated: new Date().toISOString() },
];
