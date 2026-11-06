import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import type { CartItem, Order, Product, Page, Toast, Customer, TransportZone, ContentBlock, Notification, Banner, SiteContent, Category, Brand, TermsContent, SiteSettings, OrderStatus, AdminPage, Achievement, MarketPrices } from '../types';
import { ORDER_STATUSES } from '../types';
import { products as defaultProducts, categories as defaultCategories, brands as defaultBrands, defaultNotifications, defaultSiteContent, defaultTransportZones, defaultBanners, defaultTerms, defaultMarketPrices } from '../data';
import { safeSaveSiteContent, compressImageFile } from '../lib/images';
import { pullRemoteContent, pushRemoteContent, fetchRemoteVersion, isCloudConfigured, getSupabaseClient } from '../lib/remoteContent';
import { fetchOrdersDb, insertOrderDb, updateOrderDb, deleteOrderDb, mergeDbOrders } from '../lib/ordersDb';
import { DEFAULT_LAUNCH_DATE_TIME } from '../lib/launch';
import { getAdminSessionEmail, signInAdmin, signOutAdmin, isAdminEmail } from '../lib/adminAuth';
import { mergeNotifications, notifSeenKey } from '../lib/notifSync';

interface AppContextType {
  currentPage: Page;
  setPage: (page: Page, orderId?: string) => void;
  trackingOrderId: string | undefined;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  products: Product[];
  addProduct: (p: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleProduct: (id: string) => void;
  categories: Category[];
  addCategory: (c: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  toggleCategory: (id: string) => void;
  brands: Brand[];
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, selectedSize?: string) => void;
  removeFromCart: (productId: string, selectedSize?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, selectedSize?: string) => void;
  cartTotal: number;
  cartCount: number;
  clearCart: () => void;
  orders: Order[];
  placeOrder: (order: Omit<Order, 'id' | 'date' | 'status' | 'timeline' | 'orderId'>) => string;
  setOrderFinalDeliveryCharge: (orderId: string, charge: number) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  deleteOrder: (orderId: string) => void;
  deleteCustomer: (customerId: string) => void;
  getOrderById: (orderId: string) => Order | undefined;
  /** Actively re-fetch the cloud copy (used by QR deep-links to load orders missing on this device). */
  refreshFromCloud: () => Promise<void>;
  customers: Customer[];
  transportZones: TransportZone[];
  addTransportZone: (z: TransportZone) => void;
  updateTransportZone: (id: string, updates: Partial<TransportZone>) => void;
  deleteTransportZone: (id: string) => void;
  marketPrices: MarketPrices;
  updateMarketPrices: (prices: Omit<MarketPrices, 'updatedAt'>) => void;
  achievements: Achievement[];
  addAchievement: (a: Achievement) => void;
  deleteAchievement: (id: string) => void;
  contentBlocks: ContentBlock[];
  addContentBlock: (b: ContentBlock) => void;
  updateContentBlock: (id: string, updates: Partial<ContentBlock>) => void;
  deleteContentBlock: (id: string) => void;
  toggleContentBlock: (id: string) => void;
  notifications: Notification[];
  addNotification: (n: Notification) => void;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
  deleteNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  /** Per-device "already shown to me" record for the public popup. Never synced. */
  isNotificationSeen: (n: Notification) => boolean;
  markNotificationSeen: (n: Notification) => void;
  banners: Banner[];
  siteContent: SiteContent;
  updateSiteContent: (updates: Partial<SiteContent>) => void;
  termsContent: TermsContent[];
  updateTermsContent: (id: string, content: string) => void;
  siteSettings: SiteSettings;
  updateSiteSettings: (updates: Partial<SiteSettings>) => void;
  isAdmin: boolean;
  loginAdmin: (email: string, password: string) => Promise<string | null>;
  logoutAdmin: () => void;
  adminPage: AdminPage;
  setAdminPage: (page: AdminPage) => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error') => void;
  splashDismissed: boolean;
  dismissSplash: () => void;
  /** Launching-soon poster flag: true = normal pages are covered by the poster. */
  launchingSoon: boolean;
  setLaunchingSoon: (value: boolean) => void;
  /** Opening date/time for the poster countdown (ISO string, IST offset). */
  launchDateTime: string;
  setLaunchDateTime: (value: string) => void;
  /** System-under-maintenance flag: true = normal visitors see only the
      maintenance page. The admin portal itself is never blocked. */
  maintenanceMode: boolean;
  setMaintenanceMode: (value: boolean) => void;
  /** Message shown to visitors on the maintenance page. */
  maintenanceMessage: string;
  setMaintenanceMessage: (value: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function load<T>(key: string, fallback: T): T {
  try {
    const r = localStorage.getItem(key);
    if (!r) return fallback;
    const v = JSON.parse(r) as unknown;
    // A stored literal "null" would otherwise become a null state and crash
    // every .filter/.map that touches it, blanking the whole site.
    if (v === null || v === undefined) return fallback;
    return v as T;
  } catch { return fallback; }
}
function save(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* */ }
}

function generateOrderId(): string {
  const year = new Date().getFullYear();
  const count = load<number>('hsn_order_count', 0) + 1;
  save('hsn_order_count', count);
  // BUILD 77 audit fix: the count is per-device localStorage, so the first
  // order on two different phones both became HSN-YYYY-00001 and tracking
  // (which matches by orderId) could show the wrong order. A time+random
  // suffix keeps the readable number but makes it unique across devices.
  const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`.toUpperCase();
  return `HSN-${year}-${String(count).padStart(5, '0')}-${suffix}`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => { const v = load<CartItem[]>('hsn_cart', []); return Array.isArray(v) ? v : []; });
  const [orders, setOrders] = useState<Order[]>(() => { const v = load<Order[]>('hsn_orders', []); return Array.isArray(v) ? v : []; });
  // BUILD 66: isAdmin comes ONLY from a Supabase Auth session. The old
  // localStorage flag (hsn_admin) is ignored and deleted on load — setting
  // it in the console no longer opens the admin panel.
  const [isAdmin, setIsAdmin] = useState(false);
  // Read inside callbacks that must not re-create on every auth change.
  const isAdminRef = useRef(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [trackingOrderId, setTrackingOrderId] = useState<string | undefined>(undefined);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [splashDismissed, setSplashDismissed] = useState(false);
  // Launching-soon poster: ON by default (BUILD 63) so normal visitors see
  // only the poster until the admin removes it or launch day arrives.
  const [launchingSoon, setLaunchingSoonState] = useState<boolean>(() => load<boolean>('hsn_launching_soon', true));
  const [adminPage, setAdminPage] = useState<AdminPage>('overview');

  const [products, setProducts] = useState<Product[]>(() => { const v = load<Product[]>('hsn_products', defaultProducts); return Array.isArray(v) ? v : defaultProducts; });
  const [categories, setCategories] = useState<Category[]>(() => { const v = load<Category[]>('hsn_categories', defaultCategories); return Array.isArray(v) ? v : defaultCategories; });
  const [brands] = useState<Brand[]>(() => { const v = load<Brand[]>('hsn_brands', defaultBrands); return Array.isArray(v) ? v : defaultBrands; });
  const [notifications, setNotifications] = useState<Notification[]>(() => { const v = load<Notification[]>('hsn_notifications', defaultNotifications); return Array.isArray(v) ? v : defaultNotifications; });
  // Per-device "seen" list (id@updatedAt) that drives the public popup only.
  // It is deliberately NOT cloud-synced: an announcement the admin reads on
  // the dashboard must still pop for a visitor on their own phone.
  const [seenNotificationKeys, setSeenNotificationKeys] = useState<string[]>(() => {
    const v = load<string[]>('hsn_notif_seen', []);
    return Array.isArray(v) ? v : [];
  });
  // Ids currently held in memory, so a cloud pull can tell which alerts are new.
  const notifIdsRef = useRef<Set<string>>(new Set(notifications.map(n => n.id)));
  const [siteContent, setSiteContent] = useState<SiteContent>(() => ({ ...defaultSiteContent, ...load('hsn_siteContent', {}) }));

  // Cloud sync refs: site content lives in a shared cloud copy so image changes
  // reach every browser/mobile instantly (localStorage alone is per-device).
  const lastPulledRawRef = useRef<string | null>(null);
  const remoteVersionRef = useRef<string | null>(null);
  const adminTouchedRef = useRef(false);
  const fromCloudRef = useRef(false);
  // Only genuine local edits (updateSiteContent) may push to the cloud —
  // never a visitor's initial localStorage state on page load.
  const localEditRef = useRef(false);
  // Orders intentionally deleted by the admin. Sent with every cloud snapshot
  // so other devices drop them too instead of re-merging them from stale cloud data.
  const deletedOrderIdsRef = useRef<Set<string>>(new Set());
  // Alerts intentionally deleted by the admin: same tombstone idea, so a
  // phone that still has the old alert in localStorage drops it for good.
  const deletedNotificationIdsRef = useRef<Set<string>>(new Set((() => {
    const v = load<string[]>('hsn_notif_deleted', []);
    return Array.isArray(v) ? v : [];
  })()));
  const setLaunchingSoon = useCallback((value: boolean) => {
    localEditRef.current = true; // push the flag to the cloud copy for all devices
    setLaunchingSoonState(value);
  }, []);
  const [launchDateTime, setLaunchDateTimeState] = useState<string>(() => load<string>('hsn_launch_date_time', DEFAULT_LAUNCH_DATE_TIME));
  const setLaunchDateTime = useCallback((value: string) => {
    localEditRef.current = true; // push the new opening date/time to all devices
    setLaunchDateTimeState(value);
  }, []);
  // BUILD 73: system-under-maintenance, admin-controlled, OFF by default.
  const [maintenanceMode, setMaintenanceModeState] = useState<boolean>(() => load<boolean>('hsn_maintenance_mode', false));
  const setMaintenanceMode = useCallback((value: boolean) => {
    localEditRef.current = true; // push the flag to the cloud copy for all devices
    setMaintenanceModeState(value);
  }, []);
  const [maintenanceMessage, setMaintenanceMessageState] = useState<string>(() => load<string>('hsn_maintenance_message', 'We are currently maintaining the system. Please check back soon.'));
  const setMaintenanceMessage = useCallback((value: string) => {
    localEditRef.current = true; // push the message to the cloud copy for all devices
    setMaintenanceMessageState(value);
  }, []);
  // Current orders, for the Postgres backfill (orders already on this device
  // are upserted into hsn_orders once the table exists).
  const ordersRef = useRef<Order[]>([]);
  useEffect(() => { ordersRef.current = orders; }, [orders]);
  const [banners] = useState<Banner[]>(() => { const v = load<Banner[]>('hsn_banners', defaultBanners); return Array.isArray(v) ? v : defaultBanners; });
  const [transportZones, setTransportZones] = useState<TransportZone[]>(() => { const v = load<TransportZone[]>('hsn_transportZones', defaultTransportZones); return Array.isArray(v) ? v : defaultTransportZones; });
  const [marketPrices, setMarketPrices] = useState<MarketPrices>(() => ({ ...defaultMarketPrices, ...load('hsn_marketPrices', {}) }));
  const [achievements, setAchievements] = useState<Achievement[]>(() => { const v = load<Achievement[]>('hsn_achievements', []); return Array.isArray(v) ? v : []; });
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>(() => { const v = load<ContentBlock[]>('hsn_contentBlocks', []); return Array.isArray(v) ? v : []; });
  const [termsContent, setTermsContent] = useState<TermsContent[]>(() => { const v = load<TermsContent[]>('hsn_terms', defaultTerms); return Array.isArray(v) ? v : defaultTerms; });
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => load('hsn_settings', {
    businessName: 'HSN CEMENT AND STEEL', phone: '7989494779', whatsapp: '+91 9179173040',
    email: 'habeebc84@gmail.com', address: 'Kalikiri, AP - 517234', businessHours: '7 AM - 7 PM Daily',
    gstNumber: '37AAAAA0000A1Z5', logo: '/windows-h-logo.png',
  }));
  const [customers, setCustomers] = useState<Customer[]>(() => { const v = load<Customer[]>('hsn_customers', []); return Array.isArray(v) ? v : []; });

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = `t-${Date.now()}-${Math.random()}`;
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 2500);
  }, []);

  /* One coalescing pusher for the shared cloud copy.
     Editing an alert, then marking it read, used to fire two overlapping
     uploads of the whole snapshot (~1.3MB with images) and the slower one
     could land last and win. Now bursts collapse into one push and only one
     push is ever in flight; anything that arrives meanwhile is pushed right
     after it, so every device still ends up with the newest state. */
  const pushTimerRef = useRef<number | null>(null);
  const pendingPushRef = useRef<unknown>(null);
  const pushInFlightRef = useRef(false);

  const runPush = useCallback(async () => {
    if (pushInFlightRef.current) return; // the finally block re-runs us
    const payload = pendingPushRef.current;
    if (!payload) return;
    pendingPushRef.current = null;
    pushInFlightRef.current = true;
    try {
      const version = await pushRemoteContent(payload);
      if (version) {
        remoteVersionRef.current = version;
        showToast('Saved — updating on all devices…');
      } else {
        showToast('Cloud sync failed — change stays on this device only', 'error');
      }
    } finally {
      pushInFlightRef.current = false;
      if (pendingPushRef.current) void runPush();
    }
  }, [showToast]);

  const schedulePush = useCallback((payload: unknown) => {
    pendingPushRef.current = payload;
    if (pushTimerRef.current !== null) window.clearTimeout(pushTimerRef.current);
    pushTimerRef.current = window.setTimeout(() => {
      pushTimerRef.current = null;
      void runPush();
    }, 350);
  }, [runPush]);

  useEffect(() => { save('hsn_launching_soon', launchingSoon); }, [launchingSoon]);
  useEffect(() => { save('hsn_launch_date_time', launchDateTime); }, [launchDateTime]);
  useEffect(() => { save('hsn_maintenance_mode', maintenanceMode); }, [maintenanceMode]);
  useEffect(() => { save('hsn_maintenance_message', maintenanceMessage); }, [maintenanceMessage]);
  useEffect(() => { save('hsn_cart', cart); }, [cart]);
  useEffect(() => { save('hsn_orders', orders); }, [orders]);
  useEffect(() => { save('hsn_products', products); }, [products]);
  useEffect(() => { save('hsn_categories', categories); }, [categories]);
  useEffect(() => { save('hsn_notifications', notifications); }, [notifications]);
  useEffect(() => { isAdminRef.current = isAdmin; }, [isAdmin]);
  useEffect(() => { save('hsn_notif_seen', seenNotificationKeys); }, [seenNotificationKeys]);
  // Tombstones are also kept in localStorage so the other tabs of the same
  // browser can drop a deleted alert instead of merging it back in.
  useEffect(() => { save('hsn_notif_deleted', [...deletedNotificationIdsRef.current]); }, [notifications]);
  useEffect(() => { notifIdsRef.current = new Set(notifications.map(n => n.id)); }, [notifications]);
  // Persist locally; push genuine local edits to the shared cloud copy.
  // Cloud-driven updates and plain page loads are never pushed, so visitors
  // can't clobber the shared copy with their own cached state.
  useEffect(() => {
    safeSaveSiteContent(siteContent);
    if (fromCloudRef.current) {
      fromCloudRef.current = false;
      if (!localEditRef.current) return;
      // Admin edit collided with a cloud update — re-push the merged state.
    } else if (!localEditRef.current) {
      return; // initial mount / non-edit change: leave the cloud copy alone
    }
    localEditRef.current = false;
    if (!isCloudConfigured()) return;
    adminTouchedRef.current = true;
    // Full admin snapshot: any admin change (images, settings, products,
    // categories, zones, content blocks, terms) reaches every device.
    const snapshot = {
      v: 2,
      siteContent,
      siteSettings,
      products,
      categories,
      transportZones,
      marketPrices,
      contentBlocks,
      terms: termsContent,
      achievements,
      orders,  // orders included so the owner sees location-shared orders on all devices
      deletedOrders: [...deletedOrderIdsRef.current], // tombstones: every device removes these for good
      launchingSoon, // launching-soon poster flag, so removing it opens every device
      launchDateTime, // opening date/time for the poster countdown
      maintenanceMode, // system-under-maintenance flag, so turning it on blocks every device
      maintenanceMessage, // message visitors see on the maintenance page
      notifications, // BUILD 65: admin announcements + contact inquiries now reach every device
      deletedNotifications: [...deletedNotificationIdsRef.current], // tombstones: every device drops deleted alerts
    };
    schedulePush(snapshot);
  }, [siteContent, siteSettings, products, categories, transportZones, marketPrices, contentBlocks, termsContent, achievements, orders, launchingSoon, launchDateTime, maintenanceMode, maintenanceMessage, notifications, schedulePush]);

  const applyCloudSnapshot = useCallback((json: Record<string, unknown>, raw: string, version?: string | null) => {
    lastPulledRawRef.current = raw;
    if (version) remoteVersionRef.current = version;
    fromCloudRef.current = true;
    // v2 snapshot: full admin state; legacy files hold siteContent only.
    const sc = (json.v === 2 ? json.siteContent : json) as Partial<SiteContent> | undefined;
    if (sc && typeof sc === 'object') {
      setSiteContent(prev => ({ ...prev, ...sc }));
    }
    if (json.v === 2) {
      // BUILD 70: never let a stale cloud pull revert a poster change the
      // admin just made in this session. If localEditRef is set, an admin
      // edit is pending / pushing — keep the local poster flag + date,
      // and let the push effect re-push that local value. Without this,
      // a 10s poll arriving between the admin's edit and the end of the
      // 1.3MB cloud upload overwrote the new date with the old cloud
      // date, so the poster timing looked like it never updated.
      if (!localEditRef.current) {
        if (typeof json.launchingSoon === 'boolean') setLaunchingSoonState(json.launchingSoon);
        if (typeof json.launchDateTime === 'string' && Number.isFinite(Date.parse(json.launchDateTime))) setLaunchDateTimeState(json.launchDateTime);
        // BUILD 73: same guard for maintenance — a stale cloud pull must
        // not revert a maintenance change the admin just made (BUILD 70
        // poster lesson, applied here from the start).
        if (typeof json.maintenanceMode === 'boolean') setMaintenanceModeState(json.maintenanceMode);
        if (typeof json.maintenanceMessage === 'string') setMaintenanceMessageState(json.maintenanceMessage);
      }
      // Alerts: FULL merge, not "add the new ones only". The old code just
      // appended unseen ids, so an alert that was edited, hidden, deleted or
      // marked read on another device kept showing its stale copy here — the
      // reason notification changes only ever appeared on the device that
      // made them. Now: tombstones remove, `updatedAt` decides the winner.
      if (Array.isArray(json.notifications)) {
        const cloudNotifs = (json.notifications as Notification[]).filter(n => n && n.id);
        const cloudDeleted = Array.isArray(json.deletedNotifications) ? json.deletedNotifications as string[] : [];
        // Adopt the cloud's tombstones so our own next push keeps them alive.
        for (const id of cloudDeleted) deletedNotificationIdsRef.current.add(id);
        const deleted = new Set<string>([...deletedNotificationIdsRef.current, ...cloudDeleted]);
        const fresh = cloudNotifs.filter(n => !deleted.has(n.id) && !notifIdsRef.current.has(n.id));
        setNotifications(prev => mergeNotifications(prev, cloudNotifs, deleted));
        // Signed-in admin: tell them the change landed on this device too, so
        // it is obvious that editing/publishing on one browser hits all of them.
        if (fresh.length > 0 && isAdminRef.current) {
          const label = fresh.length === 1 ? `New alert: ${fresh[0].title}` : `${fresh.length} new alerts synced to this device`;
          showToast(label);
        }
      }
      if (json.siteSettings && typeof json.siteSettings === 'object') setSiteSettings(json.siteSettings as SiteSettings);
      if (Array.isArray(json.products)) setProducts(json.products as Product[]);
      if (Array.isArray(json.categories)) setCategories(json.categories as Category[]);
      if (Array.isArray(json.transportZones)) setTransportZones(json.transportZones as TransportZone[]);
      if (json.marketPrices && typeof json.marketPrices === 'object') setMarketPrices(prev => ({ ...prev, ...(json.marketPrices as Partial<MarketPrices>) }));
      if (Array.isArray(json.contentBlocks)) setContentBlocks(json.contentBlocks as ContentBlock[]);
      if (Array.isArray(json.terms)) setTermsContent(json.terms as TermsContent[]);
      if (Array.isArray(json.achievements)) setAchievements(json.achievements as Achievement[]);
      // Orders: merge cloud orders — except ones the admin deleted
      // (tombstoned in deletedOrders), which are removed for good.
      // BUG FIX (was: only NEW cloud orders were added): an order that
      // already existed on this device kept its old status forever, so a
      // customer who had already placed/tracked an order never saw the
      // admin's status change. Now a cloud copy with a longer timeline
      // (a newer status) overwrites the local copy, so the tracking
      // page updates on the next 10s poll / focus pull.
      if (Array.isArray(json.orders)) {
        const cloudOrders = json.orders as Order[];
        const deletedIds = new Set(Array.isArray(json.deletedOrders) ? json.deletedOrders as string[] : []);
        setOrders(prev => {
          // Drop tombstoned orders locally so deletions win on every device.
          const survivors = prev.filter(o => !deletedIds.has(o.orderId));
          let changed = survivors.length !== prev.length;
          if (changed) { localEditRef.current = true; }
          const cloudById = new Map<string, Order>();
          const cloudByOrderId = new Map<string, Order>();
          for (const o of cloudOrders) { cloudById.set(o.id, o); cloudByOrderId.set(o.orderId, o); }
          const updated = survivors.map(local => {
            const cloud = cloudById.get(local.id) || cloudByOrderId.get(local.orderId);
            if (!cloud || deletedIds.has(cloud.orderId)) return local;
            const localLast = local.timeline?.[local.timeline.length - 1]?.date || '';
            const cloudLast = cloud.timeline?.[cloud.timeline.length - 1]?.date || '';
            const cloudIsNewer = (cloud.timeline?.length || 0) > (local.timeline?.length || 0)
              || (cloudLast && localLast && cloudLast > localLast);
            if (cloudIsNewer) { changed = true; return cloud; }
            return local;
          });
          const ids = new Set(updated.map(o => o.id));
          const orderIds = new Set(updated.map(o => o.orderId));
          const missing = cloudOrders.filter(o => !ids.has(o.id) && !orderIds.has(o.orderId) && !deletedIds.has(o.orderId));
          if (missing.length > 0) changed = true;
          if (!changed) return prev;
          const merged = [...updated, ...missing].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          save('hsn_orders', merged);
          return merged;
        });
      }
    }
  }, []);

  // Postgres orders: merge a fetched list into local orders, and upsert any
  // local order Postgres does not have yet (pre-migration backfill + retry
  // for an order whose first insert failed). A null fetch means the table
  // is not there yet — in that case do nothing and the JSON cloud sync
  // below keeps working exactly as before.
  const applyDbOrders = useCallback(async () => {
    const dbOrders = await fetchOrdersDb();
    if (dbOrders === null) return;
    const deletedIds = deletedOrderIdsRef.current;
    setOrders(prev => {
      const merged = mergeDbOrders(prev, dbOrders, deletedIds);
      save('hsn_orders', merged);
      return merged;
    });
    const dbIds = new Set(dbOrders.map(o => o.orderId));
    const missing = ordersRef.current.filter(o => !dbIds.has(o.orderId) && !deletedIds.has(o.orderId));
    if (missing.length > 0) {
      await Promise.all(missing.map(o => insertOrderDb(o)));
    }
  }, []);

  // Postgres poll: like the JSON version poll, but for orders only. Runs
  // every 20s and on tab focus, so an admin status change reaches the
  // customer's tracking page even if the JSON cloud copy is stale.
  useEffect(() => {
    if (!isCloudConfigured()) return;
    void applyDbOrders();
    const iv = setInterval(() => { void applyDbOrders(); }, 20000);
    const onVisible = () => { if (document.visibilityState === 'visible') void applyDbOrders(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      clearInterval(iv);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [applyDbOrders]);

  // First load: pull the latest shared content from the cloud.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { content, fromCloud } = await pullRemoteContent();
      if (cancelled || !fromCloud || !content) return;
      // If the admin already edited during load, keep their edit (it will push
      // and win) — do not let the initial pull race it back.
      if (adminTouchedRef.current) return;
      const raw = JSON.stringify(content);
      if (raw !== lastPulledRawRef.current) {
        applyCloudSnapshot(content, raw);
      }
    })();
    return () => { cancelled = true; };
  }, [applyCloudSnapshot]);

  // Keep every open tab/device in near-realtime: poll a tiny version marker
  // (bytes, not megabytes) every 10s, and immediately when the tab regains focus.
  useEffect(() => {
    if (!isCloudConfigured()) return;
    let inFlight = false;
    const check = async () => {
      if (inFlight || document.visibilityState !== 'visible') return;
      inFlight = true;
      try {
        const version = await fetchRemoteVersion();
        if (!version || version === remoteVersionRef.current) return;
        remoteVersionRef.current = version;
        const { content, fromCloud } = await pullRemoteContent();
        if (!fromCloud || !content) return;
        const raw = JSON.stringify(content);
        if (raw !== lastPulledRawRef.current) {
          applyCloudSnapshot(content, raw, version);
        }
      } finally {
        inFlight = false;
      }
    };
    // 5s (was 10s): an alert published on one device reaches open browsers
    // on other devices twice as fast. The check is a tiny version file, so
    // the extra request is cheap; the full JSON is only pulled when it moves.
    const iv = setInterval(check, 5000);
    const onVisible = () => { if (document.visibilityState === 'visible') void check(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      clearInterval(iv);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [applyCloudSnapshot]);
  // Same browser, several tabs/windows: a localStorage write fires `storage`
  // in every OTHER tab, so an alert published/edited/read/deleted in one
  // Chrome tab (or window) appears in the rest instantly — no reload, no
  // waiting for the cloud poll. Cross-device sync is the cloud pull below.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'hsn_notif_deleted') {
        try {
          const ids = JSON.parse(e.newValue || '[]') as string[];
          if (Array.isArray(ids)) for (const id of ids) deletedNotificationIdsRef.current.add(id);
        } catch { /* ignore malformed */ }
        return;
      }
      if (e.key !== 'hsn_notifications' || !e.newValue) return;
      try {
        const incoming = JSON.parse(e.newValue) as Notification[];
        if (!Array.isArray(incoming)) return;
        const localDeleted = load<string[]>('hsn_notif_deleted', []);
        if (Array.isArray(localDeleted)) for (const id of localDeleted) deletedNotificationIdsRef.current.add(id);
        setNotifications(prev => mergeNotifications(prev, incoming, deletedNotificationIdsRef.current));
      } catch { /* ignore malformed */ }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => { save('hsn_transportZones', transportZones); }, [transportZones]);
  useEffect(() => { save('hsn_marketPrices', marketPrices); }, [marketPrices]);
  useEffect(() => { save('hsn_achievements', achievements); }, [achievements]);
  useEffect(() => { save('hsn_contentBlocks', contentBlocks); }, [contentBlocks]);
  useEffect(() => { save('hsn_terms', termsContent); }, [termsContent]);
  useEffect(() => { save('hsn_settings', siteSettings); }, [siteSettings]);
  useEffect(() => { save('hsn_customers', customers); }, [customers]);


  const setPage = useCallback((page: Page, orderId?: string) => {
    setCurrentPage(page);
    if (page === 'order-tracking') setTrackingOrderId(orderId);
    const rm: Record<Page, string> = {
      home: '/', splash: '/splash', 'welcome-gate': '/', products: '/products', 'product-detail': '/product',
      services: '/services', gallery: '/gallery',
      contact: '/contact', checkout: '/checkout', 'order-success': '/order-success', 'order-tracking': '/track-order',
      terms: '/terms', 'admin-login': '/manage-portal-9f3a', admin: '/manage-portal-9f3a',
    };
    // Deep-linkable pages keep their id in the URL (QR codes link to /track-order/<orderId>).
    const path = rm[page] + ((page === 'order-tracking' || page === 'order-success') && orderId ? `/${orderId}` : '');
    if (window.location.pathname !== path) window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const dismissSplash = useCallback(() => {
    setSplashDismissed(true);
    try { localStorage.setItem('hsn_splash_dismissed', 'true'); } catch { /* storage blocked/full: entering must still work */ }
  }, []);

  // BUILD 77 audit fix: the admin add/edit form only checked name/brand,
  // so a negative or garbage price/stock could be saved and then shown to
  // visitors (and could make a total negative). Clamp here so both the
  // add and edit paths are covered, whatever the form passes.
  const cleanProduct = (p: Product): Product => ({
    ...p,
    price: Math.max(0, Number(p.price) || 0),
    stock: Math.max(0, Math.floor(Number(p.stock) || 0)),
    sizes: p.sizes ? p.sizes.map(s => ({ ...s, price: Math.max(0, Number(s.price) || 0), stock: Math.max(0, Math.floor(Number(s.stock) || 0)) })) : p.sizes,
  });
  const cleanProductUpdates = (u: Partial<Product>): Partial<Product> => ({
    ...u,
    ...(u.price !== undefined ? { price: Math.max(0, Number(u.price) || 0) } : {}),
    ...(u.stock !== undefined ? { stock: Math.max(0, Math.floor(Number(u.stock) || 0)) } : {}),
    ...(u.sizes ? { sizes: u.sizes.map(s => ({ ...s, price: Math.max(0, Number(s.price) || 0), stock: Math.max(0, Math.floor(Number(s.stock) || 0)) })) } : {}),
  });
  const addProduct = useCallback((p: Product) => { localEditRef.current = true; setProducts(prev => [...prev, cleanProduct(p)]); showToast('Product added'); }, [showToast]);
  const updateProduct = useCallback((id: string, updates: Partial<Product>) => { localEditRef.current = true; setProducts(prev => prev.map(p => p.id === id ? { ...p, ...cleanProductUpdates(updates) } : p)); showToast('Product updated'); }, [showToast]);
  const deleteProduct = useCallback((id: string) => { localEditRef.current = true; setProducts(prev => prev.filter(p => p.id !== id)); showToast('Product deleted'); }, [showToast]);
  const toggleProduct = useCallback((id: string) => { localEditRef.current = true; setProducts(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p)); }, []);

  const addCategory = useCallback((c: Category) => { localEditRef.current = true; setCategories(prev => [...prev, c]); showToast('Category added'); }, [showToast]);
  const updateCategory = useCallback((id: string, updates: Partial<Category>) => { localEditRef.current = true; setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c)); showToast('Category updated'); }, [showToast]);
  const deleteCategory = useCallback((id: string) => { localEditRef.current = true; setCategories(prev => prev.filter(c => c.id !== id)); showToast('Category deleted'); }, [showToast]);
  const toggleCategory = useCallback((id: string) => { localEditRef.current = true; setCategories(prev => prev.map(c => c.id === id ? { ...c, enabled: c.enabled === false ? true : false } : c)); }, []);

  const addAchievement = useCallback((a: Achievement) => { localEditRef.current = true; setAchievements(prev => [a, ...prev]); showToast('Added to gallery'); }, [showToast]);
  const deleteAchievement = useCallback((id: string) => { localEditRef.current = true; setAchievements(prev => prev.filter(a => a.id !== id)); showToast('Removed'); }, [showToast]);

  const addToCart = useCallback((product: Product, quantity: number, selectedSize?: string) => {
    const qty = Math.max(1, Math.floor(quantity) || 1);
    setCart(prev => {
      const ex = prev.find(i => i.product.id === product.id && i.selectedSize === selectedSize);
      if (ex) return prev.map(i => i.product.id === product.id && i.selectedSize === selectedSize ? { ...i, quantity: i.quantity + qty } : i);
      return [...prev, { product, quantity: qty, selectedSize }];
    });
    showToast(`Added "${product.name}" to cart`);
  }, [showToast]);

  const removeFromCart = useCallback((productId: string, selectedSize?: string) => {
    setCart(prev => prev.filter(i => !(i.product.id === productId && i.selectedSize === selectedSize)));
  }, []);

  const updateCartQuantity = useCallback((productId: string, quantity: number, selectedSize?: string) => {
    if (quantity <= 0) { removeFromCart(productId, selectedSize); return; }
    // BUILD 77 audit fix: the drawer +/- buttons had no stock cap, so a
    // cart quantity could exceed stock even though product cards cap adds.
    setCart(prev => prev.map(i => {
      if (i.product.id !== productId || i.selectedSize !== selectedSize) return i;
      const sizeData = selectedSize && i.product.sizes ? i.product.sizes.find(s => s.size === selectedSize) : undefined;
      const maxStock = sizeData ? sizeData.stock : i.product.stock;
      return { ...i, quantity: maxStock > 0 ? Math.min(quantity, maxStock) : quantity };
    }));
  }, [removeFromCart]);

  const cartTotal = cart.reduce((t, item) => {
    let price = item.product.price;
    if (item.selectedSize && item.product.sizes) {
      const s = item.product.sizes.find(sz => sz.size === item.selectedSize);
      if (s) price = s.price;
    }
    return t + price * item.quantity;
  }, 0);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const clearCart = useCallback(() => { setCart([]); save('hsn_cart', []); }, []);

  const placeOrder = useCallback((data: Omit<Order, 'id' | 'date' | 'status' | 'timeline' | 'orderId'>) => {
    const orderId = generateOrderId();
    const order: Order = {
      ...data, id: `order-${Date.now()}`, orderId, date: new Date().toISOString(),
      status: 'placed', timeline: [{ status: 'placed', date: new Date().toISOString() }],
    };
    setOrders(prev => { const u = [order, ...prev]; save('hsn_orders', u); return u; });
    void insertOrderDb(order); // Postgres when the table exists; no-op otherwise
    const n: Notification = {
      id: `notif-${Date.now()}`, title: `New Order: ${orderId}`,
      content: `${data.customer.name} placed an order of Rs.${data.total.toLocaleString('en-IN')}`,
      type: 'order', active: true, read: false, createdAt: new Date().toISOString(),
    };
    setNotifications(prev => { const u = [n, ...prev]; save('hsn_notifications', u); return u; });
    setCustomers(prev => {
      const existing = prev.find(c => c.mobile === data.customer.mobile);
      if (existing) {
        const updated = prev.map(c => c.mobile === data.customer.mobile ? {
          ...c, name: data.customer.name, email: data.customer.email || c.email,
          totalOrders: c.totalOrders + 1, totalSpending: c.totalSpending + data.total, lastOrder: new Date().toISOString(),
        } : c);
        save('hsn_customers', updated);
        return updated;
      }
      const nc: Customer = {
        id: `cust-${Date.now()}`, name: data.customer.name, mobile: data.customer.mobile,
        email: data.customer.email || '', totalOrders: 1, totalSpending: data.total,
        lastOrder: new Date().toISOString(), createdAt: new Date().toISOString(),
        addresses: [{ address: data.customer.address, village: data.customer.village, mandal: data.customer.mandal, pincode: data.customer.pincode }],
      };
      const u = [...prev, nc];
      save('hsn_customers', u);
      return u;
    });
    clearCart();
    showToast(`Order ${orderId} placed successfully!`);
    // Customer orders with a shared location reach the owner's other devices too.
    localEditRef.current = true;
    return orderId; // BUILD 65: Checkout uses this id, instead of computing
    // its own from the counter — the two could drift and the success page
    // would then open an order that does not exist.
  }, [clearCart, showToast]);

  /** Owner review: set the final delivery charge after seeing the shared location. */
  const setOrderFinalDeliveryCharge = useCallback((orderId: string, charge: number) => {
    if (!Number.isFinite(charge) || charge < 0) { showToast('Delivery charge cannot be negative', 'error'); return; }
    localEditRef.current = true;
    let dbOrder: Order | undefined;
    setOrders(prev => {
      const u = prev.map(o => {
        if (o.orderId !== orderId) return o;
        const updated = { ...o, finalDeliveryCharge: charge };
        dbOrder = updated;
        return updated;
      });
      save('hsn_orders', u);
      return u;
    });
    if (dbOrder) void updateOrderDb(dbOrder);
    showToast(`Final delivery charge saved for ${orderId}`);
  }, [showToast]);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus, note?: string) => {
    // BUG FIX (was: status changes never left this device): unlike
    // deleteOrder / setOrderFinalDeliveryCharge, this never set
    // localEditRef, so the cloud-push effect below skipped it and the
    // customer on another device never saw the new status. Setting the
    // flag makes the change push to the shared cloud copy, which the
    // customer's device polls every 10s (and on focus).
    localEditRef.current = true;
    let dbOrder: Order | undefined;
    setOrders(prev => {
      const updated = prev.map(o => {
        if (o.orderId !== orderId) return o;
        const changed = { ...o, status, timeline: [...o.timeline, { status, date: new Date().toISOString(), note }] };
        dbOrder = changed;
        return changed;
      });
      save('hsn_orders', updated);
      return updated;
    });
    if (dbOrder) void updateOrderDb(dbOrder);
    showToast(`Order ${orderId} updated to ${ORDER_STATUSES.find(s => s.key === status)?.label || status}`);
  }, [showToast]);

  const deleteOrder = useCallback((orderId: string) => {
    localEditRef.current = true; // propagate the deletion to the cloud snapshot
    deletedOrderIdsRef.current = new Set([...deletedOrderIdsRef.current, orderId]);
    setOrders(prev => {
      const u = prev.filter(o => o.orderId !== orderId);
      save('hsn_orders', u);
      return u;
    });
    void deleteOrderDb(orderId);
    showToast('Order deleted — removing from all devices…');
  }, [showToast]);
  const deleteCustomer = useCallback((customerId: string) => { setCustomers(prev => { const u = prev.filter(c => c.id !== customerId); save('hsn_customers', u); return u; }); showToast('Customer deleted'); }, [showToast]);
  // QR scans land here from arbitrary scanner apps: match the order ID
  // tolerantly (trim, case-insensitive, URL-decoded) so the correct order
  // always opens.
  const getOrderById = useCallback((orderId: string) => {
    const raw = (orderId || '').trim();
    if (!raw) return undefined;
    let wanted = raw.toLowerCase();
    try { wanted = decodeURIComponent(wanted); } catch { /* keep raw */ }
    return orders.find(o => o.orderId.toLowerCase() === wanted || o.id.toLowerCase() === wanted);
  }, [orders]);

  /** Actively re-fetch the shared cloud copy so QR deep-links can load orders missing on this device. */
  const refreshFromCloud = useCallback(async () => {
    if (!isCloudConfigured()) return;
    await applyDbOrders();
    const { content, fromCloud } = await pullRemoteContent();
    if (!fromCloud || !content) return;
    const raw = JSON.stringify(content);
    if (raw !== lastPulledRawRef.current) applyCloudSnapshot(content, raw);
  }, [applyCloudSnapshot, applyDbOrders]);

  const addTransportZone = useCallback((z: TransportZone) => { localEditRef.current = true; setTransportZones(prev => [...prev, z]); showToast('Zone added'); }, [showToast]);
  const updateTransportZone = useCallback((id: string, updates: Partial<TransportZone>) => { localEditRef.current = true; setTransportZones(prev => prev.map(z => z.id === id ? { ...z, ...updates } : z)); showToast('Zone updated'); }, [showToast]);
  const deleteTransportZone = useCallback((id: string) => { localEditRef.current = true; setTransportZones(prev => prev.filter(z => z.id !== id)); showToast('Zone deleted'); }, [showToast]);

  const updateMarketPrices = useCallback((prices: Omit<MarketPrices, 'updatedAt'>) => { localEditRef.current = true; setMarketPrices({ cement: prices.cement, steel: prices.steel, updatedAt: new Date().toISOString() }); showToast('Market prices updated'); }, [showToast]);

  const addContentBlock = useCallback((b: ContentBlock) => { localEditRef.current = true; setContentBlocks(prev => [...prev, b]); showToast('Content added'); }, [showToast]);
  const updateContentBlock = useCallback((id: string, updates: Partial<ContentBlock>) => { localEditRef.current = true; setContentBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b)); showToast('Content updated'); }, [showToast]);
  const deleteContentBlock = useCallback((id: string) => { localEditRef.current = true; setContentBlocks(prev => prev.filter(b => b.id !== id)); showToast('Content deleted'); }, [showToast]);
  const toggleContentBlock = useCallback((id: string) => { localEditRef.current = true; setContentBlocks(prev => prev.map(b => b.id === id ? { ...b, active: !b.active } : b)); }, []);

  /* Every notification mutation below sets localEditRef, so the cloud-push
     effect actually ships the change; without it the edit stopped at this
     device (the old behaviour for edit / hide / delete / mark-read). Each one
     also stamps `updatedAt`, which is what lets other devices pick the newer
     copy instead of keeping their stale one. */
  const addNotification = useCallback((n: Notification) => {
    localEditRef.current = true; // notifications sync to the cloud for every device
    const fresh = { ...n, updatedAt: n.updatedAt || new Date().toISOString() };
    setNotifications(prev => { const u = [fresh, ...prev]; save('hsn_notifications', u); return u; });
  }, []);
  const updateNotification = useCallback((id: string, updates: Partial<Notification>) => {
    localEditRef.current = true;
    setNotifications(prev => {
      const u = prev.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n);
      save('hsn_notifications', u);
      return u;
    });
    showToast('Notification updated');
  }, [showToast]);
  const deleteNotification = useCallback((id: string) => {
    localEditRef.current = true;
    deletedNotificationIdsRef.current.add(id); // tombstone so no device resurrects it
    setNotifications(prev => { const u = prev.filter(n => n.id !== id); save('hsn_notifications', u); return u; });
    showToast('Notification deleted');
  }, [showToast]);
  const markNotificationRead = useCallback((id: string) => {
    localEditRef.current = true;
    setNotifications(prev => {
      // Do not stamp `updatedAt` on read: that would let a read flag beat a
      // newer edit made on another device. `readAt` keeps them independent.
      const u = prev.map(n => n.id === id ? { ...n, read: true } : n);
      save('hsn_notifications', u);
      return u;
    });
  }, []);
  const clearNotifications = useCallback(() => {
    localEditRef.current = true;
    setNotifications(prev => { const u = prev.map(n => ({ ...n, read: true })); save('hsn_notifications', u); return u; });
  }, []);

  // Public popup bookkeeping, per device only.
  const isNotificationSeen = useCallback((n: Notification) => seenNotificationKeys.includes(notifSeenKey(n)), [seenNotificationKeys]);
  const markNotificationSeen = useCallback((n: Notification) => {
    const key = notifSeenKey(n);
    setSeenNotificationKeys(prev => (prev.includes(key) ? prev : [...prev, key]));
  }, []);

  const updateSiteContent = useCallback((updates: Partial<SiteContent>) => {
    // Mark every state change from this call (including async compression
    // follow-ups) as a genuine local edit so the final state is pushed to cloud.
    localEditRef.current = true;
    // Compress raw image uploads so localStorage never overflows — large 8K PNGs
    // stored raw silently break persistence across browsers.
    const compress = async (dataUrl: string): Promise<string> => {
      // Already small enough (e.g. pre-compressed at upload) — keep as-is.
      if (dataUrl.length < 400 * 1024) return dataUrl;
      try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const compressed = await compressImageFile(new File([blob], 'img', { type: blob.type || 'image/png' }));
        return compressed || dataUrl;
      } catch {
        return dataUrl;
      }
    };
    const pending: Promise<void>[] = [];
    if (typeof updates.heroImage === 'string' && updates.heroImage.startsWith('data:image/')) {
      const orig = updates.heroImage;
      pending.push(compress(orig).then(c => { if (c !== orig) { localEditRef.current = true; setSiteContent(p => ({ ...p, heroImage: c })); } }));
    }
    if (typeof updates.splashImage === 'string' && updates.splashImage.startsWith('data:image/')) {
      const orig = updates.splashImage;
      pending.push(compress(orig).then(c => { if (c !== orig) { localEditRef.current = true; setSiteContent(p => ({ ...p, splashImage: c })); } }));
    }
    if (updates.frontPageImages?.some(i => typeof i === 'string' && i.startsWith('data:image/'))) {
      Promise.all(updates.frontPageImages.map(async i => {
        if (typeof i === 'string' && i.startsWith('data:image/')) {
          const c = await compress(i);
          return c;
        }
        return i;
      })).then(arr => { localEditRef.current = true; setSiteContent(p => ({ ...p, frontPageImages: arr })); });
    }
    if (updates.splashMobileImages?.some(i => typeof i === 'string' && i.startsWith('data:image/'))) {
      Promise.all(updates.splashMobileImages.map(async i => {
        if (typeof i === 'string' && i.startsWith('data:image/')) {
          const c = await compress(i);
          return c;
        }
        return i;
      })).then(arr => { localEditRef.current = true; setSiteContent(p => ({ ...p, splashMobileImages: arr })); });
    }
    if (updates.splashLaptopImages?.some(i => typeof i === 'string' && i.startsWith('data:image/'))) {
      Promise.all(updates.splashLaptopImages.map(async i => {
        if (typeof i === 'string' && i.startsWith('data:image/')) {
          const c = await compress(i);
          return c;
        }
        return i;
      })).then(arr => { localEditRef.current = true; setSiteContent(p => ({ ...p, splashLaptopImages: arr })); });
    }
    setSiteContent(prev => ({ ...prev, ...updates }));
    Promise.all(pending).catch(() => {});
    showToast('Site content updated');
  }, [showToast]);
  const updateTermsContent = useCallback((id: string, content: string) => { localEditRef.current = true; setTermsContent(prev => prev.map(t => t.id === id ? { ...t, content, lastUpdated: new Date().toISOString() } : t)); showToast('Terms updated'); }, [showToast]);
  const updateSiteSettings = useCallback((updates: Partial<SiteSettings>) => { localEditRef.current = true; setSiteSettings(prev => ({ ...prev, ...updates })); showToast('Settings updated'); }, [showToast]);

  // Restore a Supabase Auth admin session on load, and follow sign-in /
  // sign-out events. This runs once; the session itself is stored by
  // Supabase as a signed JWT, not as a flag this app trusts on sight.
  useEffect(() => {
    try {
      localStorage.removeItem('hsn_admin');
      localStorage.removeItem('hsn_admin_password');
      localStorage.removeItem('hsn_admin_password_hash');
    } catch { /* storage unavailable */ }
    let cancelled = false;
    void getAdminSessionEmail().then(email => {
      if (cancelled) return;
      if (email) {
        setIsAdmin(true);
        if (window.location.pathname === '/manage-portal-9f3a') setPage('admin');
      }
    });
    const client = getSupabaseClient();
    const sub = client?.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      setIsAdmin(isAdminEmail(session?.user?.email));
    });
    return () => {
      cancelled = true;
      sub?.data.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginAdmin = useCallback(async (email: string, password: string) => {
    const err = await signInAdmin(email, password);
    if (!err) {
      setIsAdmin(true); showToast('Admin authenticated'); return null;
    }
    showToast(err, 'error'); return err;
  }, [showToast]);

  const logoutAdmin = useCallback(() => {
    void signOutAdmin();
    setIsAdmin(false); showToast('Logged out');
  }, [showToast]);

  return (
    <AppContext.Provider value={{
      currentPage, setPage, trackingOrderId, selectedProductId, setSelectedProductId,
      products, addProduct, updateProduct, deleteProduct, toggleProduct,
      categories, addCategory, updateCategory, deleteCategory, toggleCategory, brands,
      cart, addToCart, removeFromCart, updateCartQuantity, cartTotal, cartCount, clearCart,
      orders, placeOrder, setOrderFinalDeliveryCharge, updateOrderStatus, deleteOrder, getOrderById, refreshFromCloud,
      customers, deleteCustomer, transportZones, addTransportZone, updateTransportZone, deleteTransportZone,
      marketPrices, updateMarketPrices,
      achievements, addAchievement, deleteAchievement,
      contentBlocks, addContentBlock, updateContentBlock, deleteContentBlock, toggleContentBlock,
      notifications, addNotification, updateNotification, deleteNotification, markNotificationRead, clearNotifications,
      isNotificationSeen, markNotificationSeen, banners,
      siteContent, updateSiteContent, termsContent, updateTermsContent,
      siteSettings, updateSiteSettings,
      isAdmin, loginAdmin, logoutAdmin, adminPage, setAdminPage,
      toasts, showToast, splashDismissed, dismissSplash,
      launchingSoon, setLaunchingSoon,
      launchDateTime, setLaunchDateTime,
      maintenanceMode, setMaintenanceMode,
      maintenanceMessage, setMaintenanceMessage,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
