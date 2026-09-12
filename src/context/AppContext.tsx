import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import type { CartItem, Order, Product, Page, Toast, Customer, TransportZone, ContentBlock, Notification, Banner, SiteContent, Category, Brand, TermsContent, SiteSettings, OrderStatus, AdminPage } from '../types';
import { products as defaultProducts, categories as defaultCategories, brands as defaultBrands, defaultNotifications, defaultSiteContent, defaultTransportZones, defaultBanners, defaultTerms } from '../data';
import { safeSaveSiteContent, compressImageFile } from '../lib/images';
import { pullRemoteContent, pushRemoteContent, fetchRemoteVersion, isCloudConfigured } from '../lib/remoteContent';

interface AppContextType {
  currentPage: Page;
  setPage: (page: Page) => void;
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
  placeOrder: (order: Omit<Order, 'id' | 'date' | 'status' | 'timeline' | 'orderId'>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  deleteOrder: (orderId: string) => void;
  deleteCustomer: (customerId: string) => void;
  getOrderById: (orderId: string) => Order | undefined;
  customers: Customer[];
  transportZones: TransportZone[];
  addTransportZone: (z: TransportZone) => void;
  updateTransportZone: (id: string, updates: Partial<TransportZone>) => void;
  deleteTransportZone: (id: string) => void;
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
  banners: Banner[];
  siteContent: SiteContent;
  updateSiteContent: (updates: Partial<SiteContent>) => void;
  termsContent: TermsContent[];
  updateTermsContent: (id: string, content: string) => void;
  siteSettings: SiteSettings;
  updateSiteSettings: (updates: Partial<SiteSettings>) => void;
  isAdmin: boolean;
  loginAdmin: (email: string, password: string) => boolean;
  logoutAdmin: () => void;
  adminPage: AdminPage;
  setAdminPage: (page: AdminPage) => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error') => void;
  splashDismissed: boolean;
  dismissSplash: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function load<T>(key: string, fallback: T): T {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; }
}
function save(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* */ }
}

function generateOrderId(): string {
  const year = new Date().getFullYear();
  const count = load<number>('hsn_order_count', 0) + 1;
  save('hsn_order_count', count);
  return `HSN-${year}-${String(count).padStart(5, '0')}`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => load('hsn_cart', []));
  const [orders, setOrders] = useState<Order[]>(() => load('hsn_orders', []));
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('hsn_admin') === 'true');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [splashDismissed, setSplashDismissed] = useState(false);
  const [adminPage, setAdminPage] = useState<AdminPage>('overview');

  const [products, setProducts] = useState<Product[]>(() => load('hsn_products', defaultProducts));
  const [categories, setCategories] = useState<Category[]>(() => load('hsn_categories', defaultCategories));
  const [brands] = useState<Brand[]>(() => load('hsn_brands', defaultBrands));
  const [notifications, setNotifications] = useState<Notification[]>(() => load('hsn_notifications', defaultNotifications));
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
  const [banners] = useState<Banner[]>(() => load('hsn_banners', defaultBanners));
  const [transportZones, setTransportZones] = useState<TransportZone[]>(() => load('hsn_transportZones', defaultTransportZones));
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>(() => load('hsn_contentBlocks', []));
  const [termsContent, setTermsContent] = useState<TermsContent[]>(() => load('hsn_terms', defaultTerms));
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => load('hsn_settings', {
    businessName: 'HSN CEMENT AND STEEL', phone: '07989494779', whatsapp: '+91 9179173040',
    email: 'habeebc84@gmail.com', address: 'Kalikiri, AP - 517234', businessHours: '7 AM - 7 PM Daily',
    gstNumber: '37AAAAA0000A1Z5', logo: '/windows-h-logo.png',
  }));
  const [customers, setCustomers] = useState<Customer[]>(() => load('hsn_customers', []));

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = `t-${Date.now()}-${Math.random()}`;
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 2500);
  }, []);

  useEffect(() => { save('hsn_cart', cart); }, [cart]);
  useEffect(() => { save('hsn_orders', orders); }, [orders]);
  useEffect(() => { save('hsn_products', products); }, [products]);
  useEffect(() => { save('hsn_categories', categories); }, [categories]);
  useEffect(() => { save('hsn_notifications', notifications); }, [notifications]);
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
      contentBlocks,
      terms: termsContent,
    };
    void pushRemoteContent(snapshot).then(version => {
      if (version) {
        remoteVersionRef.current = version;
        showToast('Saved — updating on all devices…');
      } else {
        showToast('Cloud sync failed — change stays on this device only', 'error');
      }
    });
  }, [siteContent, siteSettings, products, categories, transportZones, contentBlocks, termsContent, showToast]);

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
      if (json.siteSettings && typeof json.siteSettings === 'object') setSiteSettings(json.siteSettings as SiteSettings);
      if (Array.isArray(json.products)) setProducts(json.products as Product[]);
      if (Array.isArray(json.categories)) setCategories(json.categories as Category[]);
      if (Array.isArray(json.transportZones)) setTransportZones(json.transportZones as TransportZone[]);
      if (Array.isArray(json.contentBlocks)) setContentBlocks(json.contentBlocks as ContentBlock[]);
      if (Array.isArray(json.terms)) setTermsContent(json.terms as TermsContent[]);
    }
  }, []);

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
    const iv = setInterval(check, 10000);
    const onVisible = () => { if (document.visibilityState === 'visible') void check(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      clearInterval(iv);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [applyCloudSnapshot]);
  useEffect(() => { save('hsn_transportZones', transportZones); }, [transportZones]);
  useEffect(() => { save('hsn_contentBlocks', contentBlocks); }, [contentBlocks]);
  useEffect(() => { save('hsn_terms', termsContent); }, [termsContent]);
  useEffect(() => { save('hsn_settings', siteSettings); }, [siteSettings]);
  useEffect(() => { save('hsn_customers', customers); }, [customers]);


  const setPage = useCallback((page: Page) => {
    setCurrentPage(page);
    const rm: Record<Page, string> = {
      home: '/', splash: '/splash', 'welcome-gate': '/', products: '/products', 'product-detail': '/product',
      services: '/services', gallery: '/gallery', about: '/about',
      contact: '/contact', checkout: '/checkout', 'order-success': '/order-success', 'order-tracking': '/track-order',
      terms: '/terms', 'admin-login': '/manage-portal-9f3a', admin: '/manage-portal-9f3a',
    };
    const path = rm[page] || '/';
    if (window.location.pathname !== path) window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const dismissSplash = useCallback(() => {
    setSplashDismissed(true);
    localStorage.setItem('hsn_splash_dismissed', 'true');
  }, []);

  const addProduct = useCallback((p: Product) => { localEditRef.current = true; setProducts(prev => [...prev, p]); showToast('Product added'); }, [showToast]);
  const updateProduct = useCallback((id: string, updates: Partial<Product>) => { localEditRef.current = true; setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p)); showToast('Product updated'); }, [showToast]);
  const deleteProduct = useCallback((id: string) => { localEditRef.current = true; setProducts(prev => prev.filter(p => p.id !== id)); showToast('Product deleted'); }, [showToast]);
  const toggleProduct = useCallback((id: string) => { localEditRef.current = true; setProducts(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p)); }, []);

  const addCategory = useCallback((c: Category) => { localEditRef.current = true; setCategories(prev => [...prev, c]); showToast('Category added'); }, [showToast]);
  const updateCategory = useCallback((id: string, updates: Partial<Category>) => { localEditRef.current = true; setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c)); showToast('Category updated'); }, [showToast]);
  const deleteCategory = useCallback((id: string) => { localEditRef.current = true; setCategories(prev => prev.filter(c => c.id !== id)); showToast('Category deleted'); }, [showToast]);
  const toggleCategory = useCallback((id: string) => { localEditRef.current = true; setCategories(prev => prev.map(c => c.id === id ? { ...c, enabled: c.enabled === false ? true : false } : c)); }, []);

  const addToCart = useCallback((product: Product, quantity: number, selectedSize?: string) => {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === product.id && i.selectedSize === selectedSize);
      if (ex) return prev.map(i => i.product.id === product.id && i.selectedSize === selectedSize ? { ...i, quantity: i.quantity + quantity } : i);
      return [...prev, { product, quantity, selectedSize }];
    });
    showToast(`Added "${product.name}" to cart`);
  }, [showToast]);

  const removeFromCart = useCallback((productId: string, selectedSize?: string) => {
    setCart(prev => prev.filter(i => !(i.product.id === productId && i.selectedSize === selectedSize)));
  }, []);

  const updateCartQuantity = useCallback((productId: string, quantity: number, selectedSize?: string) => {
    if (quantity <= 0) { removeFromCart(productId, selectedSize); return; }
    setCart(prev => prev.map(i => i.product.id === productId && i.selectedSize === selectedSize ? { ...i, quantity } : i));
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
  }, [clearCart, showToast]);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus, note?: string) => {
    setOrders(prev => {
      const updated = prev.map(o => o.orderId === orderId ? { ...o, status, timeline: [...o.timeline, { status, date: new Date().toISOString(), note }] } : o);
      save('hsn_orders', updated);
      return updated;
    });
    showToast(`Order ${orderId} updated to ${status}`);
  }, [showToast]);

  const deleteOrder = useCallback((orderId: string) => { setOrders(prev => { const u = prev.filter(o => o.orderId !== orderId); save('hsn_orders', u); return u; }); showToast('Order deleted'); }, [showToast]);
  const deleteCustomer = useCallback((customerId: string) => { setCustomers(prev => { const u = prev.filter(c => c.id !== customerId); save('hsn_customers', u); return u; }); showToast('Customer deleted'); }, [showToast]);
  const getOrderById = useCallback((orderId: string) => orders.find(o => o.orderId === orderId), [orders]);

  const addTransportZone = useCallback((z: TransportZone) => { localEditRef.current = true; setTransportZones(prev => [...prev, z]); showToast('Zone added'); }, [showToast]);
  const updateTransportZone = useCallback((id: string, updates: Partial<TransportZone>) => { localEditRef.current = true; setTransportZones(prev => prev.map(z => z.id === id ? { ...z, ...updates } : z)); showToast('Zone updated'); }, [showToast]);
  const deleteTransportZone = useCallback((id: string) => { localEditRef.current = true; setTransportZones(prev => prev.filter(z => z.id !== id)); showToast('Zone deleted'); }, [showToast]);

  const addContentBlock = useCallback((b: ContentBlock) => { localEditRef.current = true; setContentBlocks(prev => [...prev, b]); showToast('Content added'); }, [showToast]);
  const updateContentBlock = useCallback((id: string, updates: Partial<ContentBlock>) => { localEditRef.current = true; setContentBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b)); showToast('Content updated'); }, [showToast]);
  const deleteContentBlock = useCallback((id: string) => { localEditRef.current = true; setContentBlocks(prev => prev.filter(b => b.id !== id)); showToast('Content deleted'); }, [showToast]);
  const toggleContentBlock = useCallback((id: string) => { localEditRef.current = true; setContentBlocks(prev => prev.map(b => b.id === id ? { ...b, active: !b.active } : b)); }, []);

  const addNotification = useCallback((n: Notification) => { setNotifications(prev => { const u = [n, ...prev]; save('hsn_notifications', u); return u; }); }, []);
  const updateNotification = useCallback((id: string, updates: Partial<Notification>) => { setNotifications(prev => { const u = prev.map(n => n.id === id ? { ...n, ...updates } : n); save('hsn_notifications', u); return u; }); showToast('Notification updated'); }, [showToast]);
  const deleteNotification = useCallback((id: string) => { setNotifications(prev => { const u = prev.filter(n => n.id !== id); save('hsn_notifications', u); return u; }); showToast('Notification deleted'); }, [showToast]);
  const markNotificationRead = useCallback((id: string) => { setNotifications(prev => { const u = prev.map(n => n.id === id ? { ...n, read: true } : n); save('hsn_notifications', u); return u; }); }, []);
  const clearNotifications = useCallback(() => { setNotifications(prev => { const u = prev.map(n => ({ ...n, read: true })); save('hsn_notifications', u); return u; }); }, []);

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
    setSiteContent(prev => ({ ...prev, ...updates }));
    Promise.all(pending).catch(() => {});
    showToast('Site content updated');
  }, [showToast]);
  const updateTermsContent = useCallback((id: string, content: string) => { localEditRef.current = true; setTermsContent(prev => prev.map(t => t.id === id ? { ...t, content, lastUpdated: new Date().toISOString() } : t)); showToast('Terms updated'); }, [showToast]);
  const updateSiteSettings = useCallback((updates: Partial<SiteSettings>) => { localEditRef.current = true; setSiteSettings(prev => ({ ...prev, ...updates })); showToast('Settings updated'); }, [showToast]);

  const loginAdmin = useCallback((email: string, password: string) => {
    const storedPassword = localStorage.getItem('hsn_admin_password') || 'admin123';
    if (email === 'habeebc84@gmail.com' && password === storedPassword) {
      setIsAdmin(true); localStorage.setItem('hsn_admin', 'true'); showToast('Admin authenticated'); return true;
    }
    showToast('Invalid credentials', 'error'); return false;
  }, [showToast]);

  const logoutAdmin = useCallback(() => { setIsAdmin(false); localStorage.removeItem('hsn_admin'); showToast('Logged out'); }, [showToast]);

  return (
    <AppContext.Provider value={{
      currentPage, setPage, selectedProductId, setSelectedProductId,
      products, addProduct, updateProduct, deleteProduct, toggleProduct,
      categories, addCategory, updateCategory, deleteCategory, toggleCategory, brands,
      cart, addToCart, removeFromCart, updateCartQuantity, cartTotal, cartCount, clearCart,
      orders, placeOrder, updateOrderStatus, deleteOrder, getOrderById,
      customers, deleteCustomer, transportZones, addTransportZone, updateTransportZone, deleteTransportZone,
      contentBlocks, addContentBlock, updateContentBlock, deleteContentBlock, toggleContentBlock,
      notifications, addNotification, updateNotification, deleteNotification, markNotificationRead, clearNotifications, banners,
      siteContent, updateSiteContent, termsContent, updateTermsContent,
      siteSettings, updateSiteSettings,
      isAdmin, loginAdmin, logoutAdmin, adminPage, setAdminPage,
      toasts, showToast, splashDismissed, dismissSplash,
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
